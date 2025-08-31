# BookReview Platform Developer Guide

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** Development Team

This guide provides comprehensive information for developers who are working on the BookReview Platform. It includes setup instructions, development workflows, architecture overviews, and best practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Architecture Overview](#architecture-overview)
6. [Frontend Development](#frontend-development)
7. [Backend Development](#backend-development)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Common Issues and Solutions](#common-issues-and-solutions)
11. [Contributing Guidelines](#contributing-guidelines)

## Getting Started

### Prerequisites

To work on the BookReview Platform, you'll need:

- Node.js v16.x or later
- npm v8.x or later
- Git
- Docker and Docker Compose (for containerized development)
- Visual Studio Code (recommended editor)

### Initial Setup

1. **Clone the repository:**

```bash
git clone https://github.com/bookreview/platform.git
cd platform
```

2. **Install dependencies:**

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables:**

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit files to add your development settings
```

4. **Start development servers:**

```bash
# Start the backend server
cd backend
npm run dev

# In a separate terminal, start the frontend server
cd frontend
npm run dev
```

5. **Access the application:**

- Backend API: [http://localhost:4000](http://localhost:4000)
- Frontend: [http://localhost:3000](http://localhost:3000)

### Docker Setup (Alternative)

For a containerized development environment:

```bash
# Start all services with Docker Compose
npm run docker:up

# Stop services
npm run docker:down
```

## Development Environment

### Recommended Tools

- **Editor:** Visual Studio Code
- **Browser Extensions:**
  - Redux DevTools
  - React Developer Tools
  - Axe Accessibility Checker
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - GitLens
  - ES7+ React/Redux/GraphQL/React-Native snippets

### VS Code Configuration

Add these settings to your VS Code workspace settings for consistent formatting:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript", "typescriptreact"]
}
```

### Environment Variables

Key environment variables used in the project:

#### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, test, production) | `development` |
| `PORT` | API server port | `4000` |
| `JWT_SECRET` | Secret for JWT signing | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `60m` |
| `LOG_LEVEL` | Logging detail level | `debug` |
| `OPENAI_API_KEY` | OpenAI API key for recommendations | `sk-...` |

#### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:4000/api/v1` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `UA-XXXXX-Y` |
| `NEXT_PUBLIC_FEATURE_FLAGS` | Enabled feature flags | `recommendations,darkMode` |

## Project Structure

### Overall Structure

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

### Frontend Structure

```
src/
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   └── ...
│   ├── books/                  # Book-related components
│   ├── reviews/                # Review-related components
│   ├── user/                   # User profile components
│   └── recommendations/        # Recommendation components
├── pages/                      # Next.js pages
│   ├── index.tsx               # Home page
│   ├── books/
│   │   ├── index.tsx           # Books list page
│   │   └── [id].tsx            # Book detail page
│   ├── reviews/
│   ├── profile/
│   └── ...
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useBooks.ts
│   └── ...
├── services/                   # API service layer
│   ├── api.ts                  # Base API client
│   ├── auth.service.ts
│   ├── books.service.ts
│   └── ...
├── store/                      # Redux store
│   ├── index.ts                # Store configuration
│   ├── auth/                   # Auth state management
│   ├── books/                  # Books state management
│   └── ...
├── utils/                      # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── ...
└── styles/                     # Global styles and theme
    ├── theme.ts                # Material UI theme
    ├── global.css              # Global CSS
    └── ...
```

### Backend Structure

```
src/
├── config/                     # Configuration
│   ├── index.ts                # Config loader
│   ├── database.ts             # Database configuration
│   └── ...
├── controllers/                # Route controllers
│   ├── auth.controller.ts
│   ├── books.controller.ts
│   └── ...
├── middlewares/                # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── ...
├── models/                     # Data models
│   ├── user.model.ts
│   ├── book.model.ts
│   └── ...
├── routes/                     # API routes
│   ├── index.ts                # Route aggregator
│   ├── auth.routes.ts
│   ├── books.routes.ts
│   └── ...
├── services/                   # Business logic
│   ├── auth.service.ts
│   ├── book.service.ts
│   └── ...
├── utils/                      # Utility functions
│   ├── errors.ts
│   ├── logger.ts
│   └── ...
├── app.ts                      # Express app setup
└── index.ts                    # Server entry point
```

## Development Workflow

### Git Workflow

We follow a feature branch workflow:

1. Create a new branch from `main` for each feature or bugfix:
   ```bash
   git checkout -b feature/feature-name
   ```

2. Make your changes, commit frequently with descriptive messages:
   ```bash
   git commit -m "feat: add book rating component"
   ```

3. Push your branch and create a Pull Request in GitHub:
   ```bash
   git push -u origin feature/feature-name
   ```

4. After code review and CI checks pass, merge to `main`

### Commit Message Convention

We use the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Common types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process or tools

Example:
```
feat(reviews): add star rating component

- Implemented interactive star rating component
- Added hover effects
- Added accessibility features

Closes #123
```

### Code Review Process

1. All code changes require a Pull Request (PR)
2. PRs need at least one approval from a code owner
3. CI checks must pass:
   - Linting
   - Unit tests
   - Integration tests
   - Build verification
4. PR descriptions should include:
   - Summary of changes
   - Testing done
   - Screenshots for UI changes
   - Related issue numbers

## Architecture Overview

### High-Level Architecture

The BookReview Platform uses a client-server architecture:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │◄────►│   Server    │◄────►│    Data     │
│  (Next.js)  │      │ (Express.js)│      │   Storage   │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Frontend Architecture

The frontend uses a component-based architecture with React and Next.js:

```
┌─────────────────────────────────────┐
│            Application              │
└───────────────────┬─────────────────┘
                    │
        ┌───────────┴────────┐
        │                    │
┌───────▼───────┐    ┌───────▼───────┐
│     Pages     │    │  Components   │
└───────┬───────┘    └───────┬───────┘
        │                    │
┌───────▼───────┐    ┌───────▼───────┐
│    Hooks      │    │   Services    │
└───────┬───────┘    └───────┬───────┘
        │                    │
        └────────┐  ┌────────┘
                 │  │
           ┌─────▼──▼─────┐
           │    Store     │
           └──────────────┘
```

Key concepts:
- **Pages**: Next.js page components for routing
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for stateful logic
- **Services**: API communication layer
- **Store**: Redux state management

### Backend Architecture

The backend follows a layered architecture:

```
┌─────────────────────────────────────┐
│            Express App              │
└───────────────────┬─────────────────┘
                    │
        ┌───────────┴────────┐
        │                    │
┌───────▼───────┐    ┌───────▼───────┐
│    Routes     │    │  Middleware   │
└───────┬───────┘    └───────────────┘
        │
┌───────▼───────┐
│  Controllers  │
└───────┬───────┘
        │
┌───────▼───────┐
│   Services    │
└───────┬───────┘
        │
┌───────▼───────┐
│    Models     │
└───────┬───────┘
        │
┌───────▼───────┐
│    Storage    │
└───────────────┘
```

Key concepts:
- **Routes**: Define API endpoints
- **Middleware**: Process requests before controllers
- **Controllers**: Handle HTTP requests/responses
- **Services**: Implement business logic
- **Models**: Define data structures
- **Storage**: Data persistence layer

### Data Flow

1. **Frontend to Backend**:
   - React components call services
   - Services make HTTP requests to backend API
   - Responses update Redux store
   - Components re-render with new data

2. **Backend Processing**:
   - Routes direct requests to controllers
   - Controllers validate inputs
   - Services implement business logic
   - Models define data structure
   - Storage layer handles persistence

## Frontend Development

### Component Development

Components follow a consistent structure:

```tsx
// Button.tsx
import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary', 
  disabled = false 
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Adding a New Page

1. Create a new file in `pages/` directory:

```tsx
// pages/books/new.tsx
import React from 'react';
import { Layout } from 'components/layout';
import { BookForm } from 'components/books';
import { useBooks } from 'hooks/useBooks';

const NewBookPage: React.FC = () => {
  const { createBook } = useBooks();
  
  const handleSubmit = (bookData) => {
    createBook(bookData);
  };
  
  return (
    <Layout title="Add New Book">
      <BookForm onSubmit={handleSubmit} />
    </Layout>
  );
};

export default NewBookPage;
```

2. The page is automatically available at `/books/new`

### State Management

For Redux state management:

1. Define slice in `store/books/slice.ts`:

```tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BooksState {
  books: Book[];
  loading: boolean;
  error: string | null;
}

const initialState: BooksState = {
  books: [],
  loading: false,
  error: null
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    getBooksStart(state) {
      state.loading = true;
      state.error = null;
    },
    getBooksSuccess(state, action: PayloadAction<Book[]>) {
      state.books = action.payload;
      state.loading = false;
    },
    getBooksFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { getBooksStart, getBooksSuccess, getBooksFailure } = booksSlice.actions;
export default booksSlice.reducer;
```

2. Create thunks in `store/books/thunks.ts`:

```tsx
import { AppThunk } from 'store';
import { getBooksStart, getBooksSuccess, getBooksFailure } from './slice';
import { booksService } from 'services/books.service';

export const fetchBooks = (): AppThunk => async (dispatch) => {
  try {
    dispatch(getBooksStart());
    const books = await booksService.getBooks();
    dispatch(getBooksSuccess(books));
  } catch (error) {
    dispatch(getBooksFailure(error.message));
  }
};
```

3. Use in components:

```tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooks } from 'store/books/thunks';
import { selectBooks, selectBooksLoading } from 'store/books/selectors';

const BookList: React.FC = () => {
  const dispatch = useDispatch();
  const books = useSelector(selectBooks);
  const loading = useSelector(selectBooksLoading);
  
  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {books.map(book => (
        <BookItem key={book.id} book={book} />
      ))}
    </div>
  );
};
```

### API Service Development

Create service files for API communication:

```tsx
// services/books.service.ts
import { apiClient } from './api';
import { Book, BookCreationData } from 'types/book';

export const booksService = {
  getBooks: async (): Promise<Book[]> => {
    const response = await apiClient.get('/books');
    return response.data.data.books;
  },
  
  getBook: async (id: string): Promise<Book> => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data.data;
  },
  
  createBook: async (bookData: BookCreationData): Promise<Book> => {
    const response = await apiClient.post('/books', bookData);
    return response.data.data;
  }
};
```

### Theming and Styling

1. Use Material UI theme for consistent styling:

```tsx
// styles/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

2. Apply theme in `_app.tsx`:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from 'styles/theme';

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
```

## Backend Development

### Creating a New API Endpoint

1. Define route in `routes/books.routes.ts`:

```typescript
import express from 'express';
import { BookController } from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const bookController = new BookController();

router.get('/', bookController.getBooks);
router.get('/:id', bookController.getBookById);
router.post('/', authMiddleware, bookController.createBook);
router.put('/:id', authMiddleware, bookController.updateBook);
router.delete('/:id', authMiddleware, bookController.deleteBook);

export default router;
```

2. Create controller in `controllers/book.controller.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';
import { catchAsync } from '../utils/catchAsync';

export class BookController {
  private bookService: BookService;
  
  constructor() {
    this.bookService = new BookService();
  }
  
  getBooks = catchAsync(async (req: Request, res: Response) => {
    const options = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      sort: req.query.sort as string,
      order: req.query.order as string
    };
    
    const books = await this.bookService.listBooks(options);
    
    res.status(200).json({
      status: 'success',
      data: books,
      error: null
    });
  });
  
  getBookById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const book = await this.bookService.getBookById(id);
    
    res.status(200).json({
      status: 'success',
      data: book,
      error: null
    });
  });
  
  createBook = catchAsync(async (req: Request, res: Response) => {
    const bookData = req.body;
    const newBook = await this.bookService.createBook(bookData);
    
    res.status(201).json({
      status: 'success',
      data: newBook,
      error: null
    });
  });
  
  // Other controller methods...
}
```

3. Implement service in `services/book.service.ts`:

```typescript
import { Book } from '../models/book.model';
import { FileStorageService } from './storage.service';
import { NotFoundError, ValidationError } from '../utils/errors';

