# Multi-stage Dockerfile for CycloneDX SCA Visualizer (Production SPA)
# Stage 1: Build static assets
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package manifests & install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Serve static bundle via Nginx (Unprivileged, Hardened)
FROM nginx:alpine-slim

# Prepare Nginx directories and PID file for unprivileged execution
RUN touch /var/run/nginx.pid && \
    mkdir -p /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

USER nginx

CMD ["nginx", "-g", "daemon off;"]
