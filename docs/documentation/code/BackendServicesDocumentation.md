# Backend Services Documentation

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** Backend Development Team

This document provides comprehensive documentation for the BookReview Platform's backend services, including their purpose, dependencies, and implementation details.

## Service Architecture Overview

The BookReview Platform backend follows a layered architecture:

```
Controllers → Services → Models → Storage
```

Each service implements business logic for a specific domain area, handling validation, data transformations, and orchestrating operations across multiple entities.

## Core Services

### 1. AuthService

**Purpose:** Manages user authentication, authorization, and session management.

**Key Dependencies:**
- UserService
- TokenService
- EmailService
- ConfigService

**Key Methods:**

#### `registerUser(userData)`
- **Description:** Registers a new user in the system
- **Parameters:**
  - `userData` - Object containing user registration information
- **Returns:** New user object with sensitive fields removed
- **Throws:** ConflictError if email already exists

#### `loginUser(email, password)`
- **Description:** Authenticates a user and generates access tokens
- **Parameters:**
  - `email` - User's email address
  - `password` - User's password
- **Returns:** Token object and user profile
- **Throws:** AuthenticationError for invalid credentials

#### `socialLogin(provider, token)`
- **Description:** Authenticates a user via social media provider
- **Parameters:**
  - `provider` - Social provider name (google, facebook)
  - `token` - Provider-issued authentication token
- **Returns:** Token object and user profile
- **Throws:** AuthenticationError for invalid social tokens

#### `refreshToken(refreshToken)`
- **Description:** Issues a new access token using a refresh token
- **Parameters:**
  - `refreshToken` - Valid refresh token
- **Returns:** New token object
- **Throws:** AuthenticationError for invalid refresh token

#### `verifyToken(token)`
- **Description:** Verifies a JWT token and returns payload
- **Parameters:**
  - `token` - JWT token to verify
- **Returns:** Token payload with user information
- **Throws:** AuthenticationError for invalid/expired tokens

#### `requestPasswordReset(email)`
- **Description:** Sends password reset email to user
- **Parameters:**
  - `email` - User's email address
- **Returns:** Success message
- **Note:** Always returns success even if email not found (security)

#### `resetPassword(token, newPassword)`
- **Description:** Resets user password using reset token
- **Parameters:**
  - `token` - Valid password reset token
  - `newPassword` - New password to set
- **Returns:** Success message
- **Throws:** AuthenticationError for invalid/expired token

**Implementation Notes:**
- JWT tokens expire after 60 minutes
- Refresh tokens are stored in the token store with user association
- Password reset tokens expire after 24 hours
- All passwords are hashed using bcrypt with appropriate salt rounds
- Failed login attempts are rate-limited

### 2. BookService

**Purpose:** Manages book information, metadata, and search functionality.

**Key Dependencies:**
- StorageService
- IndexService
- ImageService
- ConfigService

**Key Methods:**

#### `listBooks(options)`
- **Description:** Lists books with filtering and pagination
- **Parameters:**
  - `options` - Object containing filters, sort, pagination
- **Returns:** Array of books and pagination metadata

#### `getBookById(id)`
- **Description:** Gets detailed information for a single book
- **Parameters:**
  - `id` - Book ID
- **Returns:** Complete book object
- **Throws:** NotFoundError if book doesn't exist

#### `createBook(bookData)`
- **Description:** Creates a new book entry
- **Parameters:**
  - `bookData` - Book information
- **Returns:** Created book object
- **Throws:** ValidationError for invalid book data

#### `updateBook(id, bookData)`
- **Description:** Updates an existing book
- **Parameters:**
  - `id` - Book ID
  - `bookData` - Updated book information
- **Returns:** Updated book object
- **Throws:** NotFoundError if book doesn't exist

#### `deleteBook(id)`
- **Description:** Deletes a book
- **Parameters:**
  - `id` - Book ID
- **Returns:** Success confirmation
- **Throws:** NotFoundError if book doesn't exist

