FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY . .
RUN npm ci --quiet && npm run tsc

FROM node:lts-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --quiet --only=production

## We just need the build to execute the command
COPY --from=builder /usr/src/app/dist ./dist

CMD ["npm", "run", "start"]

# FROM node:14-alpine3.10 as ts-compiler
# WORKDIR /usr/app
# COPY package*.json ./
# COPY tsconfig*.json ./
# RUN npm install
# COPY . .
# RUN npm run tsc

# FROM node:14-alpine3.10 as ts-remover
# WORKDIR /usr/app
# COPY --from=ts-compiler /usr/app/package*.json ./
# COPY --from=ts-compiler /usr/app/dist ./
# RUN npm install --only=production

# FROM gcr.io/distroless/nodejs:14
# WORKDIR /usr/app
# COPY --from=ts-remover /usr/app .
# USER 1000
# CMD ["dist/server.js"]