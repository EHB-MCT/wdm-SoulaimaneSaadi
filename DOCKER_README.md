# 🐳 WDM Docker Deployment Guide

## Overview

This guide shows how to Dockerize and deploy the WDM (Watch Dog Monitor) application with all its components:
- **Backend API** (Node.js/Express)
- **Admin Frontend** (React/Vite)
- **Child Frontend** (React/Vite)
- **MongoDB** (Database)
- **Nginx** (Reverse Proxy - Production)

> **🚀 NEW**: Full Docker implementation with multi-stage builds, security features, and production-ready deployment scripts!

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin App     │    │   Child App     │    │   Backend API   │
│   (React)       │    │   (React)       │    │   (Node.js)     │
│   Port: 5173    │    │   Port: 5174    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┴───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     MongoDB     │
                    │   Port: 27017  │
                    └─────────────────┘

Production Mode:
┌─────────────────────────────────────────────────────┐
│                Nginx Reverse Proxy               │
│              Port: 80 & 443                    │
├─────────────────────────────────────────────────────┤
│  https://localhost/admin → Admin Frontend         │
│  https://localhost/child → Child Frontend        │
│  https://localhost/api/* → Backend API           │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git
- Make (for the deployment scripts)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd wdm-SoulaimaneSaadi
```

### 2. Configure Environment

```bash
# Backend environment
cp backend/.env.template backend/.env
# Edit backend/.env with your configuration

# SSL certificates (production)
mkdir -p nginx/ssl
# Add your SSL certificates to nginx/ssl/
# or use the generated self-signed ones for testing
```

### 3. Development Deployment

```bash
# Build and start all services
./deploy.sh

# Or build and start with specific options
./deploy.sh --development
./deploy.sh --rebuild
```

### 4. Production Deployment

```bash
# Build and deploy with reverse proxy
./deploy.sh --production

# Deploy with scaling
./deploy.sh --production --scale

# Rebuild all images
./deploy.sh --production --rebuild
```

## 📋 Available Scripts

### `build.sh` - Build Docker Images

```bash
# Development build
./build.sh

# Production build
./build.sh --production
```

### `deploy.sh` - Deploy Application

```bash
# Development mode
./deploy.sh

# Production mode with nginx proxy
./deploy.sh --production

# Rebuild all images
./deploy.sh --rebuild

# Scale services (production only)
./deploy.sh --production --scale

# Show help
./deploy.sh --help
```

## 🔧 Configuration

### Environment Variables (`backend/.env`)

```bash
# Application
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://mongo:27017/wdm-app

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,https://localhost

# Admin Credentials
ADMIN_EMAIL=admin@wdm.com
ADMIN_PASSWORD=secure-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# SSL (Production)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Service Ports

| Service       | Development | Production | Protocol |
|--------------|-------------|------------|----------|
| Admin Frontend | 5173        | 443/80     | HTTP/HTTPS |
| Child Frontend | 5174        | 443/80     | HTTP/HTTPS |
| Backend API    | 3000        | 443/80     | HTTP/HTTPS |
| MongoDB       | 27017       | -           | TCP      |
| Nginx Proxy  | -           | 80/443     | HTTP/HTTPS |

## 🛠️ Docker Compose Services

### Backend Service

```yaml
backend:
  build: ./backend
  container_name: wdm-backend
  restart: always
  env_file:
    - ./backend/.env
  depends_on:
    - mongo
  ports:
    - "3000:3000"
  volumes:
    - ./backend:/app
    - /app/node_modules
```

### Frontend Services

```yaml
admin-frontend:
  build:
    context: ./admin-frontend
    dockerfile: Dockerfile
  ports:
    - "5173:80"
  environment:
    - VITE_API_URL=http://localhost:3000

child-frontend:
  build:
    context: ./child-frontend
    dockerfile: Dockerfile
  ports:
    - "5174:80"
  environment:
    - VITE_API_URL=http://localhost:3000
```

### Nginx Reverse Proxy

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    - ./nginx/ssl:/etc/nginx/ssl
  depends_on:
    - admin-frontend
    - child-frontend
    - backend
  profiles:
    - production
