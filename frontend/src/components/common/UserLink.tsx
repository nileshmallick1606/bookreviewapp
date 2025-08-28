// src/components/common/UserLink.tsx
import React from 'react';
import Link from 'next/link';
import { Typography, Avatar, Box } from '@mui/material';
import { useAppSelector } from '../../hooks/reduxHooks';

interface UserLinkProps {
  userId: string;
  userName: string;
  profilePicture?: string;
  size?: 'small' | 'medium' | 'large';
}

const UserLink: React.FC<UserLinkProps> = ({ 
  userId, 
  userName, 
  profilePicture,
  size = 'small'
}) => {
  const { user: currentUser } = useAppSelector(state => state.auth);
  const isCurrentUser = currentUser?.id === userId;
  
  // Avatar size based on prop
  const avatarSize = {
    small: 24,
    medium: 32,
    large: 40
  }[size];
  
  // Font size based on prop
  const fontSize = {
    small: 'body2',
    medium: 'body1',
    large: 'subtitle1'
  }[size] as 'body2' | 'body1' | 'subtitle1';
  
  const linkHref = isCurrentUser ? '/profile' : `/users/${userId}`;
  
  return (
    <Link href={linkHref} passHref>
      <Box 
        component="a" 
        sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          textDecoration: 'none',
          color: 'inherit',
          '&:hover': {
            textDecoration: 'underline',
            cursor: 'pointer'
          }
        }}
      >
        <Avatar 
          src={profilePicture} 
          alt={userName}
          sx={{ 
            width: avatarSize, 
            height: avatarSize,
            mr: 1
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography 
          variant={fontSize} 
          component="span"
          sx={{ fontWeight: 500 }}
        >
          {userName}{isCurrentUser ? ' (You)' : ''}
        </Typography>
      </Box>
    </Link>
  );
};

export default UserLink;
