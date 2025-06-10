# Production Dockerfile for Next.js Application
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 3: Production runner
FROM node:18-alpine AS runner

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create .next directory and set permissions
RUN mkdir -p .next && chown -R nextjs:nodejs .next

# Security hardening
RUN apk --no-cache add dumb-init && \
    apk --no-cache del wget curl && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/* && \
    chmod -R 755 /app && \
    find /app -type f -name "*.sh" -exec chmod +x {} \;

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]