# Data Model Documentation

**Version:** 1.0  
**Date:** September 15, 2025  
**Author:** Development Team

This document provides comprehensive documentation for the data models used in the BookReview Platform, including their structure, relationships, and validation rules.

## Overview

The BookReview Platform uses a structured file-based storage system that models relational data concepts. Each entity is stored in its own JSON file within a designated collection directory. This document outlines the structure and relationships between these data entities.

## Entity Relationship Diagram

```
┌───────────┐       ┌───────────┐      ┌───────────┐
│   User    │       │   Book    │      │  Review   │
├───────────┤       ├───────────┤      ├───────────┤
│ id        │       │ id        │      │ id        │
│ name      │       │ title     │      │ bookId    │
│ email     │       │ author    │      │ userId    │
│ password  │       │ description│      │ rating    │
│ bio       │◄─────►│ coverImage │◄─────┤ text      │
│ createdAt │   ┌───┤ genres    │      │ images    │
│ updatedAt │   │   │ avgRating │      │ likes     │
└───────────┘   │   │ reviewCount│      │ createdAt │
                │   │ createdAt  │      │ updatedAt │
                │   │ updatedAt  │      └───────────┘
                │   └───────────┘            ▲
                │                            │
                │   ┌───────────┐            │
                │   │ Favorite  │            │
                │   ├───────────┤            │
                └───┤ id        │            │
                    │ userId    │            │
                    │ bookId    │            │
                    │ createdAt │            │
                    └───────────┘            │
                                             │
┌───────────┐        ┌───────────┐          │
│   Token   │        │ Comment   │          │
├───────────┤        ├───────────┤          │
│ id        │        │ id        │          │
│ userId    │        │ reviewId  │──────────┘
│ token     │        │ userId    │
│ type      │        │ text      │
│ expires   │        │ createdAt │
│ createdAt │        └───────────┘
└───────────┘
```

## Data Models

### User

**Collection:** `users`
**File Pattern:** `[user_id].json`

```typescript
interface User {
  id: string;              // Unique identifier (format: usr_[timestamp][random])
  name: string;            // User's full name
  email: string;           // User's email address (unique)
  password: string;        // Hashed password
  bio?: string;            // Optional user biography
  profileImage?: string;   // Path to profile image
  reviewCount: number;     // Count of reviews written
  favoritesCount: number;  // Count of favorite books
  role: 'user' | 'admin';  // User role
  createdAt: string;       // ISO timestamp of creation
  updatedAt: string;       // ISO timestamp of last update
  // Authentication fields
  authProvider?: {         // For social login
    provider: 'google' | 'facebook' | 'twitter';
    providerId: string;
  }
}
```

**Validation Rules:**
- `name`: Required, 3-50 characters
- `email`: Required, valid email format, unique
- `password`: Required for local auth, 8+ characters with mix of letters, numbers, and special characters
- `bio`: Optional, max 500 characters
- `profileImage`: Optional, valid image path

### Book

**Collection:** `books`
**File Pattern:** `[book_id].json`

