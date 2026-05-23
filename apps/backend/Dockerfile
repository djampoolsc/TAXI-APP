# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY tsconfig.json /tsconfig.json
COPY apps/backend/package*.json ./
RUN npm install
COPY apps/backend ./
RUN npm run build
RUN mkdir -p dist/config && cp src/config/schema.sql dist/config/schema.sql

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]