import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Rating,
  Skeleton,
  Divider,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { formatDistanceToNow } from 'date-fns';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const UserInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ActionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  },
}));

const VoteContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const VoteCount = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(2),
  minWidth: '30px',
  textAlign: 'center',
}));

interface ReviewCardProps {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  date: string;
  bookTitle?: string;
  bookId?: string;
  upvotes: number;
  downvotes: number;
  isUserUpvoted?: boolean;
  isUserDownvoted?: boolean;
  tags?: string[];
  isLoading?: boolean;
  onUpvoteClick?: (reviewId: string) => void;
  onDownvoteClick?: (reviewId: string) => void;
  className?: string;
}

/**
 * Responsive review card component for displaying reviews
 */
const ReviewCard: React.FC<ReviewCardProps> = ({
  id,
  userId,
  username,
  userAvatar,
  rating,
  title,
  content,
  date,
  bookTitle,
  bookId,
  upvotes,
  downvotes,
  isUserUpvoted = false,
  isUserDownvoted = false,
  tags = [],
  isLoading = false,
  onUpvoteClick,
  onDownvoteClick,
  className,
}) => {
  const formattedDate = formatDistanceToNow(new Date(date), { addSuffix: true });

  const handleUpvote = () => {
    if (onUpvoteClick) {
      onUpvoteClick(id);
    }
  };

  const handleDownvote = () => {
    if (onDownvoteClick) {
      onDownvoteClick(id);
    }
  };

  if (isLoading) {
    return (
      <StyledCard className={className}>
        <CardContent>
          <UserInfoContainer>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ width: '100%' }}>
              <Skeleton width="40%" height={24} />
              <Skeleton width="20%" height={20} />
            </Box>
          </UserInfoContainer>
          
          <Skeleton width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton width="100%" height={80} />
          
          <ActionContainer>
            <Skeleton width={120} height={30} />
            <Skeleton width={80} height={30} />
          </ActionContainer>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard className={className}>
      <CardContent>
        {/* User info and date */}
        <UserInfoContainer>
          <Avatar 
            src={userAvatar} 
            alt={username}
            sx={{ width: 40, height: 40, mr: 2 }}
          >
            {username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>
          <Rating 
            value={rating} 
            readOnly 
            size="small"
            sx={{ ml: { xs: 0, sm: 2 } }}
          />
        </UserInfoContainer>

        {/* Review title and book info */}
        {(title || bookTitle) && (
          <Box sx={{ mb: 1.5 }}>
            {title && (
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.1rem' }}>
                {title}
              </Typography>
            )}
            {bookTitle && (
              <Typography 
                variant="body2" 
                color="primary" 
                component="a" 
                href={`/books/${bookId}`}
                sx={{ cursor: 'pointer', textDecoration: 'none' }}
              >
                Review for: {bookTitle}
              </Typography>
            )}
          </Box>
        )}

        {/* Review content */}
        <Typography variant="body1" paragraph>
          {content}
        </Typography>

        {/* Tags */}
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {tags.map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined" 
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Action buttons */}
        <ActionContainer>
          <VoteContainer>
            <IconButton 
              size="small" 
              onClick={handleUpvote} 
              color={isUserUpvoted ? "primary" : "default"}
            >
              <ThumbUpIcon fontSize="small" />
            </IconButton>
            <VoteCount variant="body2">{upvotes}</VoteCount>
            
            <IconButton 
              size="small" 
              onClick={handleDownvote} 
              color={isUserDownvoted ? "error" : "default"}
            >
              <ThumbDownIcon fontSize="small" />
            </IconButton>
            <VoteCount variant="body2">{downvotes}</VoteCount>
          </VoteContainer>
        </ActionContainer>
      </CardContent>
    </StyledCard>
  );
};

export default ReviewCard;
