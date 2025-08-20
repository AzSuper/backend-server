#!/bin/bash

# Quick Start Script for Flutter Backend
# This script sets up the development environment quickly

set -e

# Colors for output
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo "🚀 Flutter Backend Quick Start"
echo "=============================="

# Check if Docker is running
print_step "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_warning "Docker is not running. Please start Docker and try again."
    exit 1
fi
print_status "Docker is running ✓"

# Check if .env file exists
print_step "Setting up environment variables..."
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        cp env.example .env
        print_warning "Created .env file from template."
        print_warning "Please edit .env file with your actual values:"
        echo ""
        echo "Required values:"
        echo "- DB_USER, DB_PASSWORD, DB_NAME"
        echo "- JWT_SECRET (at least 32 characters)"
        echo "- CLOUDINARY credentials"
        echo ""
        print_warning "Press Enter when you've updated the .env file..."
        read
    else
        print_warning "env.example file not found. Please create .env file manually."
        exit 1
    fi
else
    print_status ".env file already exists ✓"
fi

# Create necessary directories
print_step "Creating necessary directories..."
mkdir -p logs uploads nginx/ssl
print_status "Directories created ✓"

# Start the application
print_step "Starting the application..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

# Wait for services to be ready
print_step "Waiting for services to be ready..."
sleep 10

# Check if services are running
print_step "Checking service status..."
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running ✓"
else
    print_warning "Some services might not be running. Check with: docker-compose ps"
fi

# Show endpoints
echo ""
echo "🌐 Your application is now running!"
echo "================================"
echo "📱 API Base URL: http://localhost:5000"
echo "🏥 Health Check: http://localhost:5000/health"
echo "🗄️  Database: localhost:5432"
echo ""
echo "📚 Available endpoints:"
echo "- Users: http://localhost:5000/api/users"
echo "- Posts: http://localhost:5000/api/posts"
echo "- Reservations: http://localhost:5000/api/reservations"
echo "- Comments: http://localhost:5000/api/comments"
echo ""
echo "📖 Full API documentation: API_ENDPOINTS.md"
echo "🚀 Deployment guide: DEPLOYMENT.md"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Restart: docker-compose restart"
echo "- Rebuild: docker-compose up -d --build"
echo ""
print_status "Setup complete! Happy coding! 🎉"
