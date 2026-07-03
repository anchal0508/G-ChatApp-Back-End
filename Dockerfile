FROM node:20-alpine AS base

WORKDIR /usr/src/service

COPY package*.json ./

RUN npm ci --only=production

COPY . .

USER node

EXPOSE 3000

CMD [ "node", "server.js" ]
