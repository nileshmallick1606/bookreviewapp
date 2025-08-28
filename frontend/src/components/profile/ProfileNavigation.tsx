// src/components/profile/ProfileNavigation.tsx
import React from 'react';
import { Box, Button, ButtonGroup, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RateReviewIcon from '@mui/icons-material/RateReview';

interface ProfileNavigationProps {
  isOwnProfile: boolean;
  activeTab: 'reviews' | 'favorites';
  onTabChange: (tab: 'reviews' | 'favorites') => void;
  onEditProfile: () => void;
}

const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  isOwnProfile,
  activeTab,
  onTabChange,
  onEditProfile
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2
      }}>
        <ButtonGroup variant="outlined" aria-label="profile navigation">
          <Button
            startIcon={<RateReviewIcon />}
            onClick={() => onTabChange('reviews')}
            variant={activeTab === 'reviews' ? 'contained' : 'outlined'}
          >
            Reviews
          </Button>
          <Button
            startIcon={<BookmarkIcon />}
            onClick={() => onTabChange('favorites')}
            variant={activeTab === 'favorites' ? 'contained' : 'outlined'}
          >
            Favorites
          </Button>
        </ButtonGroup>
        
        {isOwnProfile && (
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            color="secondary"
            onClick={onEditProfile}
          >
            Edit Profile
          </Button>
        )}
      </Box>
      
      <Divider />
    </Box>
  );
};

export default ProfileNavigation;
