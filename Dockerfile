# Container image that runs your code
FROM node:21-alpine

RUN mkdir /usr/src/app

WORKDIR /usr/src/app

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY package.json .
RUN npm install

COPY . .

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["npm", "start"]
