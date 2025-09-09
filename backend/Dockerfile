# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# install deps
COPY package*.json ./
RUN npm ci --production

# copy source
COPY . .

# ensure node listens on all interfaces
ENV PORT=8000
EXPOSE 8000

CMD ["node", "server.js"]
