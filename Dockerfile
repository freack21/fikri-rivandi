# Static portfolio: build the Vite SPA with Node, serve dist/ with an unprivileged nginx.
# Override the base images with --build-arg (e.g. mirror.gcr.io/library/...) if Docker Hub rate-limits the build server.
ARG NODE_IMAGE=node:22-alpine
ARG NGINX_IMAGE=nginx:stable-alpine

FROM ${NODE_IMAGE} AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM ${NGINX_IMAGE} AS runtime
RUN rm -f /etc/nginx/conf.d/default.conf && rm -rf /usr/share/nginx/html/*
COPY deploy/nginx/nginx.conf /etc/nginx/nginx.conf
# Site files stay root-owned and read-only; nginx only writes to /tmp (pid, temp paths).
COPY --from=build /app/dist /usr/share/nginx/html
# The official image runs the master process as root; run everything as the unprivileged "nginx" user (uid 101).
USER nginx
EXPOSE 8080
STOPSIGNAL SIGQUIT
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["wget", "-q", "-O", "/dev/null", "http://127.0.0.1:8080/healthz"]
CMD ["nginx", "-g", "daemon off;"]
