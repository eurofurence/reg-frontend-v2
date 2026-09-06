#!/bin/sh
set -e

# Defaults so envsubst can use plain ${VAR} placeholders
: "${NGINX_CONF_SERVER_NAME:=localhost}"
: "${NGINX_CONF_PATH_PREFIX:=}"
: "${NGINX_CONF_MAINTENANCE:=}"
: "${NGINX_CONF_OFFLINE:=}"
export NGINX_CONF_SERVER_NAME NGINX_CONF_PATH_PREFIX NGINX_CONF_MAINTENANCE NGINX_CONF_OFFLINE

# Render config at container start so the env vars take effect at runtime
envsubst '${NGINX_CONF_SERVER_NAME} ${NGINX_CONF_PATH_PREFIX} ${NGINX_CONF_MAINTENANCE} ${NGINX_CONF_OFFLINE}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
