# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY apps/web/package.json ./
RUN npm pkg delete devDependencies["@rollup/rollup-win32-x64-msvc"] && npm install --no-package-lock
COPY apps/web ./
RUN npm run build

# Runtime stage - serve static files + proxy /api/ to backend
FROM node:20-alpine
WORKDIR /app
RUN npm init -y && npm pkg set type=module && npm install express http-proxy-middleware
COPY --from=builder /app/dist ./dist
COPY apps/web/proxy-server.js ./proxy-server.js
EXPOSE 80
ENV PORT=80
ENV BACKEND_URL=http://backend:3000
CMD ["node", "proxy-server.js"]