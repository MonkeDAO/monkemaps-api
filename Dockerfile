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