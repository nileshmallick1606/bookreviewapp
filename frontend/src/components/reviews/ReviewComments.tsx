import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Review, ReviewComment, addReviewComment } from '../../services/reviewService';

interface ReviewCommentsProps {
  review: Review;
  currentUserId?: string;
  onCommentAdded?: (updatedReview: Review) => void;
}

const ReviewComments: React.FC<ReviewCommentsProps> = ({
  review,
  currentUserId,
  onCommentAdded
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  
  const charLimit = 500;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedReview = await addReviewComment(review.id, comment.trim());
      
      // Clear input
      setComment('');
      
      if (onCommentAdded) {
        onCommentAdded(updatedReview);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <Box mt={2}>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={toggleShowComments}
      >
        <IconButton size="small">
          {showComments ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {review.comments.length 
            ? `${review.comments.length} Comment${review.comments.length > 1 ? 's' : ''}` 
            : 'Add a Comment'}
        </Typography>
      </Box>
      
      <Collapse in={showComments}>
        <Box mt={1}>
          {/* Comment list */}
          {review.comments.length > 0 && (
            <List sx={{ width: '100%', bgcolor: 'background.paper', py: 0 }}>
              {review.comments.map((comment, index) => (
                <React.Fragment key={comment.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar src={`https://i.pravatar.cc/150?u=${comment.userId}`} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          component="span"
                          variant="subtitle2"
                        >
                          User {comment.userId.substring(0, 6)}...
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
          
          {/* Comment form */}
          {currentUserId && (
            <Box 
              component="form" 
              onSubmit={handleSubmit}
              sx={{ 
                display: 'flex',
                mt: 2
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                inputProps={{ maxLength: charLimit }}
                error={comment.length >= charLimit}
                helperText={comment.length >= charLimit ? `Maximum ${charLimit} characters` : ''}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ ml: 1 }}
                disabled={!comment.trim() || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Post'}
              </Button>
            </Box>
          )}
          
          {!currentUserId && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please sign in to add a comment.
            </Typography>
          )}
          
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ReviewComments;
