# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY tsconfig.json ./
COPY package.json package-lock.json ./
COPY apps/backend ./apps/backend
RUN npm install --legacy-peer-deps --no-save
RUN npm run build -w apps/backend

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
