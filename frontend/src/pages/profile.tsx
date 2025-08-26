// src/pages/profile.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import withAuth from '../components/common/withAuth';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { logout } from '../store/slices/authSlice';

const ProfilePage: NextPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    // Note: You would typically also make an API call to invalidate the token
    // This would be implemented in a real logout function in the auth service
  };
  
  return (
    <>
      <Head>
        <title>Profile | BookReview</title>
        <meta name="description" content="Your profile on BookReview" />
      </Head>
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          
          {user && (
            <>
              <Typography variant="h6">Welcome, {user.name}!</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Email: {user.email}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Account created: {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
                
                <Link href="/" passHref>
                  <Button 
                    variant="text" 
                    sx={{ ml: 2 }}
                  >
                    Back to Home
                  </Button>
                </Link>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </>
  );
};

// Wrap the page with the auth HOC
export default withAuth(ProfilePage);
