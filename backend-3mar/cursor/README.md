# Flutter Backend API

A robust Node.js backend API for a Flutter application with reservation system, user management, and post management capabilities.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with role-based access control
- 👥 **User Management** - User registration, login, and profile management
- 📝 **Post Management** - Create, read, update, and delete posts with media upload
- 📅 **Reservation System** - Advanced reservation management with time limits and capacity constraints
- 🖼️ **Media Handling** - Cloudinary integration for image and video uploads
- 🗄️ **Database** - PostgreSQL with connection pooling and optimized queries
- 🛡️ **Security** - Rate limiting, input sanitization, XSS protection, and CORS configuration
- 📊 **Logging** - Structured logging with Winston
- 🚀 **Performance** - Connection pooling, query optimization, and graceful shutdown

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Cloudinary account
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flutter-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database Configuration
   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=your_database_name
   DB_PASSWORD=your_db_password
   DB_PORT=5432

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration (optional)
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Set up the database**
   - Create a PostgreSQL database
   - Run the database schema (see Database Schema section below)

5. **Start the server**
   ```bash
   npm start
   ```

## Database Schema

The application requires the following tables:

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Posts Table
```sql
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    advertiser_id INTEGER REFERENCES users(id),
    category_id INTEGER REFERENCES categories(id),
    type VARCHAR(10) CHECK (type IN ('reel', 'post')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    old_price DECIMAL(10,2),
    media_url TEXT,
    with_reservation BOOLEAN DEFAULT false,
    reservation_time TIMESTAMP,
    reservation_limit INTEGER,
    social_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
```

### Reservations Table
```sql
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, post_id)
);
```

## API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication

### Posts
- `GET /api/posts` - Get all posts with pagination and filtering
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create a new post (authenticated)
- `GET /api/posts/advertiser/:advertiser_id` - Get posts by advertiser (authenticated)

### Reservations
- `POST /api/reservations` - Create a reservation (authenticated)
- `GET /api/reservations/client/:client_id` - Get client reservations (authenticated)
- `GET /api/reservations/post/:post_id` - Get post reservations (authenticated)
- `GET /api/reservations/availability/:post_id` - Check post availability
- `GET /api/reservations/stats/:advertiser_id` - Get advertiser statistics (authenticated)
- `DELETE /api/reservations/:reservation_id` - Cancel reservation (authenticated)

### Health Check
- `GET /health` - Server health status

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents abuse with configurable limits
- **Input Sanitization** - Protects against XSS and injection attacks
- **CORS Configuration** - Configurable cross-origin resource sharing
- **Helmet** - Security headers for Express applications
- **Parameter Pollution Protection** - Prevents HTTP parameter pollution

## Error Handling

The application includes comprehensive error handling:

- **Database Errors** - Specific handling for database constraint violations
- **Validation Errors** - Input validation with clear error messages
- **Authentication Errors** - Proper JWT error handling
- **Global Error Handler** - Centralized error processing
- **Structured Logging** - Detailed error logging for debugging

## Logging

The application uses Winston for structured logging:

- **Console Logging** - Colored output for development
- **File Logging** - Persistent logs for production
- **HTTP Request Logging** - Morgan integration for request tracking
- **Error Logging** - Detailed error information with stack traces

## Performance Optimizations

- **Connection Pooling** - Efficient database connection management
- **Query Optimization** - Optimized SQL queries with proper indexing
- **Graceful Shutdown** - Proper cleanup of resources on shutdown
- **Memory Management** - Efficient memory usage and garbage collection

## Development

### Running in Development Mode
```bash
NODE_ENV=development npm start
```

### Running Tests
```bash
npm test
```

### Code Quality
The project follows best practices for:
- Error handling
- Input validation
- Security
- Performance
- Code organization

## Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong, unique JWT secrets
- Configure proper CORS origins
- Set appropriate rate limiting

## Docker

### Quick start (Docker Compose)

1. Create a `.env` file at the project root with at least:
   ```env
   DB_USER=app
   DB_PASSWORD=app_password
   DB_NAME=app_db
   DB_PORT=5432
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   PORT=5000
   ALLOWED_ORIGINS=http://localhost:3000
   ```

2. Run the stack:
   ```bash
   docker compose up --build -d
   ```

3. Verify:
   - API: `http://localhost:5000/health`
   - DB initialized from `database/schema.sql` via init script.

4. Logs and uploads are bind-mounted to `./logs` and `./uploads`.

### Deploying online

- Any Docker host (e.g., a VPS or managed service) can run the stack:
  ```bash
  docker compose pull && docker compose up -d --build
  ```
- For a single container without Compose, provide `DB_HOST` to a managed Postgres and build/push the image:
  ```bash
  docker build -t yourrepo/flutter-backend:latest .
  docker run -d --name app -p 5000:5000 \
    -e NODE_ENV=production \
    -e PORT=5000 \
    -e DB_HOST=<managed-db-host> -e DB_PORT=5432 \
    -e DB_USER=<user> -e DB_PASSWORD=<pass> -e DB_NAME=<db> \
    -e JWT_SECRET=<secret> \
    -e CLOUDINARY_CLOUD_NAME=<name> -e CLOUDINARY_API_KEY=<key> -e CLOUDINARY_API_SECRET=<secret> \
    yourrepo/flutter-backend:latest
  ```

### Notes

- The image runs as non-root `node` user and exposes port 5000.
- Healthcheck calls `/health` endpoint.
- Ensure reverse proxy/HTTPS termination in production (e.g., Nginx/Traefik).

### Database
- Use connection pooling
- Implement proper indexing
- Regular backups
- Monitor performance

### Security
- Enable HTTPS
- Use environment-specific configurations
- Implement proper logging
- Monitor for security issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