#### `searchBooks(query, options)`
- **Description:** Searches books by title, author, or description
- **Parameters:**
  - `query` - Search text
  - `options` - Additional search options
- **Returns:** Matching books and pagination metadata

#### `getTopRatedBooks(limit, options)`
- **Description:** Gets highest rated books
- **Parameters:**
  - `limit` - Number of books to return
  - `options` - Additional filter options
- **Returns:** Array of top-rated book objects

**Implementation Notes:**
- Book search uses an in-memory index for performance
- Book cover images are stored as relative paths
- Book data is stored in individual JSON files
- Updates to books trigger recalculation of related indexes

### 3. ReviewService

**Purpose:** Manages user reviews, ratings, and review-related actions.

**Key Dependencies:**
- StorageService
- BookService
- UserService
- NotificationService
- ImageService

**Key Methods:**

#### `listReviews(bookId, options)`
- **Description:** Lists reviews for a specific book
- **Parameters:**
  - `bookId` - Book ID
  - `options` - Pagination and filtering options
- **Returns:** Array of reviews and pagination metadata

#### `getReviewById(id)`
- **Description:** Gets a specific review by ID
- **Parameters:**
  - `id` - Review ID
- **Returns:** Complete review object
- **Throws:** NotFoundError if review doesn't exist

#### `createReview(userId, bookId, reviewData)`
- **Description:** Creates a new book review
- **Parameters:**
  - `userId` - User ID of reviewer
  - `bookId` - Book ID being reviewed
  - `reviewData` - Review content and rating
- **Returns:** Created review object
- **Throws:** 
  - ValidationError for invalid review data
  - ConflictError if user already reviewed this book

#### `updateReview(reviewId, userId, reviewData)`
- **Description:** Updates an existing review
- **Parameters:**
  - `reviewId` - Review ID
  - `userId` - User ID of reviewer
  - `reviewData` - Updated review data
- **Returns:** Updated review object
- **Throws:** 
  - NotFoundError if review doesn't exist
  - ForbiddenError if user isn't the review owner

#### `deleteReview(reviewId, userId, isAdmin)`
- **Description:** Deletes a review
- **Parameters:**
  - `reviewId` - Review ID
  - `userId` - User ID requesting deletion
  - `isAdmin` - Whether requestor is an admin
- **Returns:** Success confirmation
- **Throws:** 
  - NotFoundError if review doesn't exist
  - ForbiddenError if user isn't owner or admin

#### `likeReview(reviewId, userId, like)`
- **Description:** Likes or unlikes a review
- **Parameters:**
  - `reviewId` - Review ID
  - `userId` - User ID performing action
  - `like` - Boolean whether to like or unlike
- **Returns:** Updated like count and status
- **Throws:** NotFoundError if review doesn't exist

#### `addComment(reviewId, userId, commentData)`
- **Description:** Adds a comment to a review
- **Parameters:**
  - `reviewId` - Review ID
  - `userId` - User ID adding comment
  - `commentData` - Comment content
- **Returns:** Created comment object
- **Throws:** NotFoundError if review doesn't exist

#### `listComments(reviewId, options)`
- **Description:** Lists comments for a review
- **Parameters:**
  - `reviewId` - Review ID
  - `options` - Pagination options
- **Returns:** Array of comments and pagination metadata

#### `updateBookRating(bookId)`
- **Description:** Recalculates book's average rating
- **Parameters:**
  - `bookId` - Book ID
- **Returns:** Updated rating information
- **Note:** Called automatically when reviews change

**Implementation Notes:**
- Review IDs use the UUID format
- Review ratings are validated to be between 1-5
- Review images are optimized and stored in the uploads directory
- Rating updates use an atomic operation pattern to prevent race conditions
- Review delete operations cascade to remove related comments

### 4. UserService

**Purpose:** Manages user profiles, preferences, and user-related operations.

