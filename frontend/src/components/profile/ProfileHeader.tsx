// src/components/profile/ProfileHeader.tsx
import React from 'react';
import { Box, Avatar, Typography, Chip, Stack } from '@mui/material';
import { UserProfile } from '../../services/userService';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile, isOwnProfile }) => {
  const { name, email, profilePicture, genrePreferences = [], stats, createdAt } = profile;
  const joinDate = new Date(createdAt).toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      alignItems: { xs: 'center', sm: 'flex-start' }, 
      gap: 3,
      mb: 4 
    }}>
      <Avatar 
        src={profilePicture} 
        alt={name} 
        sx={{ 
          width: { xs: 100, md: 120 }, 
          height: { xs: 100, md: 120 },
          border: '4px solid #f0f0f0'
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {name}
        </Typography>
        
        {isOwnProfile && email && (
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {email}
          </Typography>
        )}
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Joined {joinDate}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="body2" fontWeight="bold">
            {stats.reviewCount} {stats.reviewCount === 1 ? 'Review' : 'Reviews'}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {stats.favoriteCount} {stats.favoriteCount === 1 ? 'Favorite' : 'Favorites'}
          </Typography>
        </Box>

        {genrePreferences.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Genre Preferences
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {genrePreferences.map((genre) => (
                <Chip 
                  key={genre} 
                  label={genre} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mb: 1 }}
                />
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileHeader;
