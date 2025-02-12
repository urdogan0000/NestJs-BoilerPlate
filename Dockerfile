# Use the official Node.js 23 image with Alpine
FROM node:23.7.0-alpine3.20

# Create and switch to a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory in the container
WORKDIR /usr/src/app

# Change ownership of the working directory to the non-root user
RUN chown appuser:appgroup /usr/src/app

# Switch to the non-root user
USER appuser

# Copy package.json and package-lock.json
COPY --chown=appuser:appgroup package*.json ./

# Install dependencies
RUN npm install -f --no-audit --prefer-offline

# Copy the rest of the application files
COPY --chown=appuser:appgroup . .

# Expose the port your app runs on
EXPOSE 3000

# Add a health check to verify if the app is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

ENV NODE_OPTIONS="--max-old-space-size=16196"
# Start the Node.js app
CMD ["npm","start"]
