# frontend/Dockerfile (Vite/React)
FROM node:20-alpine AS builder
WORKDIR /app

# install deps
COPY package*.json yarn.lock* pnpm-lock.yaml* ./
# adjust depending on package manager - npm ci is safe
RUN npm ci

# copy source & build
COPY . .
# build-time API base (passed in docker-compose)
ARG VITE_API_BASE="/api"
ENV VITE_API_BASE=${VITE_API_BASE}
RUN npm run build

# ---------- NGINX stage ----------
FROM nginx:stable-alpine
# remove default conf to avoid warnings
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy build output (Vite outputs to /dist)
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
