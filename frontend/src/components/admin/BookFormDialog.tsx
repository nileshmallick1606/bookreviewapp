import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  Button, 
  Grid, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material';
import { Book } from '../../services/bookService';

interface BookFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (bookData: Partial<Book>) => void;
  book?: Book; // Optional for edit mode
  mode: 'create' | 'edit';
}

// Available genres for book categorization
const GENRES = [
  'Fiction',
  'Non-fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Biography',
  'Self-help',
  'Business',
  'Technology',
  'Science',
  'Philosophy',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Young Adult',
  'Children'
];

const BookFormDialog: React.FC<BookFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  book,
  mode
}) => {
  // Initial form state based on edit/create mode
  const [formData, setFormData] = useState<Partial<Book>>(
    mode === 'edit' && book
      ? {
          title: book.title,
          author: book.author,
          description: book.description,
          coverImage: book.coverImage,
          genres: book.genres,
          publishedYear: book.publishedYear,
        }
      : {
          title: '',
          author: '',
          description: '',
          coverImage: '',
          genres: [],
          publishedYear: new Date().getFullYear(),
        }
  );
  
  // Handle text field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle number field changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    // Only update if it's a valid number
    if (!isNaN(numValue)) {
      setFormData({
        ...formData,
        [name]: numValue
      });
    }
  };
  
  // Handle genre selection
  const handleGenreChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      genres: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Add New Book' : 'Edit Book'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            {/* Author */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Author"
                name="author"
                value={formData.author || ''}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            {/* Published Year */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Published Year"
                name="publishedYear"
                type="number"
                value={formData.publishedYear || ''}
                onChange={handleNumberChange}
                fullWidth
                inputProps={{ min: 1000, max: new Date().getFullYear() + 1 }}
              />
            </Grid>
            
            {/* Cover Image URL */}
            <Grid item xs={12}>
              <TextField
                label="Cover Image URL"
                name="coverImage"
                value={formData.coverImage || ''}
                onChange={handleChange}
                fullWidth
                helperText="Enter a valid URL for the book cover image"
              />
            </Grid>

            {/* Cover Image Preview */}
            {formData.coverImage && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Cover Preview
                </Typography>
                <Box
                  component="img"
                  src={formData.coverImage}
                  alt="Cover preview"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/book-placeholder.jpg';
                  }}
                  sx={{
                    maxWidth: 150,
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 1
                  }}
                />
              </Grid>
            )}
            
            {/* Genres */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="genres-label">Genres</InputLabel>
                <Select
                  labelId="genres-label"
                  multiple
                  name="genres"
                  value={formData.genres || []}
                  onChange={handleGenreChange}
                  input={<OutlinedInput label="Genres" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {GENRES.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            
            {/* Book ID (for edit mode only, read-only) */}
            {mode === 'edit' && book && (
              <Grid item xs={12}>
                <TextField
                  label="Book ID"
                  value={book.id}
                  fullWidth
                  InputProps={{ readOnly: true }}
                  variant="filled"
                  size="small"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={!formData.title || !formData.author}
          >
            {mode === 'create' ? 'Create Book' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BookFormDialog;
