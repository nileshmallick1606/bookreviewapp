import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Box, 
  Pagination, 
  FormControl, 
  MenuItem, 
  Select, 
  Typography, 
  Container,
  Skeleton,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { useRouter } from 'next/router';
import { BookService, PaginatedBooks } from '../../services/bookService';
import BookCard from './BookCard';

/**
 * Component for displaying a paginated list of books
 */
const BookList: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookData, setBookData] = useState<PaginatedBooks | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const router = useRouter();
  
  // Effect to fetch books when parameters change
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BookService.getBooks(page, pageSize, sortBy, sortOrder);
        setBookData(data);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
        console.error('Error loading books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, pageSize, sortBy, sortOrder]);

  // Update URL with query parameters
  useEffect(() => {
    router.replace({
      pathname: router.pathname,
      query: { page, pageSize, sortBy, sortOrder }
    }, undefined, { shallow: true });
  }, [page, pageSize, sortBy, sortOrder, router]);

  // Event handlers
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setPageSize(event.target.value as number);
    setPage(1); // Reset to first page when changing page size
  };

  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handleSortOrderChange = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value);
    setPage(1);
  };

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(pageSize).fill(0).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={`skeleton-${index}`}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <Skeleton variant="rectangular" height={200} />
          <Box sx={{ pt: 0.5 }}>
            <Skeleton />
            <Skeleton width="60%" />
          </Box>
        </Box>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="xl">
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and sort options */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, sm: 0 } }}>
          Books
        </Typography>
        
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap' 
        }}>
          {/* Sort by */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortBy}
              onChange={handleSortByChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="publishedYear">Published Year</MenuItem>
              {/* Add more sort options here */}
            </Select>
          </FormControl>

          {/* Sort order */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={sortOrder}
              onChange={handleSortOrderChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>

          {/* Page size */}
          <FormControl size="small" sx={{ minWidth: 80 }}>
            <Select
              value={pageSize}
              onChange={handlePageSizeChange}
              displayEmpty
              variant="outlined"
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Book grid */}
      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : bookData?.books && bookData.books.length > 0 ? (
          bookData.books.map(book => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
              <BookCard book={book} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h6">
                No books found.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* Pagination */}
      {bookData && bookData.totalPages > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4, 
          mb: 2 
        }}>
          <Pagination
            count={bookData.totalPages}
            page={page}
            onChange={handlePageChange}
            size="large"
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default BookList;
