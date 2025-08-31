# BookReview Platform: Component Development Exercise

**Version:** 1.0  
**Date:** August 31, 2025  
**Author:** Training Team

This hands-on exercise guides developers through the process of creating and testing a new frontend component for the BookReview platform.

## Exercise Overview

In this exercise, you will build a `BookCard` component that displays book information in a card format. This component will be used throughout the application to display books in lists, search results, and recommendations.

**Learning Objectives:**
- Understand the component architecture of the BookReview platform
- Follow platform best practices for component development
- Implement Material UI components according to the design system
- Write effective unit tests for React components
- Create proper documentation for components

**Estimated Time:** 3 hours

## Prerequisites

- Local development environment set up
- Familiarity with React and Material UI
- Basic understanding of Jest and React Testing Library

## Exercise Steps

### Step 1: Understanding the Requirements

The `BookCard` component should:

1. Display book information:
   - Cover image
   - Title
   - Author
   - Average rating (stars)
   - Genre tags
   - Publication year

2. Support the following interactions:
   - Click to view book details
   - Add to favorites (with authenticated user)
   - Quick-view rating details on hover/focus

3. Support multiple display variants:
   - Standard: Full information with medium-sized cover
   - Compact: Minimal information with small cover
   - Featured: Large cover with expanded information

4. Meet accessibility requirements:
   - Proper semantic HTML
   - Keyboard navigation
   - Screen reader support
   - Sufficient color contrast

### Step 2: Component Planning

Before writing code, plan your component:

1. **Component Structure:**
   - Decide on props interface
   - Identify potential sub-components
   - Plan state management needs

2. **Draw a simple diagram** showing the component hierarchy and data flow.

3. **Create a component API design** document outlining:
   - Props with types and descriptions
   - Events emitted
   - States and transitions

### Step 3: Implementation

Now, implement the component:

1. **Create the component files:**

```bash
mkdir -p frontend/src/components/books/BookCard
touch frontend/src/components/books/BookCard/index.ts
touch frontend/src/components/books/BookCard/BookCard.tsx
touch frontend/src/components/books/BookCard/BookCard.test.tsx
touch frontend/src/components/books/BookCard/BookCard.types.ts
touch frontend/src/components/books/BookCard/BookCard.styles.ts
```

2. **Define the component types:**

In `BookCard.types.ts`, define the component props interface:

```typescript
import { Book } from '../../../types/Book';

export type BookCardVariant = 'standard' | 'compact' | 'featured';

export interface BookCardProps {
  book: Book;
  variant?: BookCardVariant;
  onBookClick?: (bookId: string) => void;
  onFavoriteToggle?: (bookId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
}
```

3. **Implement the component:**

In `BookCard.tsx`, create the component:

```typescript
import React, { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, 
         IconButton, Chip, Box, Rating, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder, Info } from '@mui/icons-material';
import { BookCardProps, BookCardVariant } from './BookCard.types';
import { useStyles } from './BookCard.styles';

const getImageSize = (variant: BookCardVariant) => {
  switch (variant) {
    case 'compact': return { height: 120 };
    case 'featured': return { height: 250 };
    default: return { height: 180 };
  }
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'standard',
  onBookClick,
  onFavoriteToggle,
  isFavorite = false,
  isAuthenticated = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const { id, title, author, coverImage, averageRating, genres, publicationYear } = book;
  const imageSize = getImageSize(variant);
  
  const handleBookClick = () => {
    if (onBookClick) {
      onBookClick(id);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle && isAuthenticated) {
      onFavoriteToggle(id, !isFavorite);
    }
  };

  return (
    <Card 
      onClick={handleBookClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsHovering(true)}
      onBlur={() => setIsHovering(false)}
      tabIndex={0}
      aria-label={`Book: ${title} by ${author}`}
      sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardMedia
        component="img"
        image={coverImage || '/images/placeholder-cover.png'}
        alt={`Cover of ${title}`}
        sx={imageSize}
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {author}
        </Typography>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={averageRating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" ml={1}>
            ({averageRating.toFixed(1)})
          </Typography>
        </Box>
        
        {variant !== 'compact' && (
          <>
            <Box display="flex" flexWrap="wrap" gap={0.5} my={1}>
              {genres.slice(0, variant === 'featured' ? 3 : 2).map((genre) => (
                <Chip key={genre} label={genre} size="small" />
              ))}
              {genres.length > (variant === 'featured' ? 3 : 2) && (
                <Chip label={`+${genres.length - (variant === 'featured' ? 3 : 2)}`} size="small" />
              )}
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {publicationYear}
            </Typography>
          </>
        )}
      </CardContent>
      
      <CardActions disableSpacing>
        {isAuthenticated && (
          <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton 
              onClick={handleFavoriteToggle}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              size="small"
            >
              {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        )}
        
        <Box flexGrow={1} />
        
        <Tooltip title="View details">
          <IconButton 
            onClick={handleBookClick}
            aria-label="View book details"
            size="small"
          >
            <Info />
          </IconButton>
        </Tooltip>
      </CardActions>
      
      {isHovering && variant !== 'compact' && (
        <Box 
          position="absolute" 
          top={0} 
          right={0} 
          p={1} 
          bgcolor="rgba(0,0,0,0.7)" 
          color="white"
          borderBottomLeftRadius={4}
        >
          <Typography variant="caption">
            {book.ratingsCount} ratings
          </Typography>
        </Box>
      )}
    </Card>
  );
};
```

