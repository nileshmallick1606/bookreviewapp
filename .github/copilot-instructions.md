# BookReview Platform - AI Assistant Guidelines

## Project Architecture

This is a book review platform with a Next.js frontend and Express.js backend:

- **Frontend**: Next.js, Redux, Material UI
- **Backend**: Express.js on Node.js
- **Data Storage**: File-based JSON stores (structured for future DB migration)
- **Authentication**: JWT-based with social auth support
- **External APIs**: OpenAI for book recommendations

## Key Data Models

- **User**: Authentication profiles with preferences and book collections
- **Book**: Core entity with metadata, genres, and aggregated ratings
- **Review**: User-generated content with ratings, comments, and likes
- **Recommendation**: Personalized book suggestions using AI

## Project Structure

```
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── components/         # React components by domain
│   │   ├── pages/              # Next.js route pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   ├── store/              # Redux store (actions, reducers)
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # Global styles and theme
├── backend/                    # Express.js server
│   ├── src/
│   │   ├── config/             # Environment and app configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middlewares/        # Express middleware
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   └── data/                   # File-based data storage
│       ├── users/              # User data files ([user_id].json)
│       ├── books/              # Book data files ([book_id].json)
│       ├── reviews/            # Review data files ([review_id].json)
│       └── indexes/            # Search indexes
```

## Development Guidelines

### Data Access Patterns

- Use the file-based data service layer to handle all data operations
- Leverage in-memory indexing for performance optimizations
- Follow the pattern in existing services for CRUD operations
- Always handle concurrent write operations with file locking

### API Conventions

- RESTful endpoints follow `/api/v1/[resource]` naming pattern
- Standard response format:
  ```json
  {
    "status": "success|error",
    "data": {...} | null,
    "error": null | { "code": 400, "message": "Error details" }
  }
  ```
- All endpoints require authentication except: login, register, public book info

### Authentication Flow

- JWT stored in HTTP-only cookies (60-minute lifespan)
- Refresh token mechanism for automatic renewal
- Use auth middleware for protected routes

### Testing Approach

- Jest for both frontend and backend tests
- React Testing Library for component tests
- End-to-end tests with Cypress
- Target minimum 80% code coverage

### Development Commands

- `npm run dev` - Run development server
- `npm run test` - Run test suite
- `npm run build` - Build for production
- `npm run docker:up` - Start services with Docker Compose
- `npm run seed` - Populate database with test data

## Key Implementation Details

- File-based storage uses UUID for entity IDs
- Rating aggregation runs automatically when reviews are modified
- OpenAI integration requires proper API key configuration
- Security headers are applied through Helmet middleware
- Material UI theming is centralized in the theme provider

## Patterns to Follow

- Use controller-service-model pattern for backend features
- Follow Redux ducks pattern for state management
- Implement error boundary components for UI error handling
- Apply compound component pattern for complex UI elements
- Use React Query for data fetching and caching


## CODING RULES:
- DO NOT MAKE CODE CHANGES WITHOUT EXPLICIT APPROVAL.
- Follow the project's coding style (e.g., indentation, naming conventions).
- Write clear, descriptive commit messages.
- Avoid premature optimization; prioritize readability and maintainability.
- Document complex logic and decisions in code comments.
- Use feature flags for incomplete features.
- Regularly update dependencies and fix vulnerabilities.
- Write tests for new features and bug fixes.
- Refactor code as needed to improve clarity and maintainability.
- Remove unused code and dependencies.

## Documentation & Tracking Responsibilities:
- AUTOMATICALLY update Requirements Traceability Matrix when adding/changing features or requirements.
- AUTOMATICALLY update Sprint Progress Tracking Dashboard when suggesting code changes.
- AUTOMATICALLY update Test Coverage Matrix when suggesting tests or completing features.
- AUTOMATICALLY validate all completed work against Definition of Ready/Done criteria.
- AFTER EACH SPRINT: Perform formal validation of completed stories against Definition of Done.
- BEFORE EACH SPRINT: Verify all candidate stories against Definition of Ready.
- MAINTAIN traceability between requirements, code changes, and tests.
- ALERT if any proposed changes don't align with tracking documents.
- CHECK that each sprint deliverable is testable end-to-end.
- VERIFY and update documentation concurrently with code suggestions.
