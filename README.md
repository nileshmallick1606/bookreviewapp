# BookReview Platform

A modern web application for reviewing, rating, and discovering books. The platform connects readers with their next favorite books and creates a vibrant community of book lovers.

## Overview

BookReview is a full-stack application that allows users to:
- Discover new books through personalized AI-powered recommendations
- Read and write detailed reviews
- Rate books and see aggregated community ratings
- Create and manage reading lists and favorites
- Connect with other readers through social features

## Project Structure

This project consists of a Next.js frontend and Express.js backend:

```
├── frontend/                   # Next.js application
│   ├── public/                 # Static assets
│   └── src/                    # Source code
│       ├── components/         # React components by domain
│       ├── pages/              # Next.js route pages
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API service layer
│       ├── store/              # Redux store (actions, reducers)
│       ├── utils/              # Helper functions
│       └── styles/             # Global styles and theme
├── backend/                    # Express.js server
│   ├── src/                    # Source code
│   │   ├── config/             # Environment and app configuration
│   │   ├── controllers/        # Route controllers
│   │   ├── middlewares/        # Express middleware
│   │   ├── models/             # Data models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── data/                   # File-based data storage
│   │   ├── users/              # User data files
│   │   ├── books/              # Book data files
│   │   ├── reviews/            # Review data files
│   │   └── indexes/            # Search indexes
│   ├── scripts/                # Utility scripts
│   └── tests/                  # Backend tests
├── docs/                       # Project documentation
│   ├── documentation/          # Technical and user documentation
│   │   ├── code/               # Code documentation
│   │   ├── user/               # User guides and help
│   │   └── training/           # Training materials
│   └── reports/                # Project progress reports
└── infrastructure/             # Infrastructure as code
```

## Technology Stack

### Frontend
- Next.js with React for server-side rendering and client-side hydration
- TypeScript for type safety
- Redux for state management (following ducks pattern)
- React Query for data fetching and caching
- Material UI for component library and theming
- Jest and React Testing Library for component testing
- Cypress for end-to-end testing

### Backend
- Express.js on Node.js
- TypeScript for type safety
- Controller-Service-Model pattern
- JWT-based authentication with HTTP-only cookies
- Social authentication support
- File-based JSON data storage with in-memory indexing
- OpenAI integration for personalized recommendations
- Winston for logging
- Jest for unit and integration testing

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm (v8 or later)

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. The frontend will be available at http://localhost:3000

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=60m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   REFRESH_TOKEN_EXPIRES_IN=7d
   OPENAI_API_KEY=your_openai_api_key_here
   LOG_LEVEL=info
   NODE_ENV=development
   ```

4. Generate seed data (optional):
   ```
   npm run seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. The API will be available at http://localhost:3001

## Development Workflow

1. Create a new branch from `develop` for your feature or bugfix:
   ```
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```
   git add .
   git commit -m "Add your feature description"
   ```

3. Push your branch to the repository:
   ```
   git push -u origin feature/your-feature-name
   ```

4. Create a Pull Request to merge your changes into the `develop` branch.

## Testing

### Frontend
```
cd frontend
npm run test                 # Run unit and component tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Generate test coverage report
npm run cypress              # Run end-to-end tests
```

### Backend
```
cd backend
npm run test                 # Run all tests
npm run test:unit            # Run unit tests only
npm run test:integration     # Run integration tests only
npm run test:coverage        # Generate test coverage report
```

## Additional Commands

```
npm run docker:up            # Start services with Docker Compose
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint errors
npm run build                # Build for production
npm run seed                 # Populate database with test data
npm run update:indexes       # Update in-memory indexes
```

## API Documentation

API documentation is available at:
- Development: http://localhost:3001/api/docs
- Production: https://[your-domain]/api/docs

The API follows RESTful conventions with endpoints structured as `/api/v1/[resource]`.

## Deployment

### Production Build
1. Build the frontend:
   ```
   cd frontend
   npm run build
   ```

2. Build the backend:
   ```
   cd backend
   npm run build
   ```

### Docker Deployment
```
docker-compose up -d
```

### Infrastructure
Infrastructure as code is available in the `infrastructure` directory, including:
- Docker configurations
- Terraform scripts for cloud deployment
- CI/CD pipeline configurations

## Documentation

Comprehensive documentation is available in the `docs` directory:
- [Business Requirements Document](docs/Business%20Requirements%20Document.md)
- [Technical Requirements Document](docs/Technical%20Requirements%20Document.md)
- [Developer Guide](docs/documentation/code/DeveloperGuide.md)
- [API Documentation](docs/documentation/code/APIDocumentation.md)
- [User Guide](docs/documentation/user/UserGuide.md)

## Contributing

1. Follow the feature branch workflow:
   ```
   git checkout -b feature/US-XXX-description
   ```

2. Write tests for new features:
   - Unit tests for functions and components
   - Integration tests for service interactions
   - End-to-end tests for critical user flows

3. Follow coding standards:
   - Follow the project's ESLint configuration
   - Use TypeScript for type safety
   - Follow component architecture patterns
   - Document public APIs with JSDoc comments

4. Create detailed pull requests:
   - Reference JIRA tickets
   - Include screenshots for UI changes
   - Add test coverage information
   - Document any technical decisions

5. Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
