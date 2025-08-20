# Flutter Backend Deployment Guide

## 🚀 Quick Start (Local Development)

### 1. Setup Environment Variables
```bash
# Copy the example environment file
cp env.example .env

# Edit the .env file with your actual values
nano .env
```

### 2. Start the Application
```bash
# Development mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## 🌐 Production Deployment

### Option 1: Docker Compose (Recommended for VPS/Dedicated Server)

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

#### 2. SSL Certificate Setup (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot -y

# Generate SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to nginx directory
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
sudo chown -R $USER:$USER nginx/ssl/
```

#### 3. Deploy Application
```bash
# Clone your repository
git clone <your-repo-url>
cd <your-repo-directory>

# Setup environment variables
cp env.example .env
nano .env

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### 4. SSL Auto-renewal
```bash
# Create renewal script
sudo nano /etc/cron.daily/renew-ssl

# Add this content:
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/your/app/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/your/app/nginx/ssl/key.pem
docker-compose -f /path/to/your/app/docker-compose.prod.yml restart nginx

# Make it executable
sudo chmod +x /etc/cron.daily/renew-ssl
```

### Option 2: Cloud Deployment (AWS, Google Cloud, Azure)

#### AWS EC2 Example
```bash
# Launch EC2 instance (Ubuntu 22.04 LTS)
# Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow the same setup as VPS deployment above
```

#### Google Cloud Run (Serverless)
```bash
# Build and push Docker image
docker build -t gcr.io/your-project/flutter-backend .
docker push gcr.io/your-project/flutter-backend

# Deploy to Cloud Run
gcloud run deploy flutter-backend \
  --image gcr.io/your-project/flutter-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Option 3: Railway/Heroku (PaaS)

#### Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Heroku
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login and deploy
heroku login
heroku create your-app-name
git push heroku main
```

## 🔧 Environment Variables

### Required Variables
```bash
# Database
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=flutter_backend
DB_HOST=db
DB_PORT=5432

# JWT
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Check application health
curl https://yourdomain.com/health

# Check Docker containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U $DB_USER $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U $DB_USER $DB_NAME < backup_file.sql
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🚨 Security Considerations

1. **Firewall**: Only expose necessary ports (80, 443)
2. **SSL**: Always use HTTPS in production
3. **Environment Variables**: Never commit .env files
4. **Database**: Use strong passwords and limit access
5. **Rate Limiting**: Already configured in Nginx
6. **Security Headers**: Configured in Nginx
7. **Regular Updates**: Keep Docker images updated

## 📝 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
sudo netstat -tulpn | grep :5000

# Kill the process or change port in .env
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Test connection
docker-compose -f docker-compose.prod.yml exec app npm run test:db
```

#### SSL Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew certificates
sudo certbot renew
```

## 🔗 Useful Commands

```bash
# View all containers
docker ps -a

# View container logs
docker logs <container_name>

# Execute command in container
docker exec -it <container_name> /bin/bash

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a
```

## 📞 Support

For deployment issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check network connectivity
4. Ensure all required ports are open
5. Verify SSL certificate validity
