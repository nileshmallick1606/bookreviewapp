import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Book } from '../../services/bookService';
import BookCard from './BookCard';

const GridContainer = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  width: '100%',
  minHeight: 200,
}));

interface BookGridProps {
  /**
   * Books to display in the grid
   */
  books: Book[];
  /**
   * Whether the grid is in loading state
   */
  isLoading?: boolean;
  /**
   * Number of loading placeholders to show when loading
   */
  loadingCount?: number;
  /**
   * Message to display when there are no books
   */
  noResultsMessage?: string;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Responsive grid component for displaying books
 */
const BookGrid: React.FC<BookGridProps> = ({
  books,
  isLoading = false,
  loadingCount = 6,
  noResultsMessage = 'No books found',
  className,
}) => {
  // If loading, render placeholder cards
  if (isLoading) {
    return (
      <GridContainer container spacing={3} className={className}>
        {Array.from(new Array(loadingCount)).map((_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={`loading-${index}`}>
            <BookCard isLoading book={null as any} />
          </Grid>
        ))}
      </GridContainer>
    );
  }

  // If no books, render message
  if (!books || books.length === 0) {
    return (
      <NoResultsContainer className={className}>
        <Typography variant="h6" color="text.secondary" align="center">
          {noResultsMessage}
        </Typography>
      </NoResultsContainer>
    );
  }

  // Render the books grid
  return (
    <GridContainer container spacing={3} className={className}>
      {books.map((book) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={book.id}>
          <BookCard book={book} />
        </Grid>
      ))}
    </GridContainer>
  );
};

export default BookGrid;
