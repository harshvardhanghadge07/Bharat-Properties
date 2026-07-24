FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Vite bakes VITE_* vars into the bundle at build time, and .env is excluded
# from the build context by .dockerignore — so these must be passed in as
# build args (see docker-compose.yml) rather than read from a .env file here.
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_WHATSAPP_NUMBER
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

RUN npm run build

FROM nginx:alpine
# Install envsubst (part of gettext) to substitute env vars in nginx.conf at runtime
RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
# Copy template config — envsubst will process it at startup
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

# At startup: substitute BACKEND_URL (and NGINX_PORT) then launch nginx
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL} ${NGINX_PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

