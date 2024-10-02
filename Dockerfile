# Stage 1: Build the application
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies, including development dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript types for ws
RUN npm install --save-dev @types/ws

# Build the Next.js application
RUN npm run build

# Stage 2: Create the final slim image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy only the necessary build artifacts from the previous stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package*.json /app/

# Install only production dependencies
RUN npm install --only=production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
