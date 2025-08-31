// src/pages/my-favorites.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import ProfileFavoritesTab from '../components/profile/ProfileFavoritesTab';
import { useAppSelector } from '../hooks/reduxHooks';
import AuthRequiredPage from '../components/auth/AuthRequiredPage';

const MyFavoritesPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AuthRequiredPage>
      <Head>
        <title>My Favorites | BookReview</title>
        <meta name="description" content="View your favorite books on BookReview" />
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Favorites
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            All the books you've marked as favorites.
          </Typography>
        </Box>
        
        {user && <ProfileFavoritesTab />}
      </Container>
    </AuthRequiredPage>
  );
};

export default MyFavoritesPage;
