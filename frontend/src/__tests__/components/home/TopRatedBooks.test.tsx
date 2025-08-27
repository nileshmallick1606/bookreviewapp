// @ts-nocheck - Temporarily disable TypeScript checks for tests
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TopRatedBooks from '../../../components/home/TopRatedBooks';
import { BookService } from '../../../services/bookService';

// Mock the BookService
jest.mock('../../../services/bookService', () => ({
  BookService: {
    getTopRatedBooks: jest.fn()
  }
}));

describe('TopRatedBooks Component', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  it('should display loading state initially', () => {
    // Mock the BookService to return a delayed promise
    (BookService.getTopRatedBooks as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve([]), 100);
      });
    });
    
    render(<TopRatedBooks />);
    
    // Check for loading indicator
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  it('should display top-rated books when data is loaded', async () => {
    // Mock data
    const mockBooks = [
      { 
        id: 'book1', 
        title: 'Test Book 1', 
        author: 'Author 1', 
        coverImage: 'cover1.jpg',
        averageRating: 4.5 
      },
      { 
        id: 'book2', 
        title: 'Test Book 2', 
        author: 'Author 2', 
        coverImage: 'cover2.jpg',
        averageRating: 4.0 
      }
    ];
    
    // Mock the BookService to return the mock data
    (BookService.getTopRatedBooks as jest.Mock).mockResolvedValue(mockBooks);
    
    render(<TopRatedBooks />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that the books are displayed
    expect(screen.getByText('Top Rated Books')).toBeInTheDocument();
    expect(screen.getByText('Test Book 1')).toBeInTheDocument();
    expect(screen.getByText('Test Book 2')).toBeInTheDocument();
    expect(screen.getByText('Author 1')).toBeInTheDocument();
    expect(screen.getByText('Author 2')).toBeInTheDocument();
  });
  
  it('should show error message when loading fails', async () => {
    // Mock the BookService to throw an error
    (BookService.getTopRatedBooks as jest.Mock).mockRejectedValue(
      new Error('Failed to load top-rated books')
    );
    
    render(<TopRatedBooks />);
    
    // Wait for the error state
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check for error message
    expect(screen.getByText(/Failed to load top-rated books/i)).toBeInTheDocument();
  });
  
  it('should not render anything when there are no top-rated books', async () => {
    // Mock the BookService to return empty array
    (BookService.getTopRatedBooks as jest.Mock).mockResolvedValue([]);
    
    const { container } = render(<TopRatedBooks />);
    
    // Wait for the component to load data
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
    
    // Check that the component doesn't render anything
    expect(container.firstChild).toBeNull();
  });
});
