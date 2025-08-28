// src/components/profile/ProfileFavoritesTab.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating
} from '@mui/material';
import { useAppSelector } from '../../hooks/reduxHooks';
import { getFavoriteBooks, removeFromFavorites } from '../../services/favoriteService';
import { BookService, Book } from '../../services/bookService';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';

const ProfileFavoritesTab: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
  
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const bookIds = await getFavoriteBooks(user.id);
        
        if (bookIds.length === 0) {
          setFavoriteBooks([]);
          setLoading(false);
          return;
        }
        
        // Load details for each book
        const booksPromises = bookIds.map(id => BookService.getBookById(id));
        const books = await Promise.all(booksPromises);
        setFavoriteBooks(books.filter(Boolean) as Book[]);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorite books');
      } finally {
        setLoading(false);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  const handleRemoveFromFavorites = async (bookId: string) => {
    if (!user) return;
    
    try {
      await removeFromFavorites(user.id, bookId);
      // Remove book from local state
      setFavoriteBooks(prev => prev.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove book from favorites');
    }
  };
  
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Favorites {favoriteBooks.length > 0 && `(${favoriteBooks.length})`}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : favoriteBooks.length === 0 ? (
        <Alert severity="info">You haven't added any books to your favorites yet.</Alert>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {favoriteBooks.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height={200}
                  image={book.coverImage || '/images/book-placeholder.png'}
                  alt={book.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h3" gutterBottom noWrap>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {book.author}
                  </Typography>
                  
                  {book.averageRating && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Rating value={book.averageRating} precision={0.5} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {book.averageRating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<BookmarkRemoveIcon />}
                    onClick={() => handleRemoveFromFavorites(book.id)}
                    color="error"
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ProfileFavoritesTab;
