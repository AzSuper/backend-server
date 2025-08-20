#!/bin/bash

# Flutter Backend Deployment Script
# Usage: ./deploy.sh [dev|prod]

set -e

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
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_status "Docker is running"
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from template..."
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Please edit .env file with your actual values before continuing."
            print_warning "Press Enter when ready to continue..."
            read
        else
            print_error "env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
    print_status "Environment file found"
}

# Deploy development environment
deploy_dev() {
    print_status "Deploying development environment..."
    
    # Stop existing containers
    docker-compose down
    
    # Build and start containers
    docker-compose up -d --build
    
    print_status "Development environment deployed successfully!"
    print_status "Application will be available at: http://localhost:5000"
    print_status "Database will be available at: localhost:5432"
    
    # Show logs
    print_status "Showing logs (Ctrl+C to stop)..."
    docker-compose logs -f
}

# Deploy production environment
deploy_prod() {
    print_status "Deploying production environment..."
    
    # Check if nginx/ssl directory exists
    if [ ! -d "nginx/ssl" ]; then
        print_warning "SSL certificates not found. Please set up SSL certificates first."
        print_warning "See DEPLOYMENT.md for instructions."
        exit 1
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_status "Production environment deployed successfully!"
    print_status "Application will be available at: https://yourdomain.com"
    
    # Show status
    docker-compose -f docker-compose.prod.yml ps
}

# Main deployment logic
main() {
    local environment=${1:-dev}
    
    print_status "Starting deployment for $environment environment..."
    
    # Check prerequisites
    check_docker
    check_env
    
    case $environment in
        "dev")
            deploy_dev
            ;;
        "prod")
            deploy_prod
            ;;
        *)
            print_error "Invalid environment. Use 'dev' or 'prod'"
            print_status "Usage: ./deploy.sh [dev|prod]"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
