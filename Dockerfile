FROM node:20-slim

ARG service_src

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY ${service_src} ./service

COPY ./common ./common

CMD [ "npm", "run", "start" ]
