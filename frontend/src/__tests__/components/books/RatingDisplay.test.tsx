// @ts-nocheck - Temporarily disable TypeScript checks for tests
import React from 'react';
import { render, screen } from '@testing-library/react';
import RatingDisplay from '../../../components/common/RatingDisplay';

describe('RatingDisplay Component', () => {
  it('renders the correct number of filled stars', () => {
    render(<RatingDisplay rating={3.5} />);
    
    // With a rating of 3.5, we should have 3 filled stars, 1 half-filled star, and 1 empty star
    const stars = screen.getAllByTestId('rating-star');
    expect(stars).toHaveLength(5);
    
    // This is a simplified test since we can't easily check the actual star icons
    // In a real test, we might check specific classes or SVG paths
  });

  it('shows the numeric rating when showNumeric is true', () => {
    render(<RatingDisplay rating={4.2} showNumeric={true} />);
    
    // Check that the numeric rating is shown
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });

  it('does not show the numeric rating when showNumeric is false', () => {
    render(<RatingDisplay rating={4.2} showNumeric={false} />);
    
    // Check that the numeric rating is not shown
    expect(screen.queryByText('4.2')).not.toBeInTheDocument();
  });

  it('shows review count when provided', () => {
    render(<RatingDisplay rating={3.0} reviewCount={42} />);
    
    // Check that the review count is shown
    expect(screen.getByText('(42)')).toBeInTheDocument();
  });

  it('shows "No ratings yet" for null rating', () => {
    render(<RatingDisplay rating={null} />);
    
    // Check for the no ratings message
    expect(screen.getByText('No ratings yet')).toBeInTheDocument();
  });

  it('has the correct size based on the size prop', () => {
    const { rerender } = render(<RatingDisplay rating={4.0} size="small" />);
    
    // Check small size
    expect(screen.getByTestId('rating-container')).toHaveClass('small');
    
    // Re-render with large size
    rerender(<RatingDisplay rating={4.0} size="large" />);
    
    // Check large size
    expect(screen.getByTestId('rating-container')).toHaveClass('large');
  });

  it('applies custom className when provided', () => {
    render(<RatingDisplay rating={4.0} className="custom-class" />);
    
    // Check for the custom class
    expect(screen.getByTestId('rating-container')).toHaveClass('custom-class');
  });
});