```typescript
interface Book {
  id: string;              // Unique identifier (format: bk_[timestamp][random])
  title: string;           // Book title
  author: string;          // Book author
  description: string;     // Book description
  coverImage: string;      // Path to cover image
  publishedYear?: number;  // Year of publication
  genres: string[];        // Array of genre names
  isbn?: string;           // ISBN number if available
  pageCount?: number;      // Number of pages
  language?: string;       // Book language
  averageRating: number;   // Calculated average rating
  reviewCount: number;     // Count of reviews
  createdAt: string;       // ISO timestamp of creation
  updatedAt: string;       // ISO timestamp of last update
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `author`: Required, 1-100 characters
- `description`: Required, max 5000 characters
- `coverImage`: Required, valid image path
- `publishedYear`: Optional, number between 1000-current year
- `genres`: Array with at least one genre
- `isbn`: Optional, valid ISBN-10 or ISBN-13 format
- `pageCount`: Optional, positive number
- `language`: Optional, 2-character ISO language code

### Review

**Collection:** `reviews`
**File Pattern:** `[review_id].json`

```typescript
interface Review {
  id: string;              // Unique identifier (format: rv_[timestamp][random])
  bookId: string;          // Reference to book
  userId: string;          // Reference to user
  rating: number;          // Rating 1-5
  text: string;            // Review text
  images: string[];        // Paths to review images
  likes: number;           // Count of likes
  commentCount: number;    // Count of comments
  createdAt: string;       // ISO timestamp of creation
  updatedAt: string;       // ISO timestamp of last update
}
```

**Validation Rules:**
- `bookId`: Required, valid book ID
- `userId`: Required, valid user ID
- `rating`: Required, integer 1-5
- `text`: Required, 10-5000 characters
- `images`: Optional, array of valid image paths (max 5)

### Comment

**Collection:** `comments`
**File Pattern:** `[comment_id].json`

```typescript
interface Comment {
  id: string;              // Unique identifier (format: cmt_[timestamp][random])
  reviewId: string;        // Reference to review
  userId: string;          // Reference to user
  text: string;            // Comment text
  createdAt: string;       // ISO timestamp of creation
}
```

**Validation Rules:**
- `reviewId`: Required, valid review ID
- `userId`: Required, valid user ID
- `text`: Required, 1-500 characters

### Favorite

**Collection:** `favorites`
**File Pattern:** `[user_id]/[book_id].json`

```typescript
interface Favorite {
  userId: string;          // Reference to user
  bookId: string;          // Reference to book
  createdAt: string;       // ISO timestamp of creation
}
```

**Validation Rules:**
- `userId`: Required, valid user ID
- `bookId`: Required, valid book ID

### Token

**Collection:** `tokens`
**File Pattern:** `[token_id].json`

```typescript
interface Token {
  id: string;              // Unique identifier
  userId: string;          // Reference to user
  token: string;           // Token string
  type: 'refresh' | 'passwordReset' | 'emailVerification';
  expires: string;         // ISO timestamp of expiration
  createdAt: string;       // ISO timestamp of creation
}
```

**Validation Rules:**
- `userId`: Required, valid user ID
- `token`: Required, unique token string
- `type`: Required, valid token type
- `expires`: Required, valid future timestamp

### Recommendation

**Collection:** `recommendations`
**File Pattern:** `[user_id].json`

```typescript
interface Recommendation {
  userId: string;          // Reference to user
  recommendations: {
    bookId: string;        // Reference to book
    reason: string;        // Reason for recommendation
    score: number;         // Recommendation score
  }[];
  generatedAt: string;     // ISO timestamp of generation
  expiresAt: string;       // ISO timestamp of expiration
}
```

**Validation Rules:**
- `userId`: Required, valid user ID
- `recommendations`: Array of recommendation objects
- `recommendations[].bookId`: Required, valid book ID
- `recommendations[].reason`: Required, non-empty string
- `recommendations[].score`: Required, number between 0-1

## Indexes

To improve query performance, the system maintains several in-memory indexes:

### Book Indexes

**Collection:** `indexes/books`

1. **Title Index** (`title.json`)
   - Maps words in book titles to book IDs
   - Used for title search

2. **Author Index** (`author.json`)
   - Maps author names to book IDs
   - Used for author search

3. **Genre Index** (`genre.json`)
   - Maps genre names to book IDs
   - Used for genre filtering

4. **Top Rated Index** (`top-rated.json`)
   - Lists book IDs ordered by average rating
   - Used for recommendation and top books display

### User Indexes

**Collection:** `indexes/users`

1. **Email Index** (`email.json`)
   - Maps email addresses to user IDs
   - Used for login and uniqueness validation

### Review Indexes

**Collection:** `indexes/reviews`

1. **Book Reviews Index** (`book-reviews.json`)
   - Maps book IDs to arrays of review IDs
   - Used for retrieving reviews for a book

2. **User Reviews Index** (`user-reviews.json`)
   - Maps user IDs to arrays of review IDs
   - Used for retrieving reviews by a user

## Data Relationships

1. **User to Reviews** (One-to-Many)
   - A user can write multiple reviews
   - Each review belongs to one user

2. **Book to Reviews** (One-to-Many)
   - A book can have multiple reviews
   - Each review is for one book

3. **User to Favorites** (One-to-Many)
   - A user can have multiple favorite books
   - A favorite relationship links one user to one book

4. **User to Comments** (One-to-Many)
   - A user can write multiple comments
   - Each comment belongs to one user

5. **Review to Comments** (One-to-Many)
   - A review can have multiple comments
   - Each comment belongs to one review

## Data Access Patterns

### Read Patterns

1. **Get User Profile**
   - Direct lookup by user ID

2. **Get Book Details**
   - Direct lookup by book ID

3. **List Books with Filtering**
   - Use genre index for filtering
   - Use title/author indexes for search
   - Sort by rating or date

4. **Get Reviews for Book**
   - Use book-reviews index to find review IDs
   - Retrieve reviews by IDs

5. **Get User's Reviews**
   - Use user-reviews index to find review IDs
   - Retrieve reviews by IDs

6. **Get User's Favorites**
   - Scan favorites directory for user ID
   - Retrieve books by IDs

### Write Patterns

1. **Create/Update User**
   - Write user JSON
   - Update email index

2. **Create/Update Book**
   - Write book JSON
   - Update title, author, and genre indexes

3. **Create Review**
   - Write review JSON
   - Update book-reviews and user-reviews indexes
   - Update book's average rating and review count

4. **Add to Favorites**
   - Write favorite JSON
   - Update user's favorites count

## Data Migration Path

The current file-based storage system is designed to facilitate migration to a relational or document database in the future:

1. **Entity Structure**
   - Data models are normalized like a relational database
   - Entity relationships are defined with clear foreign keys

2. **Migration Strategy**
   - Each collection maps to a database table/collection
   - Entity IDs maintain the same format
   - Indexes can be replaced by database indexes

## Data Validation

Validation occurs at multiple levels:

1. **API Request Validation**
   - Express-validator middleware validates incoming requests

2. **Service Layer Validation**
   - Business logic validation in service classes

3. **Storage Layer Validation**
   - Schema validation before writing to storage

## Sample Data Examples

### User Example

```json
{
  "id": "usr_1628745392981_345",
  "name": "Jane Reader",
  "email": "jane@example.com",
  "password": "$2a$12$Kd1SZJAeJ9K9GX9HUC0Xr.s0ZXCJCsQYmXk2SQnZ6gCPt1L0o6d6O",
  "bio": "Avid reader of science fiction and fantasy novels.",
  "profileImage": "/images/profiles/jane.jpg",
  "reviewCount": 42,
  "favoritesCount": 15,
  "role": "user",
  "createdAt": "2025-08-12T14:23:12.981Z",
  "updatedAt": "2025-08-26T09:14:33.455Z"
}
```

### Book Example

```json
{
  "id": "bk_1628745645237_781",
  "title": "The Great Novel",
  "author": "Famous Author",
  "description": "A fascinating story about adventure and discovery...",
  "coverImage": "/images/covers/great-novel.jpg",
  "publishedYear": 2024,
  "genres": ["Fiction", "Adventure"],
  "isbn": "978-3-16-148410-0",
  "pageCount": 320,
  "language": "en",
  "averageRating": 4.7,
  "reviewCount": 28,
  "createdAt": "2025-08-12T14:27:25.237Z",
  "updatedAt": "2025-08-29T18:22:14.662Z"
}
```

### Review Example

```json
{
  "id": "rv_1629654329876_452",
  "bookId": "bk_1628745645237_781",
  "userId": "usr_1628745392981_345",
  "rating": 5,
  "text": "This book was absolutely amazing! The character development was...",
  "images": [
    "/images/reviews/rv_1629654329876_452_1.jpg",
    "/images/reviews/rv_1629654329876_452_2.jpg"
  ],
  "likes": 12,
  "commentCount": 3,
  "createdAt": "2025-08-22T16:45:29.876Z",
  "updatedAt": "2025-08-22T16:45:29.876Z"
}
```

## Implementation Details

### Storage Implementation

The file-based storage system is implemented with several key features:

#### File Structure

```
data/
├── users/              # User data files
│   ├── usr_123abc.json # Individual user data
│   └── ...
├── books/              # Book data files
│   ├── bk_123abc.json  # Individual book data
│   └── ...
├── reviews/            # Review data files
│   ├── rv_123abc.json  # Individual review data
│   └── ...
├── comments/           # Comment data files
├── favorites/          # Favorite relationship data
│   ├── usr_123abc/     # User-specific favorites
│   │   ├── bk_456def.json # Favorite book entry
│   │   └── ...
│   └── ...
├── tokens/             # Authentication tokens
├── locks/              # File lock markers
└── indexes/            # Search and lookup indexes
    ├── books/
    │   ├── title.json  # Title search index
    │   ├── author.json # Author search index
    │   └── genre.json  # Genre filter index
    ├── users/
    └── reviews/
