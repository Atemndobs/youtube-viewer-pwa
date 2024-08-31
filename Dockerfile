# Use the official Node.js image as the base image
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Use a new stage for the final image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy built application from the builder stage
COPY --from=builder /app /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Expose application ports
EXPOSE 3000
EXPOSE 3001

# Start the application and server
CMD ["sh", "-c", "node server/server.js & npm start"]