4. **Add component styles:**

In `BookCard.styles.ts`:

```typescript
import { Theme } from '@mui/material/styles';

export const useStyles = (theme: Theme) => ({
  card: {
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[4],
    },
  },
  featuredCard: {
    borderRadius: theme.shape.borderRadius * 2,
  },
  compactCard: {
    display: 'flex',
    flexDirection: 'row',
  },
});
```

5. **Create barrel file for exports:**

In `index.ts`:

```typescript
export * from './BookCard';
export * from './BookCard.types';
```

### Step 4: Component Testing

Write tests for your component in `BookCard.test.tsx`:

```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const mockBook = {
  id: 'book-1',
  title: 'The Great Novel',
  author: 'Jane Author',
  coverImage: '/images/cover-1.jpg',
  averageRating: 4.5,
  ratingsCount: 125,
  genres: ['Fiction', 'Adventure', 'Mystery'],
  publicationYear: 2023,
  description: 'A thrilling story about adventure and mystery.'
};

describe('BookCard Component', () => {
  test('renders book information correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} />
      </ThemeProvider>
    );
    
    expect(screen.getByText('The Great Novel')).toBeInTheDocument();
    expect(screen.getByText('Jane Author')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('Fiction')).toBeInTheDocument();
    expect(screen.getByText('Adventure')).toBeInTheDocument();
  });
  
  test('calls onBookClick when card is clicked', () => {
    const handleClick = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} onBookClick={handleClick} />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /view book details/i }));
    expect(handleClick).toHaveBeenCalledWith('book-1');
  });
  
  test('renders favorite button only when user is authenticated', () => {
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} isAuthenticated={false} />
      </ThemeProvider>
    );
    
    expect(screen.queryByLabelText(/add to favorites/i)).not.toBeInTheDocument();
    
    rerender(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} isAuthenticated={true} />
      </ThemeProvider>
    );
    
    expect(screen.getByLabelText(/add to favorites/i)).toBeInTheDocument();
  });
  
  test('calls onFavoriteToggle when favorite button is clicked', () => {
    const handleFavoriteToggle = jest.fn();
    
    render(
      <ThemeProvider theme={theme}>
        <BookCard 
          book={mockBook} 
          isAuthenticated={true}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={false}
        />
      </ThemeProvider>
    );
    
    fireEvent.click(screen.getByLabelText(/add to favorites/i));
    expect(handleFavoriteToggle).toHaveBeenCalledWith('book-1', true);
  });
  
  test('displays compact variant correctly', () => {
    render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} variant="compact" />
      </ThemeProvider>
    );
    
    expect(screen.getByText('The Great Novel')).toBeInTheDocument();
    expect(screen.getByText('Jane Author')).toBeInTheDocument();
    expect(screen.queryByText('2023')).not.toBeInTheDocument();
    expect(screen.queryByText('Fiction')).not.toBeInTheDocument();
  });
  
  test('displays ratings count on hover', async () => {
    render(
      <ThemeProvider theme={theme}>
        <BookCard book={mockBook} />
      </ThemeProvider>
    );
    
    const card = screen.getByRole('button', { name: /view book details/i }).closest('div');
    fireEvent.mouseEnter(card);
    
    expect(await screen.findByText('125 ratings')).toBeInTheDocument();
  });
});
```

### Step 5: Component Documentation

Document your component following JSDoc standards:

```typescript
/**
 * BookCard component displays book information in a card format
 * 
 * @component
 * @example
 * ```tsx
 * const book = {
 *   id: 'book-1',
 *   title: 'The Great Novel',
 *   author: 'Jane Author',
 *   coverImage: '/images/cover-1.jpg',
 *   averageRating: 4.5,
 *   ratingsCount: 125,
 *   genres: ['Fiction', 'Adventure'],
 *   publicationYear: 2023
 * };
 * 
 * <BookCard 
 *   book={book}
 *   variant="standard"
 *   onBookClick={(id) => console.log(`Navigate to book ${id}`)}
 *   onFavoriteToggle={(id, isFavorite) => console.log(`Toggle favorite: ${id}, ${isFavorite}`)}
 *   isFavorite={false}
 *   isAuthenticated={true}
 * />
 * ```
 */
```

