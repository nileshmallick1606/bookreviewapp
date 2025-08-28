import React, { useState, useEffect, useRef } from 'react';
import { 
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { Book } from '../../services/bookService';
import BookCard from '../books/BookCard';
import { styled } from '@mui/material/styles';

const ScrollContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  scrollBehavior: 'smooth',
  scrollSnapType: 'x mandatory',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  msOverflowStyle: 'none',
  scrollbarWidth: 'none',
  position: 'relative',
  padding: theme.spacing(2, 0),
}));

const CardContainer = styled(Box)(({ theme }) => ({
  scrollSnapAlign: 'start',
  minWidth: '250px',
  marginRight: theme.spacing(2),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

interface BookRecommendationCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  isAiPowered?: boolean;
}

/**
 * Horizontal scrolling carousel component for book recommendations
 */
const BookRecommendationCarousel: React.FC<BookRecommendationCarouselProps> = ({
  title,
  subtitle,
  books,
  loading = false,
  error = null,
  onRefresh,
  isAiPowered = false
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if scroll arrows should be shown
  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10); // 10px buffer
    };
    
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      
      return () => {
        scrollEl.removeEventListener('scroll', checkScroll);
      };
    }
  }, [books, scrollRef]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 250 : 500;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 250 : 500;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {subtitle}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (books.length === 0) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No recommendations available at this time.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, position: 'relative' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {isAiPowered && (
            <Chip
              icon={<SmartToyIcon />}
              label="AI-Powered"
              color="primary"
              size="small"
              sx={{ ml: 2, mt: -2 }}
            />
          )}
        </Box>
        
        {onRefresh && (
          <IconButton 
            onClick={onRefresh} 
            color="primary"
            aria-label="Refresh recommendations"
            title="Refresh recommendations"
          >
            <RefreshIcon />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ position: 'relative' }}>
        {showLeftArrow && (
          <IconButton
            onClick={scrollLeft}
            sx={{
              position: 'absolute',
              left: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
            aria-label="Scroll left"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        )}
        
        <ScrollContainer ref={scrollRef}>
          {books.map(book => (
            <CardContainer key={book.id}>
              <BookCard book={book} />
            </CardContainer>
          ))}
        </ScrollContainer>
        
        {showRightArrow && (
          <IconButton
            onClick={scrollRight}
            sx={{
              position: 'absolute',
              right: -16,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'background.paper' },
            }}
            aria-label="Scroll right"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default BookRecommendationCarousel;
