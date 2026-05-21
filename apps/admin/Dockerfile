# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY apps/admin ./apps/admin
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN pnpm -C apps/admin build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin ./.next ./.next
COPY --from=builder /app/apps/admin/package.json ./
EXPOSE 3001
CMD ["node_modules/.bin/next", "start"]
