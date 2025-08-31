# Enhanced API Documentation

## Overview

The BookReview Platform now features an enhanced API with standardized response formats, comprehensive error handling, and detailed documentation. This new API is available alongside the existing endpoints and provides a more consistent developer experience.

## Key Features

- **Standardized Response Format**: Consistent structure for all API responses
- **Improved Error Handling**: Detailed error messages and standardized error codes
- **Role-Based Access Control**: Enhanced authentication with role-specific permissions
- **Comprehensive Documentation**: Swagger/OpenAPI documentation for all endpoints
- **Input Validation**: Robust request validation with detailed error reporting
- **Pagination Standards**: Consistent pagination pattern across all collection endpoints

## Response Format

### Success Response

```json
{
  "status": "success",
  "data": {
    // Response data here
  },
  "error": null,
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

### Error Response

```json
{
  "status": "error",
  "data": null,
  "error": {
    "code": 400,
    "message": "Validation failed",
    "errors": [
      {
        "param": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

## Authentication

Authentication uses JWT tokens delivered via HTTP-only cookies. Access tokens are short-lived while refresh tokens have longer expiration times.

```
POST /api/v1/enhanced/auth/login
POST /api/v1/enhanced/auth/register
POST /api/v1/enhanced/auth/refresh
POST /api/v1/enhanced/auth/logout
```

## Documentation

Interactive API documentation is available at:

```
/api/v1/enhanced/docs
```

## Accessing the Enhanced API

The enhanced API is available under:

```
/api/v1/enhanced
```

Example:
```
GET /api/v1/enhanced/books
```

## Major Endpoints

| Endpoint | Description | Authentication |
|----------|-------------|----------------|
| `GET /enhanced/books` | Get paginated list of books | Public |
| `GET /enhanced/books/search` | Search for books | Public |
| `GET /enhanced/books/top-rated` | Get top rated books | Public |
| `GET /enhanced/books/:id` | Get book details | Public |
| `POST /enhanced/books` | Create a new book | Admin only |
| `PUT /enhanced/books/:id` | Update a book | Admin only |
| `DELETE /enhanced/books/:id` | Delete a book | Admin only |
| `GET /enhanced/reviews/:id` | Get review details | Public |
| `PUT /enhanced/reviews/:id` | Update a review | Owner only |
| `DELETE /enhanced/reviews/:id` | Delete a review | Owner/Admin |
| `POST /enhanced/reviews/:id/like` | Like a review | Authenticated |

## Migration Guide

Existing applications should continue using the current API endpoints. New applications and features should adopt the enhanced API standards. A complete migration guide is available in the documentation.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |
