# syntax=docker/dockerfile:1.4

# if you're doing anything beyond your local machine, please pin this to a specific version at https://hub.docker.com/_/node/
FROM node:23.5.0-alpine AS development

WORKDIR /app

COPY package*.json /app/
COPY package-lock.json /app/package-lock.json

RUN npm i

EXPOSE 3000

CMD [ "npm", "start" ]
