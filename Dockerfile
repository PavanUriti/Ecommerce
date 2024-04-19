FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

COPY .env ./

EXPOSE 3000

CMD ["node", "index.js"]
