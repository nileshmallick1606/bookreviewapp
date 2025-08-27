import React, { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  Autocomplete, 
  InputAdornment, 
  IconButton,
  Paper,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/router';
import { BookService } from '../../services/bookService';
import debounce from 'lodash/debounce';

/**
 * Book search component with autocomplete functionality
 */
const BookSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Debounced function to get suggestions
  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        setLoading(true);
        const data = await BookService.getSuggestions(searchQuery);
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Update suggestions when query changes
  useEffect(() => {
    fetchSuggestions(query);
    
    // Cleanup function to cancel the debounced call
    return () => {
      fetchSuggestions.cancel();
    };
  }, [query, fetchSuggestions]);

  // Handle search submission
  const handleSearch = () => {
    if (query && query.trim() !== '') {
      router.push({
        pathname: '/books/search',
        query: { q: query }
      });
    }
  };

  // Handle key press for search submission
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle clear button click
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        value={query}
        inputValue={query}
        onInputChange={(_, newValue) => setQuery(newValue)}
        onChange={(_, newValue) => {
          if (newValue) {
            setQuery(newValue);
            handleSearch();
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search books by title or author..."
            variant="outlined"
            fullWidth
            onKeyPress={handleKeyPress}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : query ? (
                    <IconButton
                      aria-label="clear search"
                      onClick={handleClear}
                      edge="end"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          // Highlight the matching part of the suggestion
          const matchIndex = option.toLowerCase().indexOf(query.toLowerCase());
          if (matchIndex === -1) {
            return (
              <li {...props}>
                <Typography>{option}</Typography>
              </li>
            );
          }
          
          const before = option.substring(0, matchIndex);
          const match = option.substring(matchIndex, matchIndex + query.length);
          const after = option.substring(matchIndex + query.length);
          
          return (
            <li {...props}>
              <Typography>
                {before}
                <Box component="span" sx={{ fontWeight: 'bold' }}>
                  {match}
                </Box>
                {after}
              </Typography>
            </li>
          );
        }}
      />
    </Box>
  );
};

export default BookSearch;
