FROM node:latest

COPY filler.js /filler.js

COPY package.json /package.json
RUN npm install

CMD node /filler.js
