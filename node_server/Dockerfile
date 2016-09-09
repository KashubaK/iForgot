# Set the base image to Ubuntu
FROM mhart/alpine-node

# File Author / Maintainer
MAINTAINER Kyle Kashuba

# Define working directory
WORKDIR /src
ADD . /src

# Add other tools
RUN apk add --no-cache make python

# Install node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /src && cp -a /tmp/node_modules /src

# Expose port
EXPOSE  8080

# Run app using node
CMD ["node", "/src/app.js"]