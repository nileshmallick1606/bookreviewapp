import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  InputAdornment,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { BookService, Book } from '../../services/bookService';
import BookFormDialog from './BookFormDialog';

/**
 * Admin component for managing books (create, edit, delete)
 */
const AdminBookList: React.FC = () => {
  // State
  const [books, setBooks] = useState<Book[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [totalBooks, setTotalBooks] = useState(0);

  // Load books when component mounts
  useEffect(() => {
    fetchBooks();
  }, [page, rowsPerPage]);

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BookService.getBooks(page + 1, rowsPerPage);
      setBooks(data.books);
      setTotalBooks(data.total);
    } catch (err) {
      setError('Failed to load books. Please try again later.');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle create book
  const handleCreate = () => {
    setFormMode('create');
    setSelectedBook(null);
    setFormDialogOpen(true);
  };

  // Handle edit book
  const handleEdit = (book: Book) => {
    setFormMode('edit');
    setSelectedBook(book);
    setFormDialogOpen(true);
  };

  // Handle delete book
  const handleDeleteClick = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  // Handle search change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle pagination change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle book form submission
  const handleFormSubmit = async (bookData: Partial<Book>) => {
    try {
      setError(null);
      
      if (formMode === 'create') {
        // Create new book
        await BookService.createBook(bookData);
      } else if (formMode === 'edit' && selectedBook) {
        // Update existing book
        await BookService.updateBook(selectedBook.id, bookData);
      }

      // Refresh book list
      fetchBooks();
      setFormDialogOpen(false);
    } catch (err) {
      setError(
        formMode === 'create'
          ? 'Failed to create book. Please try again.'
          : 'Failed to update book. Please try again.'
      );
      console.error('Error submitting book:', err);
    }
  };

  // Handle book deletion confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedBook) return;

    try {
      setError(null);
      await BookService.deleteBook(selectedBook.id);
      
      // Refresh book list
      fetchBooks();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete book. Please try again.');
      console.error('Error deleting book:', err);
    }
  };

  // Filtered books based on search query
  const filteredBooks = books.filter(
    book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item>
            <Typography variant="h5" component="h1">
              Book Management
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Add Book
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search books..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Book table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Published Year</TableCell>
              <TableCell>Genres</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1">
                    {searchQuery
                      ? 'No books match your search criteria.'
                      : 'No books found.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map(book => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.publishedYear}</TableCell>
                  <TableCell>
                    {book.genres?.slice(0, 2).map((genre, index) => (
                      <Chip
                        key={index}
                        label={genre}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                    {book.genres && book.genres.length > 2 && (
                      <Chip
                        label={`+${book.genres.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(book)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(book)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalBooks}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Book form dialog */}
      <BookFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSubmit={handleFormSubmit}
        book={selectedBook || undefined}
        mode={formMode}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;
            <strong>{selectedBook?.title}</strong>&quot;? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminBookList;
