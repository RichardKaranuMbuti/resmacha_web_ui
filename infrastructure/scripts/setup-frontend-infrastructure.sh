#!/bin/bash
# infrastructure/scripts/setup-frontend-infrastructure.sh
# Frontend infrastructure setup with Azure App Service

set -e

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    ENV_FILE=".env"
elif [ -f "../../.env" ]; then
    ENV_FILE="../../.env"
else
    ENV_FILE=""
fi

if [ -n "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE..."
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "No .env file found. Continuing with default values."
fi

# Variables
FRONTEND_RESOURCE_GROUP="rg-resmatcha-frontend"
BACKEND_RESOURCE_GROUP="rg-resmatcha"  # Reference to backend resource group
LOCATION="eastus"
ACR_NAME="resmatchaacr"  # Shared ACR from backend
APP_SERVICE_PLAN_NAME="resmatcha-frontend-plan"
WEB_APP_NAME="resmatcha-frontend"  # This will create resmatcha-frontend.azurewebsites.net

echo "=== Setting up Frontend Azure Infrastructure ==="

# Clean up existing Container Apps resources if they exist
echo "Checking for existing Container Apps resources to clean up..."

# Check and delete Container App
if az containerapp show --name resmatcha-frontend-app --resource-group $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "Found existing Container App 'resmatcha-frontend-app'. Deleting..."
    az containerapp delete \
      --name resmatcha-frontend-app \
      --resource-group $FRONTEND_RESOURCE_GROUP \
      --yes
    echo "Container App deleted."
fi

# Check and delete Container Apps Environment
if az containerapp env show --name resmatcha-frontend-env --resource-group $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "Found existing Container Apps Environment 'resmatcha-frontend-env'. Deleting..."
    az containerapp env delete \
      --name resmatcha-frontend-env \
      --resource-group $FRONTEND_RESOURCE_GROUP \
      --yes
    echo "Container Apps Environment deleted."
fi

# Check and delete Log Analytics Workspace (only if used by Container Apps)
if az monitor log-analytics workspace show --workspace-name resmatcha-frontend-logs --resource-group $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "Found existing Log Analytics Workspace 'resmatcha-frontend-logs'. Deleting..."
    az monitor log-analytics workspace delete \
      --workspace-name resmatcha-frontend-logs \
      --resource-group $FRONTEND_RESOURCE_GROUP \
      --yes --force
    echo "Log Analytics Workspace deleted."
fi

echo "Container Apps cleanup complete."

# Create frontend resource group
echo "Checking/Creating Frontend Resource Group..."
if az group show --name $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "Frontend Resource Group '$FRONTEND_RESOURCE_GROUP' already exists."
    EXISTING_LOCATION=$(az group show --name $FRONTEND_RESOURCE_GROUP --query location -o tsv)
    echo "Using existing location: $EXISTING_LOCATION"
    LOCATION=$EXISTING_LOCATION
else
    echo "Creating Frontend Resource Group..."
    az group create --name $FRONTEND_RESOURCE_GROUP --location $LOCATION
fi

# Verify ACR exists in backend resource group
echo "Verifying shared ACR exists..."
if ! az acr show --name $ACR_NAME --resource-group $BACKEND_RESOURCE_GROUP &> /dev/null; then
    echo "ERROR: Shared ACR '$ACR_NAME' not found in backend resource group '$BACKEND_RESOURCE_GROUP'"
    echo "Please run the backend infrastructure setup first."
    exit 1
fi
echo "Shared ACR '$ACR_NAME' verified."

# Create App Service Plan
echo "Checking/Creating App Service Plan..."
if az appservice plan show --name $APP_SERVICE_PLAN_NAME --resource-group $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "App Service Plan '$APP_SERVICE_PLAN_NAME' already exists."
    # Check if it's the right SKU and OS
    CURRENT_SKU=$(az appservice plan show --name $APP_SERVICE_PLAN_NAME --resource-group $FRONTEND_RESOURCE_GROUP --query sku.name -o tsv)
    CURRENT_OS=$(az appservice plan show --name $APP_SERVICE_PLAN_NAME --resource-group $FRONTEND_RESOURCE_GROUP --query reserved -o tsv)
    
    if [ "$CURRENT_SKU" != "B1" ] || [ "$CURRENT_OS" != "true" ]; then
        echo "Existing App Service Plan has different configuration (SKU: $CURRENT_SKU, Linux: $CURRENT_OS)."
        echo "Deleting existing plan to recreate with correct settings..."
        az appservice plan delete \
          --name $APP_SERVICE_PLAN_NAME \
          --resource-group $FRONTEND_RESOURCE_GROUP \
          --yes
        echo "Creating new App Service Plan..."
        az appservice plan create \
          --name $APP_SERVICE_PLAN_NAME \
          --resource-group $FRONTEND_RESOURCE_GROUP \
          --location $LOCATION \
          --sku B1 \
          --is-linux
    fi
else
    echo "Creating App Service Plan..."
    az appservice plan create \
      --name $APP_SERVICE_PLAN_NAME \
      --resource-group $FRONTEND_RESOURCE_GROUP \
      --location $LOCATION \
      --sku B1 \
      --is-linux
fi

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $BACKEND_RESOURCE_GROUP --query loginServer -o tsv)