export class BookService {
  private storageService: FileStorageService;
  
  constructor() {
    this.storageService = new FileStorageService();
  }
  
  async listBooks(options: any): Promise<Book[]> {
    return this.storageService.readMany('books', options);
  }
  
  async getBookById(id: string): Promise<Book> {
    const book = await this.storageService.read('books', id);
    
    if (!book) {
      throw new NotFoundError('Book not found');
    }
    
    return book;
  }
  
  async createBook(bookData: Partial<Book>): Promise<Book> {
    // Validation
    if (!bookData.title || !bookData.author) {
      throw new ValidationError('Title and author are required');
    }
    
    const id = `bk_${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const newBook: Book = {
      id,
      title: bookData.title,
      author: bookData.author,
      description: bookData.description || '',
      coverImage: bookData.coverImage || '/images/covers/default.jpg',
      publishedYear: bookData.publishedYear,
      genres: bookData.genres || [],
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.storageService.write('books', id, newBook);
    return newBook;
  }
  
  // Other service methods...
}
```

### Error Handling

Use a centralized error handling pattern:

1. Define error classes in `utils/errors.ts`:

```typescript
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'error' : 'fail';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

// Other error classes...
```

2. Create error handling middleware in `middlewares/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`Error: ${err.message}`, { error: err });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      data: null,
      error: {
        code: err.statusCode,
        message: err.message
      }
    });
  }

  // Unknown errors
  return res.status(500).json({
    status: 'error',
    data: null,
    error: {
      code: 500,
      message: 'Something went wrong'
    }
  });
};
```

3. Use the error middleware in `app.ts`:

```typescript
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

// Middleware setup...

// Routes
app.use('/api/v1', routes);

// Error handling middleware (must be after routes)
app.use(errorMiddleware);

export default app;
```

4. Use error handling in controllers:

```typescript
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError } from '../utils/errors';

export const getBookById = catchAsync(async (req, res, next) => {
  const book = await bookService.getBookById(req.params.id);
  
  if (!book) {
    return next(new NotFoundError('Book not found'));
  }
  
  res.status(200).json({
    status: 'success',
    data: book
  });
});
```

### Data Storage

The file-based storage service:

```typescript
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class FileStorageService {
  private basePath: string;
  
  constructor() {
    this.basePath = path.join(process.cwd(), 'data');
  }
  
  async read(collection: string, id: string): Promise<any> {
    try {
      const filePath = path.join(this.basePath, collection, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }
  
  async readMany(collection: string, options: any = {}): Promise<any[]> {
    const dirPath = path.join(this.basePath, collection);
    
    try {
      const files = await fs.readdir(dirPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const dataPromises = jsonFiles.map(async (file) => {
        const filePath = path.join(dirPath, file);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
      });
      
      let results = await Promise.all(dataPromises);
      
      // Apply filters if specified
      if (options.filter) {
        results = this.applyFilters(results, options.filter);
      }
      
      // Apply sorting if specified
      if (options.sort && options.order) {
        results = this.applySorting(results, options.sort, options.order);
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      
      const paginatedResults = results.slice(startIndex, endIndex);
      
      return {
        results: paginatedResults,
        pagination: {
          total: results.length,
          page,
          pageSize: limit,
          pages: Math.ceil(results.length / limit)
        }
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(dirPath, { recursive: true });
        return { results: [], pagination: { total: 0, page: 1, pageSize: 20, pages: 0 } };
      }
      throw error;
    }
  }
  
  async write(collection: string, id: string, data: any): Promise<void> {
    const dirPath = path.join(this.basePath, collection);
    const filePath = path.join(dirPath, `${id}.json`);
    
    try {
      await fs.mkdir(dirPath, { recursive: true });
      
      // Create a temporary file to ensure atomic write
      const tempId = uuidv4();
      const tempPath = path.join(dirPath, `${tempId}.tmp`);
      
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename temp file to target file (atomic operation)
      await fs.rename(tempPath, filePath);
      
    } catch (error) {
      throw error;
    }
  }
  
  async delete(collection: string, id: string): Promise<void> {
    const filePath = path.join(this.basePath, collection, `${id}.json`);
    
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  
  private applyFilters(data: any[], filters: Record<string, any>): any[] {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        // Handle array contains
        if (Array.isArray(item[key]) && !Array.isArray(value)) {
          return item[key].includes(value);
        }
        
        // Handle string partial match
        if (typeof item[key] === 'string' && typeof value === 'string') {
          return item[key].toLowerCase().includes(value.toLowerCase());
        }
        
        return item[key] === value;
      });
    });
  }
  
  private applySorting(data: any[], sortField: string, order: string): any[] {
    return [...data].sort((a, b) => {
      if (a[sortField] < b[sortField]) return order === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
```

## Testing

### Testing Strategy

The project uses a comprehensive testing strategy:

1. **Unit Tests**: Test individual components and functions
2. **Integration Tests**: Test API endpoints and service interactions
3. **End-to-End Tests**: Test complete user flows

### Frontend Testing

Use Jest and React Testing Library for frontend tests:

```tsx
// components/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct label', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    
    const button = screen.getByText('Click Me');
    expect(button).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} />);
    
    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies disabled state correctly', () => {
    const handleClick = jest.fn();
    render(<Button label="Click Me" onClick={handleClick} disabled />);
    
    const button = screen.getByText('Click Me');
    expect(button).toBeDisabled();
  });
});
```

### Backend Testing

Use Jest for backend tests:

```typescript
// services/book.service.test.ts
import { BookService } from '../services/book.service';
import { FileStorageService } from '../services/storage.service';

// Mock the storage service
jest.mock('../services/storage.service');

describe('BookService', () => {
  let bookService: BookService;
  let mockStorageService: jest.Mocked<FileStorageService>;
  
  beforeEach(() => {
    mockStorageService = new FileStorageService() as jest.Mocked<FileStorageService>;
    bookService = new BookService();
    (bookService as any).storageService = mockStorageService;
  });
  
  describe('getBookById', () => {
    it('should return a book if found', async () => {
      const mockBook = {
        id: 'book-1',
        title: 'Test Book',
        author: 'Test Author'
      };
      
      mockStorageService.read.mockResolvedValue(mockBook);
      
      const result = await bookService.getBookById('book-1');
      
      expect(result).toEqual(mockBook);
      expect(mockStorageService.read).toHaveBeenCalledWith('books', 'book-1');
    });
    
    it('should throw NotFoundError if book not found', async () => {
      mockStorageService.read.mockResolvedValue(null);
      
      await expect(bookService.getBookById('non-existent')).rejects.toThrow('Book not found');
    });
  });
  
  describe('createBook', () => {
    it('should create a book with valid data', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        description: 'Description'
      };
      
      mockStorageService.write.mockResolvedValue(undefined);
      
      const result = await bookService.createBook(bookData);
      
      expect(result.title).toBe('New Book');
      expect(result.author).toBe('New Author');
      expect(result.id).toBeDefined();
      expect(mockStorageService.write).toHaveBeenCalledWith('books', expect.any(String), expect.objectContaining(bookData));
    });
    
    it('should throw ValidationError if title is missing', async () => {
      const bookData = {
        author: 'New Author'
      };
      
      await expect(bookService.createBook(bookData)).rejects.toThrow('Title and author are required');
    });
  });
});
```

### End-to-End Testing

Use Cypress for end-to-end testing:

```javascript
// cypress/integration/bookDetails.spec.js
describe('Book Details Page', () => {
  beforeEach(() => {
    // Mock API response
    cy.intercept('GET', '/api/v1/books/bk_123', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          id: 'bk_123',
          title: 'Test Book',
          author: 'Test Author',
          description: 'A test book description',
          coverImage: '/images/covers/test.jpg',
          averageRating: 4.5,
          reviewCount: 10
        }
      }
    }).as('getBook');
    
    // Visit the book details page
    cy.visit('/books/bk_123');
  });
  
  it('displays book details correctly', () => {
    cy.wait('@getBook');
    
    cy.get('h1').should('contain', 'Test Book');
    cy.get('[data-testid="book-author"]').should('contain', 'Test Author');
    cy.get('[data-testid="book-rating"]').should('contain', '4.5');
    cy.get('[data-testid="book-review-count"]').should('contain', '10');
  });
  
  it('allows adding book to favorites when logged in', () => {
    // Mock authentication
    cy.window().then(window => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('user', JSON.stringify({ id: 'user-1', name: 'Test User' }));
    });
    
    // Mock favorites API
    cy.intercept('POST', '/api/v1/users/me/favorites', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { message: 'Book added to favorites' }
      }
    }).as('addFavorite');
    
    // Reload page after setting auth state
    cy.reload();
    cy.wait('@getBook');
    
    // Click favorite button
    cy.get('[data-testid="favorite-button"]').click();
    cy.wait('@addFavorite');
    
    // Verify UI updates
    cy.get('[data-testid="favorite-button"]').should('have.class', 'favorited');
  });
});
```

### Running Tests

```bash
# Run frontend tests
cd frontend
npm run test

# Run backend tests
cd backend
npm run test

# Run end-to-end tests
npm run e2e
```

## Deployment

### Deployment Environments

The project has three deployment environments:

1. **Development**: For ongoing development work
2. **Staging**: For testing before production
3. **Production**: Live user-facing environment

### Deployment Process

1. **Build Frontend**:

```bash
cd frontend
npm run build
```

2. **Build Backend**:

```bash
cd backend
npm run build
```

3. **Deploy with Docker**:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      # Backend tests
      - name: Install backend dependencies
        run: cd backend && npm install
      - name: Run backend linting
        run: cd backend && npm run lint
      - name: Run backend tests
        run: cd backend && npm run test
      
      # Frontend tests
      - name: Install frontend dependencies
        run: cd frontend && npm install
      - name: Run frontend linting
        run: cd frontend && npm run lint
      - name: Run frontend tests
        run: cd frontend && npm run test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      # Build and push Docker images
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
      - name: Login to DockerHub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      # Build and push frontend
      - name: Build and push frontend
        uses: docker/build-push-action@v2
        with:
          context: ./frontend
          push: true
          tags: bookreview/frontend:latest
      
      # Build and push backend
      - name: Build and push backend
        uses: docker/build-push-action@v2
        with:
          context: ./backend
          push: true
          tags: bookreview/backend:latest
      
      # Deploy to server
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/bookreview
            docker-compose pull
            docker-compose down
            docker-compose up -d
```

## Common Issues and Solutions

### Authentication Issues

**Issue**: Token expiration causing unexpected logouts

**Solution**:
- Implement refresh token rotation
- Add token expiry time check on frontend
- Refresh token before expiration

```typescript
// services/auth.service.ts
// Add refresh token logic
const checkAndRefreshToken = async () => {
  const token = localStorage.getItem('token');
  const tokenExp = localStorage.getItem('tokenExp');
  
  if (!token || !tokenExp) return;
  
  const expiry = new Date(tokenExp).getTime();
  const now = new Date().getTime();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (expiry - now < fiveMinutes) {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      const { token: newToken, expiresAt } = response.data.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('tokenExp', expiresAt);
    } catch (error) {
      // Handle refresh error
      console.error('Failed to refresh token', error);
    }
  }
};
```

### File Storage Race Conditions

**Issue**: Concurrent writes causing data corruption

**Solution**:
- Implement file locking mechanism
- Use atomic file operations

```typescript
// services/storage.service.ts
// Add file locking
import lockfile from 'proper-lockfile';

async write(collection: string, id: string, data: any): Promise<void> {
  const dirPath = path.join(this.basePath, collection);
  const filePath = path.join(dirPath, `${id}.json`);
  
  try {
    await fs.mkdir(dirPath, { recursive: true });
    
    // Acquire a lock before writing
    const release = await lockfile.lock(filePath, { 
      retries: 5,
      stale: 10000
    }).catch(() => null);
    
    try {
      // Create a temporary file to ensure atomic write
      const tempId = uuidv4();
      const tempPath = path.join(dirPath, `${tempId}.tmp`);
      
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2));
      
      // Rename temp file to target file (atomic operation)
      await fs.rename(tempPath, filePath);
    } finally {
      // Release the lock
      if (release) await release();
    }
    
  } catch (error) {
    throw error;
  }
}
```

### Performance Issues

**Issue**: Slow book search with large datasets

**Solution**:
- Implement in-memory index
- Add caching layer

```typescript
// services/index.service.ts
export class IndexService {
  private indexes: Record<string, any> = {};
  
