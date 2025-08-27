// src/components/user/UserInfo.tsx
import React, { useState, useEffect } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { getUserById } from '../../services/userService';

interface UserInfoProps {
  userId: string;
  showName?: boolean;
  showAvatar?: boolean;
  avatarSize?: number;
  nameVariant?: 'subtitle1' | 'subtitle2' | 'body1' | 'body2';
}

const UserInfo: React.FC<UserInfoProps> = ({ 
  userId,
  showName = true, 
  showAvatar = true,
  avatarSize = 40,
  nameVariant = 'subtitle1'
}) => {
  const [name, setName] = useState<string>(`User ${userId.substring(0, 6)}...`);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await getUserById(userId);
        
        if (userData) {
          setName(userData.name);
          setProfileImage(userData.profilePicture);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only attempt to fetch if we have a userId
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!name || name === `User ${userId.substring(0, 6)}...`) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  // Generate a consistent color based on userId for avatar background
  const getAvatarColor = () => {
    if (!userId) return '#1976d2'; // Default blue
    
    // Simple hash function to generate color from userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert hash to RGB color
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
      '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
      '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
    ];
    
    // Use hash to pick a color
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {showAvatar && (
        <Avatar 
          src={profileImage} // Only use profileImage if available, otherwise fall back to initials
          alt={name || 'User'}
          sx={{ 
            width: avatarSize, 
            height: avatarSize,
            bgcolor: !profileImage ? getAvatarColor() : undefined
          }}
        >
          {!profileImage && getUserInitials()}
        </Avatar>
      )}
      
      {showName && (
        <Box ml={showAvatar ? 2 : 0}>
          <Typography 
            variant={nameVariant} 
            fontWeight="bold"
            sx={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Loading...' : name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserInfo;
