#!/bin/bash

# Build and Dockerize WDM Application
# This script builds all components and prepares them for Docker deployment

set -e

echo "🚀 Starting WDM Application Dockerization..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Clean up previous builds
print_status "Cleaning up previous builds..."
docker-compose down --volumes --remove-orphans 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p nginx/ssl 2>/dev/null || true

# Generate self-signed SSL certificates for development (skip if exists)
if [ ! -f nginx/ssl/cert.pem ]; then
    print_warning "Generating self-signed SSL certificates for development..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" 2>/dev/null || true
fi

# Build backend
print_status "Building backend..."
docker-compose build backend

# Build admin frontend
print_status "Building admin frontend..."
docker-compose build admin-frontend

# Build child frontend
print_status "Building child frontend..."
docker-compose build child-frontend

# Build nginx proxy (optional)
if [ "$1" = "--production" ]; then
    print_status "Building nginx reverse proxy for production..."
    docker-compose build nginx
fi

echo ""
echo "🎉 Build completed successfully!"
echo ""
echo "📋 Available services:"
echo "   • Backend API: http://localhost:3000"
echo "   • Admin Frontend: http://localhost:5173"
echo "   • Child Frontend: http://localhost:5174"
if [ "$1" = "--production" ]; then
    echo "   • Production Proxy: https://localhost (HTTP → HTTPS redirect)"
fi
echo ""
echo "🚀 To start the application:"
echo "   docker-compose up -d"
echo ""
if [ "$1" = "--production" ]; then
    echo "🔒 Production mode with reverse proxy enabled"
    echo "   Note: Using self-signed certificates - browser will show security warning"
else
    echo "🛠️ Development mode - individual services"
fi