// src/components/profile/ProfileReviewsTab.tsx
import React from 'react';
import { Box } from '@mui/material';
import { useAppSelector } from '../../hooks/reduxHooks';
import ProfileReviewsList from './ProfileReviewsList';

const ProfileReviewsTab: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  
  if (!user) {
    return null;
  }
  
  return (
    <Box sx={{ py: 2 }}>
      <ProfileReviewsList userId={user.id} />
    </Box>
  );
};

export default ProfileReviewsTab;
