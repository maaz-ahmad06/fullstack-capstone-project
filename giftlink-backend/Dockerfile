# GiftLink Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose port
EXPOSE 3060

# Set environment
ENV NODE_ENV=production
ENV PORT=3060

# Run service
CMD ["npm", "start"]
