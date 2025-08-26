# BookReview Platform

A modern web application for reviewing, rating, and discovering books.

## Project Structure

This project consists of a Next.js frontend and Express.js backend:

```
├── frontend/                   # Next.js application
│   ├── public/                 # Static assets
│   └── src/                    # Source code
│       ├── components/         # React components
│       ├── pages/              # Next.js route pages
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API service layer
│       ├── store/              # Redux store
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
│   └── data/                   # File-based data storage
└── docs/                       # Project documentation
```

## Technology Stack

### Frontend
- Next.js with React
- TypeScript
- Redux for state management
- Material UI for components
- Jest and React Testing Library for testing

### Backend
- Express.js on Node.js
- TypeScript
- JWT-based authentication
- File-based JSON data storage
- Jest for testing

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
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. The API will be available at http://localhost:3001

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
npm run test
```

### Backend
```
cd backend
npm run test
```

## Contributing

1. Follow the branching strategy
2. Write tests for new features
3. Ensure code follows the project's style guide
4. Update documentation as needed
