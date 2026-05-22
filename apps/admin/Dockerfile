# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package-lock.json ./
COPY package.json ./
COPY apps/admin ./apps/admin
RUN npm install --legacy-peer-deps --no-save
RUN npm run build -w apps/admin

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin ./.next ./.next
COPY --from=builder /app/apps/admin/package.json ./
EXPOSE 3001
CMD ["node_modules/.bin/next", "start"]
