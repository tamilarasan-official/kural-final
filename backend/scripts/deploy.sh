#!/bin/bash

# Build and deploy script
set -e

echo "Starting deployment process..."

# Install dependencies
echo "Installing dependencies..."
npm ci --production

# Run tests
echo "Running tests..."
npm test

# Run linting
echo "Running linter..."
npm run lint

# Build Docker image
echo "Building Docker image..."
docker build -t backend:latest .

# Tag for production
echo "Tagging for production..."
docker tag backend:latest backend:$(date +%Y%m%d%H%M%S)

echo "Deployment preparation completed!"

# Uncomment below lines for actual deployment
# docker push backend:latest
# kubectl apply -f k8s/
# kubectl rollout restart deployment/backend