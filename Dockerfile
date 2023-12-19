# Container image that runs your code
FROM node:21

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY package.json .
RUN npm install

COPY . .

# This is to comply with file enforcement from node process
RUN touch .env

# Code file to execute when the docker container starts up (`entrypoint.sh`)
ENTRYPOINT ["npm", "--prefix", "/usr/src/app", "run", "start:docker"]
