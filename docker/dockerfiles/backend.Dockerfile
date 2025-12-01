# Multi-stage production Dockerfile for Backend API

# --- Stage 1: Builder (install + compile + prune) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Toolchain for packages that need native builds (sqlite3, bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Install all dependencies (prod + dev) for building
COPY backend/package*.json ./
RUN npm ci

# Copy source code and build TypeScript to dist
COPY backend/ .
RUN npm run build

# Remove devDependencies to slim down the runtime payload
RUN npm prune --production && npm cache clean --force


# --- Stage 2: Runtime (copy only what we need) ---
FROM node:20-alpine AS runner

WORKDIR /app

# curl is needed for container healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV NODE_OPTIONS="--require module-alias/register"

# Copy production artefacts from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Non-root user hardening + writable logs folder
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001 -G nodejs \
    && mkdir -p /app/logs \
    && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "-r", "module-alias/register", "dist/server.js"]