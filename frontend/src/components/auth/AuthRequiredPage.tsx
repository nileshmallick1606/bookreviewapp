// src/components/auth/AuthRequiredPage.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Box, CircularProgress, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

interface AuthRequiredPageProps {
  children: React.ReactNode;
  redirectUrl?: string;
}

/**
 * Higher-order component that requires authentication to access the wrapped content.
 * If the user is not authenticated, they are redirected to the login page.
 */
const AuthRequiredPage: React.FC<AuthRequiredPageProps> = ({ 
  children,
  redirectUrl = '/auth/login'
}) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);
  const router = useRouter();
  
  useEffect(() => {
    // If auth state is resolved (not loading) and user is not authenticated
    if (!loading && !isAuthenticated) {
      // Store the current URL to redirect back after login
      const returnUrl = encodeURIComponent(router.asPath);
      router.push(`${redirectUrl}?returnUrl=${returnUrl}`);
    }
  }, [isAuthenticated, loading, redirectUrl, router]);
  
  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="body1">Checking authentication...</Typography>
        </Box>
      </Container>
    );
  }
  
  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>Authentication Required</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please log in to view this page.
          </Typography>
          <Link href={redirectUrl} passHref>
            <Button variant="contained" color="primary">
              Go to Login
            </Button>
          </Link>
        </Box>
      </Container>
    );
  }
  
  // User is authenticated, show the protected content
  return <>{children}</>;
};

export default AuthRequiredPage;