**Key Dependencies:**
- StorageService
- ImageService
- ConfigService

**Key Methods:**

#### `getUserById(id, includePrivate = false)`
- **Description:** Gets a user's profile
- **Parameters:**
  - `id` - User ID
  - `includePrivate` - Whether to include private fields
- **Returns:** User profile object
- **Throws:** NotFoundError if user doesn't exist

#### `updateUser(id, userData)`
- **Description:** Updates a user's profile
- **Parameters:**
  - `id` - User ID
  - `userData` - Updated profile data
- **Returns:** Updated user profile
- **Throws:** NotFoundError if user doesn't exist

#### `getUserReviews(userId, options)`
- **Description:** Gets reviews written by a user
- **Parameters:**
  - `userId` - User ID
  - `options` - Pagination and filtering options
- **Returns:** Array of reviews and pagination metadata

#### `getUserFavorites(userId, options)`
- **Description:** Gets a user's favorite books
- **Parameters:**
  - `userId` - User ID
  - `options` - Pagination options
- **Returns:** Array of books and pagination metadata

#### `addFavorite(userId, bookId)`
- **Description:** Adds a book to user's favorites
- **Parameters:**
  - `userId` - User ID
  - `bookId` - Book ID to favorite
- **Returns:** Confirmation with timestamp
- **Throws:** 
  - NotFoundError if book doesn't exist
  - ConflictError if already in favorites

#### `removeFavorite(userId, bookId)`
- **Description:** Removes a book from favorites
- **Parameters:**
  - `userId` - User ID
  - `bookId` - Book ID to remove
- **Returns:** Success confirmation
- **Throws:** NotFoundError if not in favorites

#### `getUserReadingHistory(userId, options)`
- **Description:** Gets user's reading history
- **Parameters:**
  - `userId` - User ID
  - `options` - Filtering options
- **Returns:** Array of reading history entries
- **Note:** Reading history tracks books viewed by user

**Implementation Notes:**
- User profiles are stored in individual JSON files
- Favorites are stored in a separate collection for performance
- User email addresses must be unique in the system
- Profile updates validate allowed fields to prevent security issues
- Passwords and sensitive data are never returned in user objects

### 5. RecommendationService

**Purpose:** Generates personalized book recommendations based on user preferences and behavior.

**Key Dependencies:**
- BookService
- UserService
- OpenAIService
- ConfigService

**Key Methods:**

#### `getRecommendations(userId, options)`
- **Description:** Gets personalized book recommendations
- **Parameters:**
  - `userId` - User ID
  - `options` - Configuration options
- **Returns:** Array of recommended books with reasons

#### `refreshRecommendations(userId)`
- **Description:** Forces refresh of recommendations
- **Parameters:**
  - `userId` - User ID
- **Returns:** New recommendations
- **Note:** Recommendations are normally cached for performance

#### `provideFeedback(userId, bookId, feedback)`
- **Description:** Records user feedback on recommendations
- **Parameters:**
  - `userId` - User ID
  - `bookId` - Recommended book ID
  - `feedback` - User feedback data
- **Returns:** Success confirmation

#### `getRecommendationFactors(userId)`
- **Description:** Gets factors influencing recommendations
- **Parameters:**
  - `userId` - User ID
- **Returns:** Array of factors with weights
- **Note:** Used for explaining recommendation logic to users

**Implementation Notes:**
- Recommendations use a hybrid approach:
  - Content-based filtering (genre preferences)
  - Collaborative filtering (similar users)
  - OpenAI suggestions for enhanced personalization
- Recommendations are cached for 24 hours unless refreshed
- User feedback adjusts recommendation algorithms
- Processing happens asynchronously for performance

## Storage Services

### 1. FileStorageService

**Purpose:** Provides file-based data persistence with atomic operations and indexing.

**Key Methods:**

#### `read(collection, id)`
- **Description:** Reads an entity by ID
- **Parameters:**
  - `collection` - Entity collection name
  - `id` - Entity ID