### Step 6: Implementing the Component in a Page

Create a simple page to showcase your component:

1. Create a new file `frontend/src/pages/books/components-demo.tsx`:

```typescript
import React from 'react';
import { Container, Typography, Grid, Box, Paper, Divider } from '@mui/material';
import { BookCard } from '../../components/books/BookCard';

// Mock data
const books = [
  {
    id: 'book-1',
    title: 'The Great Novel',
    author: 'Jane Author',
    coverImage: '/images/covers/cover-1.jpg',
    averageRating: 4.5,
    ratingsCount: 125,
    genres: ['Fiction', 'Adventure', 'Mystery'],
    publicationYear: 2023,
    description: 'A thrilling story about adventure and mystery.'
  },
  // Add more mock books here
];

const ComponentsDemoPage = () => {
  const handleBookClick = (bookId: string) => {
    console.log(`Navigating to book: ${bookId}`);
  };

  const handleFavoriteToggle = (bookId: string, isFavorite: boolean) => {
    console.log(`Toggle favorite: ${bookId}, ${isFavorite}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        BookCard Component Demo
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Standard Variant</Typography>
        <Grid container spacing={3}>
          {books.map(book => (
            <Grid item xs={12} sm={6} md={4} key={book.id}>
              <BookCard
                book={book}
                variant="standard"
                onBookClick={handleBookClick}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={false}
                isAuthenticated={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Compact Variant</Typography>
        <Grid container spacing={3}>
          {books.map(book => (
            <Grid item xs={12} sm={6} key={book.id}>
              <BookCard
                book={book}
                variant="compact"
                onBookClick={handleBookClick}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={false}
                isAuthenticated={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Featured Variant</Typography>
        <Grid container spacing={3}>
          {books.map(book => (
            <Grid item xs={12} key={book.id}>
              <BookCard
                book={book}
                variant="featured"
                onBookClick={handleBookClick}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={true}
                isAuthenticated={true}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ComponentsDemoPage;
```

2. Navigate to this page in your development environment to see the component in action.

### Step 7: Testing and Accessibility Verification

1. **Run unit tests:**
```bash
cd frontend
npm run test -- --watch BookCard
```

2. **Verify accessibility:**
- Install and run the axe accessibility tool in your browser
- Test keyboard navigation by using Tab key to navigate through components
- Verify color contrast meets WCAG standards
- Test with a screen reader

3. **Test responsiveness:**
- Use browser dev tools to test on various screen sizes
- Verify the component layout adjusts appropriately

### Step 8: Code Review Preparation

1. Create a checklist for your own code review:
   - [ ] Component follows project structure guidelines
   - [ ] Props are properly typed
   - [ ] Component handles all required use cases
   - [ ] Tests cover both happy paths and edge cases
   - [ ] Documentation is complete
   - [ ] Accessibility considerations are addressed
   - [ ] Code follows style guidelines
   - [ ] No console errors or warnings

2. Create a pull request description that would:
   - Explain the component's purpose
   - Highlight key features
   - Note testing approach
   - Address any potential concerns or questions

### Step 9: Extension Challenges

If you complete the exercise early, try these extension challenges:

1. **Add animation:**
   - Implement smooth transitions when hovering over the card
   - Add a loading skeleton while the image loads

2. **Create a BookCardList component:**
   - Create a higher-level component that renders a list of BookCard components
   - Implement virtualization for performance with large lists

3. **Add interactive features:**
   - Implement a quick-view modal that shows more details without navigating away
   - Add the ability to rate a book directly from the card

## Submission and Evaluation

Submit your completed exercise by:

1. Creating a pull request in the training repository
2. Including screenshots of your component variants
3. Providing a summary of what you learned

Your submission will be evaluated on:

- **Functionality:** Does the component meet all requirements?
- **Code Quality:** Is the code well-structured, readable, and maintainable?
- **Testing:** Are tests comprehensive and well-written?
- **Documentation:** Is the component properly documented?
- **Accessibility:** Does the component meet accessibility standards?

## Resources

- [Material UI Documentation](https://mui.com/material-ui/getting-started/overview/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/fundamentals/accessibility-principles/)
- [BookReview Platform Component Guidelines](link-to-internal-documentation)

## Feedback

After completing this exercise, please provide feedback on your experience:

- What aspects of the exercise were most valuable?
- Were there any parts that were unclear or too challenging?
- How could this exercise be improved for future participants?

---

*This exercise is designed to be completed in a development environment with the BookReview platform codebase. For standalone learning, some adaptation may be required.*
