// src/components/auth/SocialLogin.tsx
import React, { useState } from 'react';
import { Divider, Box, Typography } from '@mui/material';
import SocialLoginButton from './SocialLoginButton';
import { initiateSocialAuth } from '../../services/socialAuthService';

interface SocialLoginProps {
  onError?: (message: string) => void;
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onError }) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setLoadingProvider(provider);
      const authUrl = await initiateSocialAuth(provider);
      
      // Redirect to the provider's OAuth page
      window.location.href = authUrl;
    } catch (error) {
      console.error(`Error initiating ${provider} login:`, error);
      
      if (onError) {
        onError(`Failed to connect to ${provider}. Please try again.`);
      }
      
      setLoadingProvider(null);
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Divider sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <SocialLoginButton 
        provider="google"
        onClick={() => handleSocialLogin('google')}
        isLoading={loadingProvider === 'google'}
      />
      
      <SocialLoginButton 
        provider="facebook"
        onClick={() => handleSocialLogin('facebook')}
        isLoading={loadingProvider === 'facebook'}
      />
    </Box>
  );
};

export default SocialLogin;
