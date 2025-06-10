Run the script 
infrastructure/scripts/setup-frontend-infrastructure.sh

# Create a service principal for your GitHub Actions
# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
# Check what subscription ID you captured
echo $SUBSCRIPTION_ID

az ad sp create-for-rbac \
  --name "github-actions-resmatcha-frontend" \
  --role contributor \
  --scopes /subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-resmatcha-frontend \
  --sdk-auth
Step 1: Verify your subscription ID
bash# Check what subscription ID you captured
echo $SUBSCRIPTION_ID
Step 2: Create the service principal with the actual subscription ID
bash# Use the variable you already set
az ad sp create-for-rbac \
  --name "github-actions-resmatcha-frontend" \
  --role contributor \
  --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-resmatcha-frontend \
  --sdk-auth
Alternative: One-liner approach
If the variable didn't work, you can do it in one command:
bashaz ad sp create-for-rbac \
  --name "github-actions-resmatcha-frontend" \
  --role contributor \
  --scopes /subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-resmatcha-frontend \
  --sdk-auth


This will output JSON like:
json{
  "clientId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "clientSecret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "subscriptionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
Copy this entire JSON output and set it as the AZURE_CREDENTIALS secret.

Additional Permissions Needed
The service principal needs additional permissions to push to ACR. Run this command:
bash# Get your subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Grant ACR push permissions to the service principal
az role assignment create \
  --role "AcrPush" \
  --assignee "CLIENT_ID_FROM_AZURE_CREDENTIALS" \
  --scope /subscriptions/$SUBSCRIPTION_ID/resourceGroups/rg-resmatcha/providers/Microsoft.ContainerRegistry/registries/resmatchaacr