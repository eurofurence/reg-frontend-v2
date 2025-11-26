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

# Copy nginx configuration for SPA routing with environment variable substitution
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf.template
RUN envsubst '${NGINX_CONF_SERVER_NAME} ${NGINX_CONF_PATH_PREFIX}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Create nginx user and change ownership of nginx directories
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid && \
    chmod 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
