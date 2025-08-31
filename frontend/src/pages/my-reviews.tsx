// src/pages/my-reviews.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Typography, Paper, Box } from '@mui/material';
import withAuth from '../components/common/withAuth';
import { useAppSelector } from '../hooks/reduxHooks';
import ProfileReviewsList from '../components/profile/ProfileReviewsList';

const MyReviewsPage: NextPage = () => {
  const { user } = useAppSelector(state => state.auth);
  
  if (!user) {
    return null; // withAuth HOC should handle redirecting if not authenticated
  }
  
  return (
    <>
      <Head>
        <title>My Reviews | BookReview</title>
        <meta name="description" content="Your reviews on BookReview" />
      </Head>
      
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Reviews
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary">
            Manage and view all the book reviews you've written
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <ProfileReviewsList userId={user.id} isOwnProfile={true} />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default withAuth(MyReviewsPage);