  buildIndex(collection: string, data: any[], fields: string[]) {
    const index = {};
    
    data.forEach(item => {
      fields.forEach(field => {
        const value = item[field];
        
        if (!value) return;
        
        if (typeof value === 'string') {
          // Split into words and create index
          const words = value.toLowerCase().split(/\W+/).filter(word => word.length > 2);
          
          words.forEach(word => {
            if (!index[word]) {
              index[word] = new Set();
            }
            index[word].add(item.id);
          });
        }
      });
    });
    
    this.indexes[collection] = index;
    return index;
  }
  
  search(collection: string, query: string): string[] {
    const index = this.indexes[collection];
    if (!index) return [];
    
    const words = query.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    
    if (words.length === 0) return [];
    
    // Get matches for each word
    const matches = words.map(word => {
      return index[word] || new Set();
    });
    
    // Find items that match all words
    const intersection = [...matches.reduce((acc, set) => {
      return new Set([...acc].filter(id => set.has(id)));
    })];
    
    return intersection;
  }
}
```

## Contributing Guidelines

### Code Standards

1. **Formatting**: Use Prettier with project configuration
2. **Naming Conventions**:
   - Use PascalCase for components and classes
   - Use camelCase for variables, functions, methods
   - Use kebab-case for file names
   - Use UPPER_CASE for constants
3. **File Structure**: Group files by feature/domain
4. **Documentation**: Add JSDoc comments to functions and classes

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Update documentation if needed
4. Create PR with descriptive title and details
5. Address code review comments
6. Squash commits before merging

### Code Review Checklist

- Does the code follow project standards?
- Are there appropriate tests?
- Is the code efficient and maintainable?
- Is error handling comprehensive?
- Are there security concerns?
- Is the documentation updated?

## Changelog

### v1.0 (August 31, 2025)
- Initial developer guide release