```

#### Atomic Operations

To prevent data corruption during concurrent writes, the system implements:

1. **File Locking**:
   ```typescript
   import lockfile from 'proper-lockfile';
   
   async function writeWithLock(filePath, data) {
     // Acquire lock
     const release = await lockfile.lock(filePath, { retries: 5 });
     try {
       // Write data
       await fs.writeFile(filePath, JSON.stringify(data, null, 2));
     } finally {
       // Always release lock
       await release();
     }
   }
   ```

2. **Atomic Writes**:
   ```typescript
   async function atomicWrite(filePath, data) {
     const tempPath = `${filePath}.tmp`;
     await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
     await fs.rename(tempPath, filePath);
   }
   ```

#### Transaction Support

For operations that modify multiple files:

```typescript
async function transaction(operations) {
  const lockFiles = [];
  try {
    // Acquire all locks in a consistent order to prevent deadlocks
    for (const op of operations) {
      const lock = await lockfile.lock(op.filePath);
      lockFiles.push({ path: op.filePath, release: lock });
    }
    
    // Prepare all writes
    const tempFiles = [];
    for (const op of operations) {
      const tempPath = `${op.filePath}.tmp`;
      await fs.writeFile(tempPath, JSON.stringify(op.data, null, 2));
      tempFiles.push({ source: tempPath, target: op.filePath });
    }
    
    // Commit transaction (atomic renames)
    for (const file of tempFiles) {
      await fs.rename(file.source, file.target);
    }
  } finally {
    // Release all locks
    for (const lock of lockFiles) {
      await lock.release();
    }
  }
}
```

### Index Implementation

Indexes are maintained for efficient queries and are updated when related entities change:

```typescript
class BookIndexService {
  private titleIndex = {};
  private authorIndex = {};
  private genreIndex = {};
  
