# Lightweight Development Dockerfile for Backend
# node_modules sẽ được mount từ host hoặc tạo bởi start script
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development

# Chỉ cài tools hệ thống cần thiết (curl cho healthcheck, pg-client cho DB scripts)
RUN apk add --no-cache curl postgresql-client libreoffice


# KHÔNG copy node_modules hay cài npm install ở đây
# Vì docker-compose đã mount volume: ../../../backend:/app
# node_modules sẽ được cài bởi start-backend-dev.sh script

# Copy package files (để start script biết cần cài gì)
COPY backend/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=5 \
  CMD curl -f http://127.0.0.1:3000/health || exit 1

# Script sẽ kiểm tra và cài node_modules nếu cần, rồi chạy dev server
CMD ["/bin/sh", "-c", "tr -d '\\r' < /app/start-backend-dev.sh > /tmp/start-backend-dev.sh && chmod +x /tmp/start-backend-dev.sh && /bin/sh /tmp/start-backend-dev.sh"]