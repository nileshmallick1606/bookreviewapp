import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  TextField
} from '@mui/material';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/**
 * Admin component for data generation
 */
const BookDataGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [count, setCount] = useState(100);

  const handleGenerateBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Call the real API endpoint to generate books
      const response = await axios.post(`${API_URL}/data/generate/books`, null, {
        params: { count },
        headers: {
          'Content-Type': 'application/json',
          // In a real implementation, we would include an auth token
          // Authorization: `Bearer ${authToken}`
        },
        withCredentials: true // Include cookies for authentication
      });
      
      if (response.status === 200) {
        setSuccess(`Successfully generated ${count} books. Refresh the book list to see them.`);
      } else {
        throw new Error(response.data.error?.message || 'Failed to generate books');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate books. Please try again later.');
      console.error('Error generating books:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Book Data Generation
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool allows you to generate dummy book data for testing purposes.
        The generated books will have random titles, authors, descriptions, and other fields.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Number of books to generate"
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 100)}
          InputProps={{ inputProps: { min: 1, max: 500 } }}
          size="small"
          sx={{ mr: 2 }}
        />
      </Box>
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateBooks}
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? 'Generating Books...' : 'Generate Books'}
      </Button>
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Note: In a real implementation, this would call a backend API endpoint to generate books.
      </Typography>
    </Paper>
  );
};

export default BookDataGenerator;
