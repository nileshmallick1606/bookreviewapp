import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { deleteReview } from '../../services/reviewService';

interface DeleteReviewDialogProps {
  reviewId: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const DeleteReviewDialog: React.FC<DeleteReviewDialogProps> = ({
  reviewId,
  open,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteReview(reviewId);
      
      setSuccess(true);
      
      // Close and notify parent after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error deleting review:', err);
      setError('Failed to delete review. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        aria-labelledby="delete-review-title"
        aria-describedby="delete-review-description"
      >
        <DialogTitle id="delete-review-title">
          Delete Review
        </DialogTitle>
        
        <DialogContent>
          <DialogContentText id="delete-review-description">
            Are you sure you want to delete this review? This action cannot be undone.
          </DialogContentText>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={onClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Review deleted successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteReviewDialog;
