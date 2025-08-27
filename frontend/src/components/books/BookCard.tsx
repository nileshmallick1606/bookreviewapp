import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Rating,
  Box,
  Chip,
  CardActionArea
} from '@mui/material';
import { useRouter } from 'next/router';
import { Book } from '../../services/bookService';

interface BookCardProps {
  book: Book;
}

/**
 * Component for displaying a book card in the book list
 */
const BookCard: React.FC<BookCardProps> = ({ book }) => {
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

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3
        }
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="img"
          height="200"
          image={book.coverImage || '/images/book-placeholder.jpg'}
          alt={book.title}
          sx={{ objectFit: 'contain', padding: 1 }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {book.author}
          </Typography>
          
          {/* Display rating if available */}
          {book.averageRating !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating 
                value={book.averageRating} 
                precision={0.1} 
                readOnly 
                size="small"
              />
              <Typography variant="body2" color="text.secondary" ml={1}>
                ({book.averageRating.toFixed(1)})
                {book.reviewCount !== undefined && ` • ${book.reviewCount} reviews`}
              </Typography>
            </Box>
          )}
          
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
    </Card>
  );
};

export default BookCard;
