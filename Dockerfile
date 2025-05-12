FROM node:lts-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build

FROM node:lts-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=80
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json ./
EXPOSE 80
CMD ["sh", "-c", "node .output/server/index.mjs"]
LABEL org.opencontainers.image.source=https://github.com/Git-Commit-Therapy/vue-frontend
