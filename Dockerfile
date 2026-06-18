FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
COPY --from=frontend-build /app/client/dist ./client/dist

RUN mkdir -p /data
ENV DB_PATH=/data/vehicles.db

EXPOSE 3000
CMD ["node", "src/server.js"]