# Create Web App
echo "Checking/Creating Web App..."
if az webapp show --name $WEB_APP_NAME --resource-group $FRONTEND_RESOURCE_GROUP &> /dev/null; then
    echo "Web App '$WEB_APP_NAME' already exists."
    # Check if it's properly configured for containers
    CURRENT_STACK=$(az webapp config show --name $WEB_APP_NAME --resource-group $FRONTEND_RESOURCE_GROUP --query linuxFxVersion -o tsv 2>/dev/null || echo "")
    
    if [[ ! "$CURRENT_STACK" =~ ^DOCKER\| ]]; then
        echo "Web App exists but is not configured for Docker containers."
        echo "Updating Web App configuration for containers..."
        az webapp config set \
          --name $WEB_APP_NAME \
          --resource-group $FRONTEND_RESOURCE_GROUP \
          --linux-fx-version "DOCKER|nginx:alpine"
    fi
else
    echo "Creating Web App..."
    az webapp create \
      --name $WEB_APP_NAME \
      --resource-group $FRONTEND_RESOURCE_GROUP \
      --plan $APP_SERVICE_PLAN_NAME \
      --deployment-container-image-name nginx:alpine
fi

# Enable system-assigned managed identity
echo "Enabling managed identity..."
az webapp identity assign \
  --name $WEB_APP_NAME \
  --resource-group $FRONTEND_RESOURCE_GROUP

# Get the managed identity principal ID
WEB_APP_IDENTITY=$(az webapp identity show \
  --name $WEB_APP_NAME \
  --resource-group $FRONTEND_RESOURCE_GROUP \
  --query principalId -o tsv)

# Assign ACR Pull role to the web app's managed identity
ACR_SCOPE=$(az acr show --name $ACR_NAME --resource-group $BACKEND_RESOURCE_GROUP --query id -o tsv)
az role assignment create \
  --role "AcrPull" \
  --assignee-object-id $WEB_APP_IDENTITY \
  --assignee-principal-type ServicePrincipal \
  --scope $ACR_SCOPE \
  2>/dev/null || echo "ACR role assignment may already exist"

# Configure ACR integration
echo "Configuring ACR integration..."
az webapp config container set \
  --name $WEB_APP_NAME \
  --resource-group $FRONTEND_RESOURCE_GROUP \
  --docker-custom-image-name nginx:alpine \
  --docker-registry-server-url https://$ACR_LOGIN_SERVER

# Enable ACR managed identity authentication
echo "Enabling ACR managed identity authentication..."
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $FRONTEND_RESOURCE_GROUP \
  --settings \
    DOCKER_REGISTRY_SERVER_URL=https://$ACR_LOGIN_SERVER \
    WEBSITES_PORT=3000 \
    PORT=3000

# Wait a moment for the identity to be fully propagated
echo "Waiting for managed identity to be fully propagated..."
sleep 10

# Get Web App URL
WEB_APP_URL="https://${WEB_APP_NAME}.azurewebsites.net"

echo "Frontend infrastructure setup complete!"
echo ""
echo "=== CLEANUP PERFORMED ==="
echo "- Removed any existing Container Apps resources"
echo "- Removed Container Apps Environment"
echo "- Removed dedicated Log Analytics Workspace"
echo ""
echo "=== IMPORTANT VALUES FOR DEPLOYMENT ==="
echo "FRONTEND_RESOURCE_GROUP: $FRONTEND_RESOURCE_GROUP"
echo "WEB_APP_NAME: $WEB_APP_NAME"
echo "APP_SERVICE_PLAN_NAME: $APP_SERVICE_PLAN_NAME"
echo "ACR_NAME: $ACR_NAME (shared with backend)"
echo "ACR_LOGIN_SERVER: $ACR_LOGIN_SERVER"
echo "WEB_APP_URL: $WEB_APP_URL"
echo ""
echo "=== CONFIGURATION STATUS ==="
echo "✅ Resource Group: $FRONTEND_RESOURCE_GROUP"
echo "✅ App Service Plan: $APP_SERVICE_PLAN_NAME (B1, Linux)"
echo "✅ Web App: $WEB_APP_NAME (Container-enabled)"
echo "✅ Managed Identity: Enabled with ACR Pull permissions"
echo "✅ ACR Integration: Configured"
echo ""
echo "Next steps:"
echo "1. Update your GitHub Actions workflow to use App Service deployment"
echo "2. Set up your Next.js Dockerfile"
echo "3. Push your code to trigger the deployment pipeline"
echo "4. Your app will be available at: $WEB_APP_URL"
echo ""
echo "NOTE: The old Container Apps resources have been cleaned up."
echo "Your deployment will now use the cleaner .azurewebsites.net URL format."