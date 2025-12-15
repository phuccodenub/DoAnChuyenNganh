# Frontend Development Dockerfile (Vite dev server)
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

# Copy package files so the container has a minimal context even before volume mounts
COPY frontend/package*.json ./

EXPOSE 5174

CMD ["/bin/sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5174"]