- **Returns:** Entity data object
- **Throws:** NotFoundError if entity doesn't exist

#### `readMany(collection, options)`
- **Description:** Reads multiple entities with filtering
- **Parameters:**
  - `collection` - Entity collection name
  - `options` - Filter, sort, pagination options
- **Returns:** Array of entities and metadata

#### `write(collection, id, data)`
- **Description:** Creates or updates an entity
- **Parameters:**
  - `collection` - Entity collection name
  - `id` - Entity ID
  - `data` - Entity data to store
- **Returns:** Stored entity data

#### `delete(collection, id)`
- **Description:** Deletes an entity
- **Parameters:**
  - `collection` - Entity collection name
  - `id` - Entity ID
- **Returns:** Success confirmation

#### `createIndex(collection, field)`
- **Description:** Creates a search index
- **Parameters:**
  - `collection` - Entity collection name
  - `field` - Field to index
- **Returns:** Index information

**Implementation Notes:**
- Uses file locks to prevent concurrent write conflicts
- Maintains in-memory indexes for performance
- Stores data in JSON format for readability
- Atomic write operations use temporary files and rename
- Automatically creates collection directories as needed

### 2. ImageService

**Purpose:** Handles image uploads, optimization, and storage.

**Key Methods:**

#### `storeImage(imageData, options)`
- **Description:** Stores and processes an image
- **Parameters:**
  - `imageData` - Image binary data
  - `options` - Processing options
- **Returns:** Image URL path
- **Throws:** ValidationError for invalid images

#### `deleteImage(imagePath)`
- **Description:** Deletes an image
- **Parameters:**
  - `imagePath` - Image path to delete
- **Returns:** Success confirmation

**Implementation Notes:**
- Validates image formats (JPEG, PNG)
- Limits file size (5MB max)
- Optimizes images for storage and delivery
- Creates multiple resolutions for responsive display
- Maintains image metadata for attribution

## Utility Services

### 1. TokenService

**Purpose:** Handles JWT token generation, validation, and storage.

**Key Methods:**

#### `generateToken(payload, expiry)`
- **Description:** Generates a JWT token
- **Parameters:**
  - `payload` - Token data payload
  - `expiry` - Token expiration time
- **Returns:** Signed token string

#### `verifyToken(token)`
- **Description:** Verifies a token's validity
- **Parameters:**
  - `token` - Token to verify
- **Returns:** Token payload if valid
- **Throws:** TokenError if invalid/expired

#### `storeRefreshToken(userId, token)`
- **Description:** Stores refresh token
- **Parameters:**
  - `userId` - Associated user ID
  - `token` - Refresh token
- **Returns:** Success confirmation

**Implementation Notes:**
- Uses HS256 algorithm for token signing
- Validates token structure and signature
- Maintains token blacklist for revoked tokens
- Implements token rotation for security

### 2. ConfigService

**Purpose:** Manages application configuration and settings.

**Key Methods:**

#### `get(key, defaultValue)`
- **Description:** Gets configuration value
- **Parameters:**
  - `key` - Configuration key
  - `defaultValue` - Default if not found
- **Returns:** Configuration value

#### `set(key, value)`
- **Description:** Sets configuration value
- **Parameters:**
  - `key` - Configuration key
  - `value` - Value to set
- **Returns:** Success confirmation
- **Note:** Admin-only operation

**Implementation Notes:**
- Loads from environment variables
- Falls back to configuration files
- Caches values for performance
- Supports hierarchical configuration keys

### 3. LogService

**Purpose:** Provides structured logging and error tracking.

**Key Methods:**

#### `info(message, metadata)`
- **Description:** Logs informational message
- **Parameters:**
  - `message` - Log message
  - `metadata` - Additional context data
- **Returns:** None

#### `error(message, error, metadata)`
- **Description:** Logs error with details
- **Parameters:**
  - `message` - Error description
  - `error` - Error object
  - `metadata` - Additional context data
