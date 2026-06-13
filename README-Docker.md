# Docker Setup

This project includes Docker support for easy deployment and development.

## Building the Docker Image

### Using Docker directly

```bash
# Build the image
docker build -t eurofurence-reg-frontend .

# Run the container
docker run -p 8000:80 eurofurence-reg-frontend
```

### Using Docker Compose (recommended)

```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the container
docker-compose down
```

## Accessing the Application

Once the container is running, access the application at:

- **<http://localhost:8000>**

## Docker Configuration

### Multi-stage Build

The Dockerfile uses a multi-stage build:

1. **Builder stage**: Uses `oven/bun` to install dependencies and build the application
2. **Production stage**: Uses `nginx:alpine` to serve the built static files

### Key Features

- **SPA Routing Support**: Nginx is configured to handle client-side routing
- **Static Asset Caching**: JS/CSS/images are cached for 1 year
- **Health Checks**: Basic health check using curl
- **Small Image Size**: Alpine-based nginx for minimal footprint

### Environment Variables

These are read at **container start** (nginx config is rendered from a template by the entrypoint):

- `NODE_ENV=production` - Set for production builds
- `NGINX_CONF_SERVER_NAME` - nginx `server_name` (default `localhost`)
- `NGINX_CONF_PATH_PREFIX` - path prefix used in the proxy locations **and** substituted into served HTML/JS/CSS in place of the `__PATH_PREFIX__` token (`sub_filter`). The frontend build must emit `__PATH_PREFIX__` wherever the deploy prefix belongs.
- `NGINX_CONF_MAINTENANCE` - when non-empty (e.g. `on`), all SPA routes return `503` with `maintenance.html`. Unset/empty = normal operation. Toggle by restarting the container with a different value.

## Development vs Production

- **Development**: Use `bun run dev` for hot reloading
- **Production**: Use Docker for optimized static file serving

## Troubleshooting

### Build Issues

```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t eurofurence-reg-frontend .
```

### Container Issues

```bash
# Check container logs
docker-compose logs app

# Access container shell
docker-compose exec app sh
```
