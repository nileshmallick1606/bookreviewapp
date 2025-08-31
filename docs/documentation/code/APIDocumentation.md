# BookReview Platform API Documentation

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** API Development Team

This document provides detailed documentation for the BookReview Platform's RESTful API endpoints, including request/response formats, authentication requirements, and example usage.

## API Overview

The BookReview Platform API provides programmatic access to books, reviews, user profiles, and recommendations. All API responses use a standardized format and follow RESTful principles.

### Base URL

```
https://api.bookreview.example.com/api/v1
```

### Authentication

Most API endpoints require authentication using a JSON Web Token (JWT). Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Response Format

All API responses follow this standard format:

```json
{
  "status": "success|error",
  "data": {}, // Response data (null if error)
  "error": {  // Error information (null if success)
    "code": 400,
    "message": "Error details"
  }
}
```

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters or request format |
| 401 | Unauthorized - Authentication required or invalid |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource does not exist |
| 409 | Conflict - Resource already exists or state conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

### Rate Limiting

API requests are limited to 100 requests per hour per IP address or authenticated user. Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1630444800
```

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Authentication:** None

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "userId": "usr_123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### Login User

Authenticate a user and receive access token.

**Endpoint:** `POST /auth/login`

**Authentication:** None

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "usr_123abc",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "error": null
}
```

**Notes:** The token is also set as an HTTP-only cookie with a 60-minute lifespan.

### Social Login

Authenticate a user with social media providers.

**Endpoint:** `POST /auth/social-login`

**Authentication:** None

**Request Body:**

```json
{
  "provider": "google|facebook",
  "token": "provider_issued_token"
}
```

**Response:** Same as regular login response.

### Logout

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Successfully logged out"
  },
  "error": null
}
```

**Notes:** This endpoint clears the authentication cookie.

### Refresh Token

Refresh an expiring JWT token.

**Endpoint:** `POST /auth/refresh-token`

**Authentication:** Required (via refresh token cookie)

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

### Reset Password Request

Request a password reset link.

**Endpoint:** `POST /auth/reset-password-request`

**Authentication:** None

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "If the email exists, a reset link has been sent"
  },
  "error": null
}
```

### Reset Password

Set a new password using reset token.

**Endpoint:** `POST /auth/reset-password`

**Authentication:** None

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Password has been reset successfully"
  },
  "error": null
}
```

## Book Endpoints

### List Books

Get a paginated list of books.

**Endpoint:** `GET /books`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |
| sort | string | Sort field (title, author, rating, created) |
| order | string | Sort order (asc, desc) |
| search | string | Search term for title/author |
| genre | string | Filter by genre |

**Response:**

```json
{
  "status": "success",
  "data": {
    "books": [
      {
        "id": "bk_123abc",
        "title": "The Great Novel",
        "author": "Famous Author",
        "coverImage": "/images/covers/great-novel.jpg",
        "averageRating": 4.5,
        "reviewCount": 42,
        "genres": ["Fiction", "Adventure"]
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "pageSize": 20,
      "pages": 6
    }
  },
  "error": null
}
```

### Get Book

Get detailed information about a specific book.

**Endpoint:** `GET /books/{bookId}`

**Authentication:** Optional

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "bk_123abc",
    "title": "The Great Novel",
    "author": "Famous Author",
    "description": "A long description of the book...",
    "coverImage": "/images/covers/great-novel.jpg",
    "publishedYear": 2020,
    "genres": ["Fiction", "Adventure"],
    "averageRating": 4.5,
    "reviewCount": 42,
    "isFavorite": true, // Only included when authenticated
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-08-20T15:30:00Z"
  },
  "error": null
}
```

### Create Book (Admin)

Create a new book entry.

**Endpoint:** `POST /books`

**Authentication:** Required (Admin only)

**Request Body:**

```json
{
  "title": "New Amazing Book",
  "author": "Brilliant Writer",
  "description": "An engaging story about...",
  "coverImage": "/images/covers/amazing-book.jpg",
  "publishedYear": 2025,
  "genres": ["Fiction", "Mystery"]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "bk_456def",
    "title": "New Amazing Book",
    "author": "Brilliant Writer",
    "description": "An engaging story about...",
    "coverImage": "/images/covers/amazing-book.jpg",
    "publishedYear": 2025,
    "genres": ["Fiction", "Mystery"],
    "averageRating": 0,
    "reviewCount": 0,
    "createdAt": "2025-08-31T12:00:00Z",
    "updatedAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### Update Book (Admin)

Update an existing book.

**Endpoint:** `PUT /books/{bookId}`

**Authentication:** Required (Admin only)

**Request Body:** Same as create book, with optional fields.

**Response:** Same as get book response.

### Delete Book (Admin)

Delete a book.

**Endpoint:** `DELETE /books/{bookId}`

**Authentication:** Required (Admin only)

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Book successfully deleted"
  },
  "error": null
}
```

## Review Endpoints

### List Book Reviews

Get reviews for a specific book.

**Endpoint:** `GET /books/{bookId}/reviews`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 50) |
| sort | string | Sort field (rating, created) |
| order | string | Sort order (asc, desc) |

