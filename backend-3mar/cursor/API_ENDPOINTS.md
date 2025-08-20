# Flutter Backend API Endpoints

## 🔐 Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📍 Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://yourdomain.com`

## 🏥 Health Check

### GET `/health`
**Description**: Check if the server is running  
**Authentication**: None  
**Response**:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## 👥 User Management

### POST `/api/users/register`
**Description**: Register a new user (generic)  
**Authentication**: None  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "user_type": "client" // or "advertiser"
}
```

### POST `/api/users/register/user`
**Description**: Register a new client user  
**Authentication**: None  
**Body**:
```json
{
  "email": "client@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

### POST `/api/users/register/advertiser`
**Description**: Register a new advertiser user  
**Authentication**: None  
**Body**:
```json
{
  "email": "advertiser@example.com",
  "password": "securepassword",
  "business_name": "Business Name",
  "business_type": "restaurant"
}
```

### POST `/api/users/login`
**Description**: Login user (generic)  
**Authentication**: None  
**Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST `/api/users/login/user`
**Description**: Login as client user  
**Authentication**: None  
**Body**:
```json
{
  "email": "client@example.com",
  "password": "securepassword"
}
```

### POST `/api/users/login/advertiser`
**Description**: Login as advertiser user  
**Authentication**: None  
**Body**:
```json
{
  "email": "advertiser@example.com",
  "password": "securepassword"
}
```

### GET `/api/users/:id`
**Description**: Get user by ID  
**Authentication**: None  
**Response**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "user_type": "client",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/users/email/:email`
**Description**: Get user by email  
**Authentication**: None  
**Response**: Same as above

### GET `/api/users/:user_id/profile/overview`
**Description**: Get user profile overview  
**Authentication**: Required (user can only access own profile unless admin)  
**Response**:
```json
{
  "user_id": "user_id",
  "name": "John Doe",
  "bio": "User bio",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/users/:user_id/profile`
**Description**: Create or update user profile  
**Authentication**: Required (user can only access own profile unless admin)  
**Body**:
```json
{
  "name": "John Doe",
  "bio": "Updated bio",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### GET `/api/users/:user_id/settings`
**Description**: Get user settings  
**Authentication**: Required (user can only access own settings unless admin)  
**Response**:
```json
{
  "user_id": "user_id",
  "notifications": {
    "email": true,
    "push": false
  },
  "privacy": {
    "profile_visible": true
  }
}
```

### POST `/api/users/:user_id/settings`
**Description**: Update user settings  
**Authentication**: Required (user can only access own settings unless admin)  
**Body**:
```json
{
  "notifications": {
    "email": false,
    "push": true
  },
  "privacy": {
    "profile_visible": false
  }
}
```

## 📝 Posts Management

### GET `/api/posts`
**Description**: Get all posts (public)  
**Authentication**: None  
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `category`: Filter by category
- `location`: Filter by location

**Response**:
```json
{
  "posts": [
    {
      "id": "post_id",
      "title": "Post Title",
      "description": "Post description",
      "media_url": "https://example.com/image.jpg",
      "advertiser_id": "advertiser_id",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### GET `/api/posts/:id`
**Description**: Get post details by ID  
**Authentication**: None  
**Response**:
```json
{
  "id": "post_id",
  "title": "Post Title",
  "description": "Post description",
  "media_url": "https://example.com/image.jpg",
  "advertiser_id": "advertiser_id",
  "category": "restaurant",
  "location": "New York",
  "price": 25.00,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### GET `/api/posts/:id/engagement`
**Description**: Get post engagement statistics  
**Authentication**: None  
**Response**:
```json
{
  "post_id": "post_id",
  "views": 150,
  "saves": 25,
  "reservations": 10,
  "comments_count": 5
}
```

### POST `/api/posts`
**Description**: Create a new post  
**Authentication**: Required (advertiser or admin only)  
**Body** (multipart/form-data):
```
title: "Post Title"
description: "Post description"
category: "restaurant"
location: "New York"
price: 25.00
media: [file upload]
```

### GET `/api/posts/advertiser/:advertiser_id`
**Description**: Get posts by specific advertiser  
**Authentication**: Required (advertiser can only access own posts unless admin)  
**Response**: Array of posts

### POST `/api/posts/save`
**Description**: Save a post (bookmark)  
**Authentication**: Required  
**Body**:
```json
{
  "post_id": "post_id",
  "client_id": "client_id"
}
```

### GET `/api/posts/saved/:client_id`
**Description**: Get saved posts for a client  
**Authentication**: Required (client can only access own saved posts unless admin)  
**Response**: Array of saved posts

## 🗓️ Reservation Management

### POST `/api/reservations`
**Description**: Create a new reservation  
**Authentication**: Required  
**Body**:
```json
{
  "post_id": "post_id",
  "client_id": "client_id",
  "reservation_date": "2024-01-15",
  "reservation_time": "19:00",
  "party_size": 4,
  "special_requests": "Window seat preferred"
}
```

### GET `/api/reservations/client/:client_id`
**Description**: Get reservations for a specific client  
**Authentication**: Required  
**Response**:
```json
{
  "reservations": [
    {
      "id": "reservation_id",
      "post_id": "post_id",
      "reservation_date": "2024-01-15",
      "reservation_time": "19:00",
      "party_size": 4,
      "status": "confirmed",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET `/api/reservations/post/:post_id`
**Description**: Get reservations for a specific post (for advertisers)  
**Authentication**: Required  
**Response**: Array of reservations

### GET `/api/reservations/availability/:post_id`
**Description**: Check availability for a post  
**Authentication**: Required  
**Query Parameters**:
- `date`: Date to check (YYYY-MM-DD)
- `time`: Time to check (HH:MM)

**Response**:
```json
{
  "post_id": "post_id",
  "date": "2024-01-15",
  "available_times": ["18:00", "19:00", "20:00"],
  "booked_times": ["18:30", "19:30"]
}
```

### GET `/api/reservations/stats/:advertiser_id`
**Description**: Get reservation statistics for an advertiser  
**Authentication**: Required  
**Response**:
```json
{
  "advertiser_id": "advertiser_id",
  "total_reservations": 150,
  "confirmed": 120,
  "cancelled": 10,
  "pending": 20,
  "monthly_stats": [
    {
      "month": "2024-01",
      "count": 45
    }
  ]
}
```

### DELETE `/api/reservations/:reservation_id`
**Description**: Cancel a reservation  
**Authentication**: Required  
**Response**:
```json
{
  "status": "success",
  "message": "Reservation cancelled successfully"
}
```

## 💬 Comments Management

### GET `/api/comments/post/:post_id`
**Description**: Get comments for a post  
**Authentication**: None  
**Response**:
```json
{
  "comments": [
    {
      "id": "comment_id",
      "post_id": "post_id",
      "user_id": "user_id",
      "content": "Great experience!",
      "rating": 5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/comments`
**Description**: Create a new comment  
**Authentication**: Required  
**Body**:
```json
{
  "post_id": "post_id",
  "user_id": "user_id",
  "content": "Amazing food and service!",
  "rating": 5
}
```

### DELETE `/api/comments/:comment_id`
**Description**: Delete a comment  
**Authentication**: Required (user can only delete own comments unless admin)  
**Response**:
```json
{
  "status": "success",
  "message": "Comment deleted successfully"
}
```

## 🔒 Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Access token is missing or invalid"
}
```

### 403 Forbidden
```json
{
  "status": "fail",
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "status": "fail",
  "message": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## 📊 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Login/Register**: 5 requests per minute per IP
- **File Uploads**: 10MB maximum file size

## 🔐 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers (via Nginx)
- SQL injection protection
- XSS protection

## 📱 File Uploads

- **Supported formats**: JPG, PNG, GIF, WebP
- **Maximum size**: 10MB
- **Storage**: Cloudinary cloud storage
- **CDN**: Automatic CDN distribution

## 🚀 Performance Features

- Database connection pooling
- Gzip compression
- Static file caching
- Health checks
- Graceful shutdown
- Logging and monitoring
