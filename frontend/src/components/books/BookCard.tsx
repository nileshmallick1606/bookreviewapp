import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Chip,
  CardActionArea,
  Skeleton
} from '@mui/material';
import RatingDisplay from '../common/RatingDisplay';
import { useRouter } from 'next/router';
import { Book } from '../../services/bookService';
import { styled } from '@mui/material/styles';
import ResponsiveImage from '../common/ResponsiveImage';

// Styled components for enhanced visual appearance
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

interface BookCardProps {
  book: Book;
  /**
   * Whether the card is in loading state
   */
  isLoading?: boolean;
  /**
   * Optional aspect ratio for the cover image (width:height)
   */
  coverAspectRatio?: number;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Responsive component for displaying a book card in the book list
 * with adaptive layout for different screen sizes
 */
const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isLoading = false,
  coverAspectRatio = 0.67, // Default book cover ratio (2:3)
  className
}) => {
  const router = useRouter();
  
  // Truncate description to a reasonable length
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Handle click to navigate to book details
  const handleClick = () => {
    router.push(`/books/${book.id}`);
  };

  // Render loading skeleton if isLoading is true
  if (isLoading) {
    return (
      <StyledCard className={className}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          width="100%"
          height={0}
          sx={{ paddingTop: `${(1 / coverAspectRatio) * 100}%` }}
        />
        <CardContent>
          <Skeleton animation="wave" height={24} width="80%" />
          <Skeleton animation="wave" height={20} width="60%" />
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Skeleton animation="wave" height={24} width={120} />
          </Box>
          <Box sx={{ mt: 1 }}>
            <Skeleton animation="wave" height={24} width={80} sx={{ mr: 1, display: 'inline-block' }} />
            <Skeleton animation="wave" height={24} width={80} sx={{ display: 'inline-block' }} />
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <StyledCard className={className}>
      <CardActionArea onClick={handleClick} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative' }}>
          {/* Use ResponsiveImage for better mobile experience */}
          <ResponsiveImage
            src={book.coverImage || '/images/book-placeholder.jpg'}
            alt={book.title}
            aspectRatio={`${coverAspectRatio * 100}%`}
            sizes="(max-width: 600px) 50vw, (max-width: 960px) 30vw, 200px"
          />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          
          {/* Display rating if available */}
          <Box sx={{ mb: 1 }}>
            <RatingDisplay 
              rating={book.averageRating || null} 
              reviewCount={book.totalReviews} 
              size="small" 
            />
          </Box>
          
          {/* Display genres */}
          <Box sx={{ mt: 1 }}>
            {book.genres?.slice(0, 2).map((genre, index) => (
              <Chip 
                key={index}
                label={genre}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {book.genres?.length > 2 && (
              <Chip 
                label={`+${book.genres.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </StyledCard>
  );
};

export default BookCard;