**Response:**

```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "rv_123abc",
        "bookId": "bk_123abc",
        "userId": "usr_456def",
        "userName": "Jane Reader",
        "rating": 5,
        "text": "This was an amazing book...",
        "likes": 12,
        "images": [
          "/images/reviews/review1-img1.jpg"
        ],
        "createdAt": "2025-08-15T12:00:00Z",
        "updatedAt": "2025-08-15T12:00:00Z",
        "userHasLiked": false, // Only included when authenticated
        "isOwner": false // Only included when authenticated
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pageSize": 10,
      "pages": 5
    }
  },
  "error": null
}
```

### Create Review

Create a new review for a book.

**Endpoint:** `POST /books/{bookId}/reviews`

**Authentication:** Required

**Request Body:**

```json
{
  "rating": 4,
  "text": "I really enjoyed this book because...",
  "images": [
    "/images/reviews/my-review-img1.jpg"
  ]
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "rv_789ghi",
    "bookId": "bk_123abc",
    "userId": "usr_123abc",
    "userName": "John Doe",
    "rating": 4,
    "text": "I really enjoyed this book because...",
    "likes": 0,
    "images": [
      "/images/reviews/my-review-img1.jpg"
    ],
    "createdAt": "2025-08-31T12:00:00Z",
    "updatedAt": "2025-08-31T12:00:00Z",
    "userHasLiked": false,
    "isOwner": true
  },
  "error": null
}
```

### Get Review

Get a specific review.

**Endpoint:** `GET /reviews/{reviewId}`

**Authentication:** Optional

**Response:** Same as review object in list reviews.

### Update Review

Update an existing review.

**Endpoint:** `PUT /reviews/{reviewId}`

**Authentication:** Required (Review owner only)

**Request Body:** Same as create review, with optional fields.

**Response:** Same as get review response.

### Delete Review

Delete a review.

**Endpoint:** `DELETE /reviews/{reviewId}`

**Authentication:** Required (Review owner or Admin)

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Review successfully deleted"
  },
  "error": null
}
```

### Like Review

Like or unlike a review.

**Endpoint:** `POST /reviews/{reviewId}/like`

**Authentication:** Required

**Request Body:**

```json
{
  "like": true // true to like, false to unlike
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "likes": 13,
    "userHasLiked": true
  },
  "error": null
}
```

### Add Review Comment

Add a comment to a review.

**Endpoint:** `POST /reviews/{reviewId}/comments`

**Authentication:** Required

**Request Body:**

```json
{
  "text": "Great insights in this review!"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "cmt_123abc",
    "reviewId": "rv_123abc",
    "userId": "usr_123abc",
    "userName": "John Doe",
    "text": "Great insights in this review!",
    "createdAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### List Review Comments

Get comments for a review.

**Endpoint:** `GET /reviews/{reviewId}/comments`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |

**Response:**

```json
{
  "status": "success",
  "data": {
    "comments": [
      {
        "id": "cmt_123abc",
        "reviewId": "rv_123abc",
        "userId": "usr_123abc",
        "userName": "John Doe",
        "text": "Great insights in this review!",
        "createdAt": "2025-08-31T12:00:00Z",
        "isOwner": false // Only included when authenticated
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "pageSize": 20,
      "pages": 1
    }
  },
  "error": null
}
```

## User Profile Endpoints

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /users/me`

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "usr_123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Book enthusiast and avid reader",
    "reviewCount": 15,
    "favoritesCount": 27,
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-08-20T15:30:00Z"
  },
  "error": null
}
```

### Update Profile

Update the user's profile information.

**Endpoint:** `PUT /users/me`

**Authentication:** Required

**Request Body:**

```json
{
  "name": "John Smith",
  "bio": "I love reading science fiction and fantasy"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "usr_123abc",
    "name": "John Smith",
    "email": "john@example.com",
    "bio": "I love reading science fiction and fantasy",
    "reviewCount": 15,
    "favoritesCount": 27,
    "createdAt": "2025-01-15T12:00:00Z",
    "updatedAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### Get User Profile

Get a specific user's public profile.

**Endpoint:** `GET /users/{userId}`

**Authentication:** Optional

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "usr_456def",
    "name": "Jane Reader",
    "bio": "Professional book reviewer",
    "reviewCount": 42,
    "favoritesCount": 68,
    "createdAt": "2024-11-10T09:00:00Z"
  },
  "error": null
}
```

### Get User Reviews

Get reviews written by a specific user.

**Endpoint:** `GET /users/{userId}/reviews`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10, max: 50) |
| sort | string | Sort field (rating, created) |
| order | string | Sort order (asc, desc) |

