FROM node

# COPY TASKS DIR TO CONTAINER
ADD tasks /tasks/

# COPY WORKER TO CONTAINER
COPY ./worker.js /worker.js

# INSTALL DEPS
COPY ./package.json /package.json
RUN npm install

# START WORKER
CMD node /worker.js
