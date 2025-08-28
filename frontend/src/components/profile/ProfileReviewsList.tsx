// src/components/profile/ProfileReviewsList.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent, 
  CardMedia, 
  Rating,
  Grid,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider
} from '@mui/material';
import { getUserReviews, ReviewWithBook, PaginatedResponse } from '../../services/reviewService';
import { formatDate } from '../../utils/dateFormatter';

interface ProfileReviewsListProps {
  userId: string;
  isOwnProfile?: boolean;
}

const ProfileReviewsList: React.FC<ProfileReviewsListProps> = ({ userId, isOwnProfile = true }) => {
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0
  });
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getUserReviews(
        userId,
        pagination.page,
        pagination.limit,
        sortBy,
        sortOrder
      );
      
      setReviews(response.items);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Failed to load reviews. Please try again.');
      console.error('Error loading reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews when component mounts or filter/sort/pagination changes
  useEffect(() => {
    fetchReviews();
  }, [userId, pagination.page, sortBy, sortOrder]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination({ ...pagination, page: value });
  };

  // Handle sort by change with pagination reset
  const handleSortByChange = (value: 'date' | 'rating') => {
    setSortBy(value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  // Handle sort order change with pagination reset
  const handleSortOrderChange = (value: 'desc' | 'asc') => {
    setSortOrder(value);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" component="h2">
          {isOwnProfile ? 'My Reviews' : 'Reviews'} {reviews.length > 0 && `(${pagination.total})`}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              label="Sort By"
              onChange={(e) => handleSortByChange(e.target.value as 'date' | 'rating')}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="sort-order-label">Order</InputLabel>
            <Select
              labelId="sort-order-label"
              id="sort-order"
              value={sortOrder}
              label="Order"
              onChange={(e) => handleSortOrderChange(e.target.value as 'desc' | 'asc')}
            >
              <MenuItem value="desc">Descending</MenuItem>
              <MenuItem value="asc">Ascending</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : reviews.length === 0 ? (
        <Alert severity="info">
          {isOwnProfile 
            ? "You haven't written any reviews yet." 
            : "This user hasn't written any reviews yet."}
        </Alert>
      ) : (
        <Stack spacing={3}>
          {reviews.map((review) => (
            <Card key={review.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              <CardMedia
                component="img"
                sx={{ 
                  width: { xs: '100%', sm: 150 }, 
                  height: { xs: 200, sm: 'auto' },
                  objectFit: 'cover' 
                }}
                image={review.book.coverImage || '/images/book-placeholder.png'}
                alt={review.book.title}
              />
              <CardContent sx={{ flex: '1 0 auto' }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {review.book.title}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  by {review.book.author}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={review.rating} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {review.rating}/5
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                }}>
                  {review.text}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={pagination.totalPages} 
            page={pagination.page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
    </Box>
  );
};

export default ProfileReviewsList;
