# syntax=docker/dockerfile:1.4

FROM node:23.5.0-alpine AS development

WORKDIR /app
COPY package*.json /app/

COPY . /app

RUN npm i && npm run build


EXPOSE 5000

CMD [ "npm", "run", "start" ]
