import React from 'react';
import { Box, Rating, Typography, Tooltip } from '@mui/material';

interface RatingDisplayProps {
  rating: number | null;
  reviewCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  showEmpty?: boolean;
  className?: string;
}

/**
 * Reusable component for displaying book ratings
 * 
 * @param rating - Average rating value (1-5)
 * @param reviewCount - Total number of reviews
 * @param size - Size of the rating component
 * @param showCount - Whether to show review count
 * @param showEmpty - Whether to show component when no ratings
 * @param className - Optional CSS class name
 */
const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount = 0,
  size = 'medium',
  showCount = true,
  showEmpty = true,
  className
}) => {
  // Size mappings for responsive display
  const sizeMap = {
    small: {
      ratingSize: 'small' as const,
      fontSize: 'body2',
      spacing: 0.5
    },
    medium: {
      ratingSize: 'medium' as const,
      fontSize: 'body2',
      spacing: 1
    },
    large: {
      ratingSize: 'large' as const,
      fontSize: 'body1',
      spacing: 1.5
    }
  };
  
  const { ratingSize, fontSize, spacing } = sizeMap[size];
  
  // Don't render anything if no rating and showEmpty is false
  if (!rating && !showEmpty) {
    return null;
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center'
      }}
      className={className}
    >
      {rating ? (
        <Tooltip 
          title={`Average rating: ${rating.toFixed(1)} out of 5 from ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}
          arrow
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating 
              value={rating} 
              precision={0.1} 
              readOnly 
              size={ratingSize}
            />
            <Typography 
              variant={fontSize as any} 
              color="text.secondary" 
              sx={{ ml: spacing }}
            >
              {rating.toFixed(1)}
              {showCount && reviewCount > 0 && 
                ` • ${reviewCount} review${reviewCount !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
        </Tooltip>
      ) : (
        <Typography variant={fontSize as any} color="text.secondary">
          No ratings yet
        </Typography>
      )}
    </Box>
  );
};

export default RatingDisplay;
