# syntax=docker/dockerfile:1
FROM node:18-alpine

ENV NODE_ENV=production

WORKDIR /chatMixologist

COPY ["package.json", "package-lock.json", "index.html", "./"]

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "app.js"]