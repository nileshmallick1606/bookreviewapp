import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import ImageUpload from '../common/ImageUpload';
import { getReview, updateReview } from '../../services/reviewService';

interface EditReviewFormProps {
  reviewId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditReviewForm: React.FC<EditReviewFormProps> = ({
  reviewId,
  open,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState<string>('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const charLimit = 5000;
  
  // Load existing review data when the modal opens
  useEffect(() => {
    if (!open) return;
    
    const loadReview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const reviewData = await getReview(reviewId);
        
        setRating(reviewData.rating);
        setReviewText(reviewData.text);
        setExistingImageUrls(reviewData.imageUrls || []);
      } catch (err) {
        console.error('Error loading review:', err);
        setError('Failed to load review data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadReview();
  }, [reviewId, open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      setError('Please select a rating');
      return;
    }
    
    if (!reviewText.trim()) {
      setError('Please write a review');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare form data for multipart upload
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('text', reviewText);
      
      // Add existing image URLs that weren't removed
      formData.append('existingImageUrls', JSON.stringify(existingImageUrls));
      
      // Add new images if any
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      // Update the review
      await updateReview(reviewId, formData);
      
      setSuccess(true);
      
      // Close the modal after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Failed to update review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Your Review</DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box mb={3}>
              <Typography component="legend">Your Rating</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(_, newValue) => setRating(newValue)}
                size="large"
                precision={1}
              />
            </Box>
            
            <Box mb={3}>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                label="Your Review"
                placeholder="Share your thoughts about this book..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                inputProps={{ maxLength: charLimit }}
                helperText={`${reviewText.length}/${charLimit} characters`}
                error={reviewText.length === charLimit}
              />
            </Box>
            
            {existingImageUrls.length > 0 && (
              <Box mb={3}>
                <Typography gutterBottom>Current Images</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {existingImageUrls.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={url}
                        alt={`Review image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRemoveExistingImage(index)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          minWidth: 'auto',
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.7)',
                          },
                        }}
                      >
                        X
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            
            <Box mb={3}>
              <Typography gutterBottom>Add New Images (Optional)</Typography>
              <ImageUpload
                images={images}
                onChange={setImages}
                maxFiles={5 - existingImageUrls.length}
                maxSizeMB={5}
              />
            </Box>
            
            {error && (
              <Box mb={2}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || submitting || !rating || !reviewText.trim()}
          startIcon={submitting && <CircularProgress size={20} color="inherit" />}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Review updated successfully!
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditReviewForm;
