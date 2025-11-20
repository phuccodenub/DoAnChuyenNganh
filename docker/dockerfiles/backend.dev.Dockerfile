# Development Dockerfile for Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks and other dev tools
RUN apk add --no-cache curl postgresql-client

# Copy package files
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for development)
RUN npm install

# Copy source code
COPY backend/ .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=5 \
  CMD curl -f http://127.0.0.1:3000/health || exit 1

# Start the application in development mode
CMD ["npm", "run", "dev"]