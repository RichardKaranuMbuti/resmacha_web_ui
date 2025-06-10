# --- Base image for all stages ---
FROM node:18-alpine AS base
LABEL maintainer="resmatcha-team"
LABEL description="Next.js Frontend Application"

# Install dependencies needed for all stages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# --- Dependencies stage ---
FROM base AS deps

# Copy only the package files to install dependencies
COPY package.json package-lock.json* ./

# Install ALL dependencies including devDependencies
RUN npm ci --frozen-lockfile

# --- Builder stage ---
FROM base AS builder

# Copy installed node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy only necessary files to build the app
COPY public ./public
COPY src ./src
COPY next.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY .env ./
COPY middleware.ts ./
COPY next-env.d.ts ./
COPY eslint.config.mjs ./

# Environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# --- Runner stage for production ---
FROM base AS runner

# Install curl for health checks
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy only what is needed for running the app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set ownership and permissions
RUN chown -R nextjs:nodejs /app

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]
