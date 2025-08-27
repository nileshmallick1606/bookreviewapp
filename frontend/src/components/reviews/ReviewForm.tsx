import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Rating,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Snackbar,
  Tooltip
} from '@mui/material';
import { useRouter } from 'next/router';
import ImageUpload from '../common/ImageUpload';
import { createReview } from '../../services/reviewService';

interface ReviewFormProps {
  bookId: string;
  onSuccess?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookId, onSuccess }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const charLimit = 5000;
  
  const [ratingError, setRatingError] = useState(false);
  const [textError, setTextError] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error states
    setRatingError(false);
    setTextError(false);
    setError(null);
    
    // Validate form
    let hasError = false;
    
    if (!rating) {
      setRatingError(true);
      hasError = true;
    }
    
    if (!reviewText.trim()) {
      setTextError(true);
      hasError = true;
    }
    
    if (hasError) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare form data for multipart upload
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('text', reviewText);
      
      // Add images if any
      images.forEach((image, index) => {
        formData.append(`images`, image);
      });
      
      // Send review to API
      await createReview(bookId, formData);
      
      setSuccess(true);
      setRating(null);
      setReviewText('');
      setImages([]);
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Navigate back to book detail after a delay
        setTimeout(() => {
          router.push(`/books/${bookId}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Write a Review
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You can submit multiple reviews for this book to share different perspectives or update your thoughts over time.
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Box mb={3}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography component="legend">Your Rating</Typography>
              <Tooltip title="Rating is required">
                <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
              </Tooltip>
            </Box>
            <Rating
              name="rating"
              value={rating}
              onChange={(_, newValue) => {
                setRating(newValue);
                setRatingError(false);
                setError(null);
              }}
              size="large"
              precision={1}
              sx={ratingError ? { color: 'error.main' } : {}}
            />
            {ratingError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, opacity: 0.8 }}>
                Please select a rating
              </Typography>
            )}
          </Box>
          
          <Box mb={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography>Your Review</Typography>
              <Tooltip title="Review text is required">
                <Typography component="span" color="error" sx={{ ml: 0.5 }}>*</Typography>
              </Tooltip>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Share your thoughts about this book..."
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                if (e.target.value.trim()) {
                  setTextError(false);
                  setError(null);
                }
              }}
              inputProps={{ maxLength: charLimit }}
              helperText={textError ? 'Please enter your review' : `${reviewText.length}/${charLimit} characters`}
              error={textError || reviewText.length === charLimit}
            />
          </Box>
          
          <Box mb={3}>
            <Typography gutterBottom>Add Images (Optional)</Typography>
            <ImageUpload
              images={images}
              onChange={setImages}
              maxFiles={5}
              maxSizeMB={5}
            />
          </Box>
          
          {error && (
            <Box mb={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading || !rating || !reviewText.trim()}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
        
        <Snackbar
          open={success}
          autoHideDuration={5000}
          onClose={() => setSuccess(false)}
        >
          <Alert severity="success" onClose={() => setSuccess(false)}>
            Review submitted successfully!
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
