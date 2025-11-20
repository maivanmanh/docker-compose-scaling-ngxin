# Use official Node.js LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the source code
COPY . .

# Expose the API port (your Express app listens on 8080)
EXPOSE 8080

# Run the server
CMD ["node", "main.js"]
