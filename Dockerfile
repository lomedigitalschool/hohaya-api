FROM node:24-alpine

WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

RUN npm i -g typescript

EXPOSE 5000

CMD ["npm", "run", "dev"]