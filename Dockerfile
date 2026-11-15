# Build stage
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM nginx:alpine AS runner

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Maintenance page served when NGINX_CONF_MAINTENANCE is set
COPY docker/maintenance.html /usr/share/nginx/html/maintenance.html

# Offline page served when NGINX_CONF_MAINTENANCE is set
COPY docker/offline.html /usr/share/nginx/html/offline.html

# Nginx config is rendered at container start so env vars take effect at runtime
COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY docker/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Ensure nginx user owns required directories (nginx user already exists in nginx:alpine)
RUN mkdir -p /var/cache/nginx/proxy && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chmod 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 8080 - unprivileged containers may not open privileged ports
EXPOSE 8080

# Render config from env, then start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
