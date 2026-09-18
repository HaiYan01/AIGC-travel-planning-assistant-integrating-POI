FROM node:20-alpine AS builder

WORKDIR /app

# Build frontend
COPY web/package*.json ./web/
RUN cd web && npm ci
COPY web/ ./web/
RUN cd web && npm run build

# Build backend
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/

# Production image
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/server ./server
COPY --from=builder /app/web/dist ./web/dist

WORKDIR /app/server

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/index.js"]