- **Returns:** None

**Implementation Notes:**
- Supports log levels (debug, info, warn, error)
- Formats logs as JSON for easy parsing
- Rotates log files to prevent disk space issues
- Redacts sensitive information automatically
- Configurable output targets (file, console)

## External Integration Services

### 1. OpenAIService

**Purpose:** Provides AI capabilities for recommendations and content analysis.

**Key Methods:**

#### `generateRecommendations(userProfile, readingHistory)`
- **Description:** Generates AI-powered recommendations
- **Parameters:**
  - `userProfile` - User preferences
  - `readingHistory` - Books read/rated
- **Returns:** Array of recommended books with reasons

#### `summarizeReview(reviewText)`
- **Description:** Creates a concise review summary
- **Parameters:**
  - `reviewText` - Full review text
- **Returns:** Short summary text

**Implementation Notes:**
- Uses OpenAI API with appropriate models
- Implements retry logic for API resilience
- Caches responses for cost efficiency
- Validates and sanitizes all inputs/outputs
- Falls back to rule-based recommendations if API unavailable

### 2. EmailService

**Purpose:** Handles email notifications and communication.

**Key Methods:**

#### `sendEmail(recipient, template, data)`
- **Description:** Sends a templated email
- **Parameters:**
  - `recipient` - Email address
  - `template` - Email template name
  - `data` - Template variables
- **Returns:** Delivery confirmation

**Implementation Notes:**
- Supports HTML and text email formats
- Uses templates for consistent messaging
- Implements rate limiting for spam prevention
- Tracks delivery and open statistics
- Supports email verification

## Error Handling

All services follow a consistent error handling pattern:

1. Custom error classes extend from base `AppError` class
2. Errors include appropriate HTTP status codes
3. Services never expose internal error details to clients
4. All errors are logged with context information
5. Validation errors include field-specific details

Common error types:
- `ValidationError` - Invalid input data
- `NotFoundError` - Resource not found
- `AuthenticationError` - Invalid credentials
- `AuthorizationError` - Permission denied
- `ConflictError` - Resource conflict
- `RateLimitError` - Too many requests
- `ServiceError` - External service failure

## Service Interactions

Services maintain clean separation of concerns while working together:

1. **Review Creation Flow**:
   - ReviewService creates review
   - BookService updates book rating
   - UserService updates user review count
   - NotificationService sends notifications

2. **Authentication Flow**:
   - AuthService validates credentials
   - TokenService generates tokens
   - UserService provides profile data

3. **Recommendation Flow**:
   - RecommendationService orchestrates process
   - UserService provides user preferences
   - BookService provides book metadata
   - OpenAIService enhances recommendations

## Testing Approach

Services are designed for testability:

1. **Unit Tests**:
   - Test each service method in isolation
   - Mock dependencies for controlled testing
   - Verify business logic correctness

2. **Integration Tests**:
   - Test service interactions
   - Use in-memory storage for speed
   - Verify end-to-end workflows

3. **Performance Tests**:
   - Test service efficiency under load
   - Verify caching mechanisms
   - Measure response times

## Service Configuration

Services are configured through dependency injection:

```javascript
// Example service instantiation
const bookService = new BookService({
  storageService: fileStorageService,
  indexService: searchIndexService,
  imageService: imageService,
  config: configService.getNamespace('books')
});
```

Configuration parameters are documented in each service's class definition.

## Implementation Best Practices

1. **Error Handling**: Comprehensive error handling with appropriate error types
2. **Validation**: Input validation before processing
3. **Logging**: Structured logging at appropriate levels
4. **Transactions**: Atomic operations for data consistency
5. **Caching**: Strategic caching for performance
6. **Pagination**: All list operations support pagination
7. **Rate Limiting**: Protection against abuse
8. **Security**: Input sanitization and authorization checks

## Changelog

### v1.0 (August 31, 2025)
- Initial documentation release
