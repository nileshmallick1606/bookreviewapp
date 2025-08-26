// src/components/auth/SocialLoginButton.tsx
import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook';
  onClick: () => void;
  isLoading?: boolean;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ 
  provider, 
  onClick, 
  isLoading = false 
}) => {
  const getIcon = () => {
    switch (provider) {
      case 'google':
        return <GoogleIcon />;
      case 'facebook':
        return <FacebookIcon />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (provider) {
      case 'google':
        return 'Continue with Google';
      case 'facebook':
        return 'Continue with Facebook';
      default:
        return 'Continue with Social';
    }
  };

  const getColor = () => {
    switch (provider) {
      case 'google':
        return '#DB4437';
      case 'facebook':
        return '#4267B2';
      default:
        return 'primary';
    }
  };

  return (
    <Button
      variant="contained"
      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : getIcon()}
      onClick={onClick}
      disabled={isLoading}
      fullWidth
      sx={{
        backgroundColor: getColor(),
        color: '#ffffff',
        '&:hover': {
          backgroundColor: getColor(),
          opacity: 0.9,
        },
        mb: 2
      }}
    >
      {getLabel()}
    </Button>
  );
};

export default SocialLoginButton;
