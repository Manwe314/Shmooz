# FROM node:23-alpine-slim@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc AS builder

# WORKDIR /app

# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install

# COPY . .

# RUN npm run build

# FROM node:23-alpine-slim@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc

# WORKDIR /app

# COPY --from=builder /app/dist /app/dist
# COPY --from=builder /app/package*.json ./

# RUN npm install --omit=dev

# EXPOSE 4000

# CMD ["node", "dist/frontend/server/server.mjs"]

#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

FROM node:23-alpine-slim@sha256:86703151a18fcd06258e013073508c4afea8e19cd7ed451554221dd00aea83fc

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm i --save-dev @types/compression

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