  async loadIndexes() {
    this.titleIndex = JSON.parse(await fs.readFile('data/indexes/books/title.json', 'utf8'));
    this.authorIndex = JSON.parse(await fs.readFile('data/indexes/books/author.json', 'utf8'));
    this.genreIndex = JSON.parse(await fs.readFile('data/indexes/books/genre.json', 'utf8'));
  }
  
  async updateBookInIndexes(book) {
    // Update title index
    const titleWords = book.title.toLowerCase().split(/\s+/);
    for (const word of titleWords) {
      if (!this.titleIndex[word]) {
        this.titleIndex[word] = [];
      }
      if (!this.titleIndex[word].includes(book.id)) {
        this.titleIndex[word].push(book.id);
      }
    }
    
    // Similar updates for author and genre
    // ...
    
    // Save indexes
    await fs.writeFile('data/indexes/books/title.json', JSON.stringify(this.titleIndex));
    // Save other indexes
  }
  
  searchByTitle(query) {
    const words = query.toLowerCase().split(/\s+/);
    const results = new Set();
    
    for (const word of words) {
      const matches = this.titleIndex[word] || [];
      matches.forEach(id => results.add(id));
    }
    
    return Array.from(results);
  }
}
```

## Data Migration Strategies

### Database Migration Path

The current file-based storage system is designed to facilitate future migration to a relational or document database:

#### SQL Migration Example

```sql
-- User table
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  bio TEXT,
  profile_image VARCHAR(255),
  review_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  role VARCHAR(10) DEFAULT 'user',
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Book table
CREATE TABLE books (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  author VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  cover_image VARCHAR(255) NOT NULL,
  published_year INTEGER,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Book genres (many-to-many)
CREATE TABLE book_genres (
  book_id VARCHAR(50) REFERENCES books(id),
  genre VARCHAR(50),
  PRIMARY KEY (book_id, genre)
);

-- Reviews table
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  book_id VARCHAR(50) REFERENCES books(id),
  user_id VARCHAR(50) REFERENCES users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
```

#### MongoDB Migration Example

```javascript
// User collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "email", "password", "createdAt", "updatedAt"],
      properties: {
        id: { bsonType: "string" },
        name: { bsonType: "string" },
        email: { bsonType: "string" },
        password: { bsonType: "string" },
        bio: { bsonType: "string" },
        profileImage: { bsonType: "string" },
        reviewCount: { bsonType: "int" },
        favoritesCount: { bsonType: "int" },
        role: { enum: ["user", "admin"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

// Book collection
db.createCollection("books", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "title", "author", "description", "coverImage", "genres", "createdAt", "updatedAt"],
      properties: {
        id: { bsonType: "string" },
        title: { bsonType: "string" },
        author: { bsonType: "string" },
        description: { bsonType: "string" },
        coverImage: { bsonType: "string" },
        publishedYear: { bsonType: "int" },
        genres: { bsonType: "array", items: { bsonType: "string" } },
        averageRating: { bsonType: "double" },
        reviewCount: { bsonType: "int" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});
```

### Migration Script Example

```javascript
const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

async function migrateUsers() {
  // Connect to the database
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // Read all user files
    const userFiles = await fs.readdir('data/users');
    
    for (const file of userFiles) {
      if (!file.endsWith('.json')) continue;
      
      // Read user data
      const userData = JSON.parse(
        await fs.readFile(path.join('data/users', file), 'utf8')
      );
      
      // Insert into database
      await pool.query(
        `INSERT INTO users 
         (id, name, email, password, bio, profile_image, review_count, favorites_count, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          userData.id,
          userData.name,
          userData.email,
          userData.password,
          userData.bio || null,
          userData.profileImage || null,
          userData.reviewCount || 0,
          userData.favoritesCount || 0,
          userData.role || 'user',
          new Date(userData.createdAt),
          new Date(userData.updatedAt)
        ]
      );
    }
    
    console.log('Users migration completed');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}
```

## Data Security

### Sensitive Data Handling

1. **Password Storage**:
   - Passwords are stored using bcrypt hashing
   - Example implementation:
   
   ```javascript
   const bcrypt = require('bcrypt');
   
   async function hashPassword(password) {
     const saltRounds = 12;
     return await bcrypt.hash(password, saltRounds);
   }
   
   async function verifyPassword(password, hash) {
     return await bcrypt.compare(password, hash);
   }
   ```

2. **Personal Information**:
   - Email addresses are stored in their original form for login
   - Considered for future: email hashing or encryption
   - User profile data can be made private through settings

### Access Control

1. **File Permissions**:
   - Data directory requires specific file system permissions
   - Access is controlled through application logic

2. **Data Validation**:
   - All data is validated before storage
   - Input sanitization prevents injection attacks

## Performance Considerations

### Optimization Techniques

1. **In-Memory Caching**:
   - Indexes are cached in memory for fast lookups
   - Frequently accessed entities are cached
   
2. **Batch Operations**:
   - Bulk reads/writes are used when possible
   
3. **Pagination**:
   - All list endpoints use pagination to limit data transfer

### Scaling Considerations

1. **Read Scaling**:
   - File system can be replaced with distributed storage
   - Read replicas can be added for scaling reads
   
2. **Write Scaling**:
   - Sharding strategy for future implementation
   - Entity groups can be isolated for independent scaling

## Monitoring and Maintenance

### Data Integrity

1. **Consistency Checks**:
   - Periodic verification of data integrity
   - Orphaned entity detection

2. **Backups**:
   - Daily snapshots of all data files
   - Incremental backups throughout the day

### Performance Monitoring

1. **Metrics Collection**:
   - Access patterns tracking
   - Query performance logging
   
2. **Index Optimization**:
   - Periodic rebalancing of indexes
   - Unused index cleanup

## Changelog

### v1.0 (September 15, 2025)
- Initial documentation release

### v1.1 (September 20, 2025)
- Added implementation details
- Added migration strategies
- Added security and performance considerations
