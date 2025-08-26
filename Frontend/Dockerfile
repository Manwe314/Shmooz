FROM node:23-alpine-slim@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc AS builder

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent && \
    npm cache clean --force

COPY . .

RUN npm run build

FROM node:23-alpine-slim@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc AS production

RUN apk add --no-cache \
    dumb-init \
    tini \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs && \
    adduser -S angular -u 1001 -G nodejs

WORKDIR /app

COPY --from=builder --chown=angular:nodejs /app/dist ./dist
COPY --from=builder --chown=angular:nodejs /app/package*.json ./

RUN npm ci --only=production --silent && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

USER angular

RUN mkdir -p /tmp/angular && \
    chown angular:nodejs /tmp/angular

ENV NODE_ENV=production
ENV PORT=4000
ENV HOST=0.0.0.0

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

EXPOSE 4000

ENTRYPOINT ["tini", "--"]

CMD ["node", "dist/frontend/server/server.mjs"]
