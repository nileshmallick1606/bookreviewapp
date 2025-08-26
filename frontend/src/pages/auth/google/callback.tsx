// src/pages/auth/google/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { CircularProgress, Box, Typography, Container } from '@mui/material';
import { handleSocialAuthCallback } from '../../../services/socialAuthService';

const GoogleCallbackPage = () => {
  const router = useRouter();
  const { code, error } = router.query;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const completeAuth = async () => {
      // Make sure code is available (after router is ready)
      if (!router.isReady) return;
      
      // Handle OAuth error
      if (error) {
        setStatus('error');
        setErrorMessage(typeof error === 'string' ? error : 'Authentication failed');
        return;
      }
      
      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code provided');
        return;
      }
      
      try {
        // Exchange code for tokens and get user data
        await handleSocialAuthCallback('google', code as string);
        
        // Authentication successful
        setStatus('success');
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } catch (err) {
        console.error('Google auth error:', err);
        setStatus('error');
        setErrorMessage('Failed to complete authentication');
      }
    };

    completeAuth();
  }, [router.isReady, code, error, router]);

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{ 
          mt: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        {status === 'loading' && (
          <>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Completing Google authentication...
            </Typography>
          </>
        )}
        
        {status === 'success' && (
          <>
            <Typography variant="h6" color="primary">
              Authentication successful!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Redirecting to homepage...
            </Typography>
          </>
        )}
        
        {status === 'error' && (
          <>
            <Typography variant="h6" color="error">
              Authentication Failed
            </Typography>
            <Typography variant="body1" color="error" sx={{ mt: 1 }}>
              {errorMessage || 'An error occurred during authentication.'}
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default GoogleCallbackPage;
