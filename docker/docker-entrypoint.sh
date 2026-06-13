#!/bin/sh
set -e

# Defaults so envsubst can use plain ${VAR} placeholders
: "${NGINX_CONF_SERVER_NAME:=localhost}"
: "${NGINX_CONF_PATH_PREFIX:=}"
: "${NGINX_CONF_MAINTENANCE:=}"
export NGINX_CONF_SERVER_NAME NGINX_CONF_PATH_PREFIX NGINX_CONF_MAINTENANCE

# Render config at container start so the env vars take effect at runtime
envsubst '${NGINX_CONF_SERVER_NAME} ${NGINX_CONF_PATH_PREFIX} ${NGINX_CONF_MAINTENANCE}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
