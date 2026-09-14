# ==========================================
# 1. Build Stage
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Cài đặt dependencies trước để tối ưu caching layer Docker
COPY package*.json ./
RUN npm ci

# Copy source code và build
COPY . .
RUN npm run build

# ==========================================
# 2. Production Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy dependencies và build artifacts
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Expose port (Render sử dụng 10000 hoặc PORT từ môi trường)
EXPOSE 3000 10000

CMD ["node", "dist/main"]
