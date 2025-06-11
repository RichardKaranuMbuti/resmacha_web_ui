# Use the official Node.js image as the base
FROM node:22-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy all files to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Use a lightweight image for the final container
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy the build output and dependencies
COPY --from=builder /app ./

# Expose the Next.js port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]