**Response:**

```json
{
  "status": "success",
  "data": {
    "reviews": [
      {
        "id": "rv_123abc",
        "bookId": "bk_123abc",
        "bookTitle": "The Great Novel",
        "bookAuthor": "Famous Author",
        "bookCover": "/images/covers/great-novel.jpg",
        "rating": 5,
        "text": "This was an amazing book...",
        "likes": 12,
        "createdAt": "2025-08-15T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pageSize": 10,
      "pages": 5
    }
  },
  "error": null
}
```

### Get User Favorites

Get a user's favorite books.

**Endpoint:** `GET /users/{userId}/favorites`

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 50) |

**Response:**

```json
{
  "status": "success",
  "data": {
    "books": [
      {
        "id": "bk_123abc",
        "title": "The Great Novel",
        "author": "Famous Author",
        "coverImage": "/images/covers/great-novel.jpg",
        "averageRating": 4.5,
        "addedAt": "2025-07-15T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 27,
      "page": 1,
      "pageSize": 20,
      "pages": 2
    }
  },
  "error": null
}
```

### Add to Favorites

Add a book to the user's favorites.

**Endpoint:** `POST /users/me/favorites`

**Authentication:** Required

**Request Body:**

```json
{
  "bookId": "bk_123abc"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Book added to favorites",
    "addedAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### Remove from Favorites

Remove a book from the user's favorites.

**Endpoint:** `DELETE /users/me/favorites/{bookId}`

**Authentication:** Required

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Book removed from favorites"
  },
  "error": null
}
```

## Recommendation Endpoints

### Get Book Recommendations

Get personalized book recommendations.

**Endpoint:** `GET /recommendations`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| limit | number | Number of recommendations (default: 10, max: 20) |
| refresh | boolean | Force refresh recommendations (default: false) |

**Response:**

```json
{
  "status": "success",
  "data": {
    "recommendations": [
      {
        "id": "bk_789ghi",
        "title": "Another Great Novel",
        "author": "Another Author",
        "coverImage": "/images/covers/another-novel.jpg",
        "averageRating": 4.3,
        "reason": "Based on your interest in science fiction",
        "isFavorite": false
      }
    ],
    "generatedAt": "2025-08-31T12:00:00Z"
  },
  "error": null
}
```

### Provide Recommendation Feedback

Give feedback on a recommendation.

**Endpoint:** `POST /recommendations/{bookId}/feedback`

**Authentication:** Required

**Request Body:**

```json
{
  "helpful": true, // true for helpful, false for not helpful
  "comment": "Great recommendation!" // Optional
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "message": "Feedback recorded successfully"
  },
  "error": null
}
```

## Image Upload Endpoints

### Upload Review Image

Upload an image for a review.

**Endpoint:** `POST /upload/review-image`

**Authentication:** Required

**Request Body:** FormData with `image` file field

**Response:**

```json
{
  "status": "success",
  "data": {
    "imageUrl": "/images/reviews/user123-image456.jpg"
  },
  "error": null
}
```

**Notes:** 
- Maximum file size: 5MB
- Supported formats: JPEG, PNG
- Maximum dimensions: 2000x2000 pixels

## Error Responses

### Validation Error

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

### Authentication Error

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 401,
    "message": "Authentication required"
  }
}
```

### Permission Error

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 403,
    "message": "Permission denied"
  }
}
```

### Not Found Error

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 404,
    "message": "Book not found"
  }
}
```

### Rate Limit Error

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 429,
    "message": "Rate limit exceeded",
    "retryAfter": 3600
  }
}
```

## Webhook Events

The BookReview Platform can send webhook notifications for the following events:

| Event | Description |
|-------|-------------|
| book.created | A new book has been created |
| book.updated | A book has been updated |
| review.created | A new review has been posted |
| review.updated | A review has been edited |
| review.deleted | A review has been deleted |

Contact the API administrator to set up webhook subscriptions.

## Changelog

### v1.0 (August 31, 2025)
- Initial API release
