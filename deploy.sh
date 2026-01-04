#!/bin/bash

# Deploy WDM Application
# This script deploys the complete WDM stack

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}===================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================${NC}"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT="development"
REBUILD=false
SCALE_SERVICES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --production)
            ENVIRONMENT="production"
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --scale)
            SCALE_SERVICES=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --production    Deploy in production mode with nginx proxy"
            echo "  --rebuild      Rebuild all Docker images"
            echo "  --scale        Scale services (production only)"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option $1"
            exit 1
            ;;
    esac
done

print_header "WDM Application Deployment"

# Check if .env file exists
if [ ! -f backend/.env ]; then
    print_warning ".env file not found in backend directory"
    print_status "Creating example .env file..."
    cat > backend/.env << EOF
# WDM Backend Environment Variables
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/wdm-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://localhost

# Admin Configuration
ADMIN_EMAIL=admin@wdm.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL Configuration (for production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
EOF
    print_warning "Please edit backend/.env with your actual configuration"
fi

# Build if requested
if [ "$REBUILD" = true ]; then
    print_status "Rebuilding all Docker images..."
    ./build.sh --$ENVIRONMENT
fi

# Stop existing services
print_status "Stopping existing services..."
docker-compose down --remove-orphans 2>/dev/null || true

# Remove old volumes if production
if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "Removing old volumes (production mode)..."
    docker-compose down --volumes 2>/dev/null || true
fi

# Start services
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Starting production services with nginx reverse proxy..."
    docker-compose --profile production up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check service health
    print_status "Checking service health..."
    
    # Check backend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_status "✓ Backend is healthy"
    else
        print_warning "⚠ Backend health check failed"
    fi
    
    # Check frontend services
    if curl -f http://localhost:80/health > /dev/null 2>&1; then
        print_status "✓ Nginx proxy is healthy"
    else
        print_warning "⚠ Nginx health check failed"
    fi
    
    # Scale services if requested
    if [ "$SCALE_SERVICES" = true ]; then
        print_status "Scaling services..."
        docker-compose up -d --scale admin-frontend=2 --scale child-frontend=2
    fi
    
else
    print_status "Starting development services..."
    docker-compose up -d
    
    # Wait for services
    print_status "Waiting for services to start..."
    sleep 5
fi

print_header "Deployment Complete! 🎉"

echo ""
echo "📋 Service URLs:"
if [ "$ENVIRONMENT" = "production" ]; then
    echo "   🔒 HTTPS Main:      https://localhost"
    echo "   📊 Admin Panel:    https://localhost/admin"
    echo "   👶 Child Panel:     https://localhost/child"
    echo "   🔧 Backend API:     https://localhost/api"
else
    echo "   📊 Admin Panel:    http://localhost:5173"
    echo "   👶 Child Panel:     http://localhost:5174"
    echo "   🔧 Backend API:     http://localhost:3000"
    echo "   🗄️  MongoDB:        localhost:27017"
fi

echo ""
echo "🛠️  Management Commands:"
echo "   View logs:      docker-compose logs -f [service-name]"
echo "   Stop services:  docker-compose down"
echo "   Restart:       docker-compose restart [service-name]"
echo "   Scale services: docker-compose up -d --scale service-name=2"

echo ""
echo "📊 Monitoring:"
echo "   Check status:   docker-compose ps"
echo "   Resource usage: docker stats"

if [ "$ENVIRONMENT" = "production" ]; then
    echo ""
    print_warning "🔒 Production mode is active"
    print_warning "   • SSL is enabled (using self-signed certificates for demo)"
    print_warning "   • Security headers are configured"
    print_warning "   • Rate limiting is enabled"
fi

echo ""
print_status "✨ WDM application is now running!"