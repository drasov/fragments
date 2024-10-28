################################################################
# Stage 1: Install Dependencies
################################################################
# Use the specific Node.js version and SHA for the base image
FROM node:20.11.0@sha256:7bf4a586b423aac858176b3f683e35f08575c84500fbcfd1d433ad8568972ec6 AS dependencies

LABEL maintainer="Daniyil Rasov <drasov@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Set default port for the service
ENV PORT=8080

# Reduce npm log verbosity
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Set environment to production
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

################################################################
# Stage 2: Build and Serve the Application
################################################################
FROM node:20.11.0@sha256:7bf4a586b423aac858176b3f683e35f08575c84500fbcfd1d433ad8568972ec6 AS application

# Set the working directory
WORKDIR /app

# Copy node_modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy package files to the application stage
COPY package.json package-lock.json ./

# Copy application source code
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Set up healthcheck, expose port, and run the app
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- "http://localhost:8080/" || exit 1
EXPOSE 8080
CMD ["npm", "start"]