```

## 🔒 Security Features

### Nginx Configuration

- **SSL/TLS** termination
- **Security headers** (X-Frame-Options, X-XSS-Protection, etc.)
- **Rate limiting** (API endpoints, login attempts)
- **Gzip compression**
- **Static asset caching**
- **Content Security Policy**

### Docker Security

- **Non-root user** in containers
- **Read-only filesystem** where possible
- **Resource limits**
- **Health checks**
- **Network isolation**

## 📊 Monitoring & Management

### Health Checks

```bash
# Check all services
docker-compose ps

# Check individual service
curl http://localhost:3000/health
curl http://localhost:80/health
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f admin-frontend
docker-compose logs -f nginx
```

### Scaling Services

```bash
# Scale frontend services (production only)
docker-compose up -d --scale admin-frontend=2
docker-compose up -d --scale child-frontend=3
```

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes:**
   ```bash
   # Rebuild and restart backend
   docker-compose up -d --build backend
   ```

2. **Frontend Changes:**
   ```bash
   # Rebuild specific frontend
   docker-compose up -d --build admin-frontend
   docker-compose up -d --build child-frontend
   ```

3. **Full Rebuild:**
   ```bash
   # Rebuild everything
   ./deploy.sh --rebuild
   ```

### Hot Reload (Development)

For development with hot reload, you can run services individually:

```bash
# Backend with hot reload
cd backend
npm install
npm run dev

# Frontend with hot reload (in separate terminals)
cd admin-frontend
npm run dev

cd child-frontend
npm run dev
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts:**
   ```bash
   # Check what's using ports
   lsof -i :3000
   lsof -i :5173
   lsof -i :5174
   ```

2. **Permission Issues:**
   ```bash
   # Fix Docker permissions
   sudo usermod -aG docker $USER
   
   # Or run with sudo
   sudo docker-compose up
   ```

3. **Build Failures:**
   ```bash
   # Clean up and rebuild
   docker-compose down --volumes --remove-orphans
   docker system prune -f
   ./deploy.sh --rebuild
   ```

4. **SSL Certificate Issues:**
   ```bash
   # Generate new self-signed certificates
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout nginx/ssl/key.pem \
       -out nginx/ssl/cert.pem \
       -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

### Debug Mode

```bash
# Run with verbose output
docker-compose up --build --force-recreate

# Check container logs
docker-compose logs -f --tail=100 backend

# Enter container for debugging
docker-compose exec backend sh
docker-compose exec admin-frontend sh
```

## 📈 Performance Optimization

### Production Optimizations

1. **Multi-stage builds** for smaller images
2. **Nginx caching** for static assets
3. **Gzip compression** for responses
4. **Rate limiting** for API protection
5. **Health checks** for load balancers

### Docker Best Practices

1. **.dockerignore** files to optimize build context
2. **Non-root users** in containers
3. **Resource limits** for containers
4. **Read-only filesystems** where possible
5. **Health checks** for all services

## 🌐 Access URLs

### Development Mode
- **Admin Panel:** http://localhost:5173
- **Child Panel:** http://localhost:5174
- **Backend API:** http://localhost:3000
- **MongoDB:** localhost:27017

### Production Mode
- **Main Application:** https://localhost
- **Admin Panel:** https://localhost/admin
- **Child Panel:** https://localhost/child
- **Backend API:** https://localhost/api
- **Health Check:** https://localhost/health

## 📝 Maintenance

### Backup

```bash
# Backup MongoDB
docker-compose exec mongo mongodump --out /data/backup

# Backup volumes
docker run --rm -v wdm_mongo-data:/data -v $(pwd):/backup alpine tar czf /backup/mongo-backup.tar.gz -C /data .
```

### Updates

```bash
# Pull latest images
docker-compose pull

# Update and restart
./deploy.sh --rebuild
```

### Cleanup

```bash
# Remove unused images and containers
docker system prune -f

# Remove unused volumes (careful!)
docker volume prune -f
```

---

**🎉 Your WDM application is now fully Dockerized and ready for production deployment!**