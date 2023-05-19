# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Copy the rest of the application code to the working directory
COPY . .

# Install dependencies
RUN npm install

# Install TypeScript globally
RUN npm install -g typescript

# Install TypeScript globally
RUN npm install -g rimraf

RUN npm install -g nodemon

RUN npm install -g ts-node

RUN sh etc/build.sh

# Set the working directory to the 'dist' directory
WORKDIR /usr/src/app/dist

# Expose a port (if your application needs it)
EXPOSE 3000

# Specify the command to run when the container starts
CMD [ "npm", "run", "start" ]