# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY tsconfig.json ./
COPY package.json package-lock.json ./
COPY apps/web ./apps/web
COPY infra/nginx.conf ./infra/
RUN npm install --legacy-peer-deps --no-save
RUN npm run build -w apps/web

# Runtime stage
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
