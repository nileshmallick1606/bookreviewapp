import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Box, Typography, Paper, Breadcrumbs, Link } from '@mui/material';
import AdminBookList from '../../../components/admin/AdminBookList';
// In a real implementation, we would have a proper authentication check
// import { useAuth } from '../../../hooks/useAuth';
// import AdminLayout from '../../../components/layouts/AdminLayout';

/**
 * Admin book management page
 */
const AdminBooksPage: NextPage = () => {
  // In a real implementation, we would check if the user is authenticated and has admin rights
  // const { user, isAdmin } = useAuth();
  // 
  // if (!user || !isAdmin) {
  //   return <AccessDenied />;
  // }

  return (
    <>
      <Head>
        <title>Book Management | Admin | BookReview</title>
        <meta name="description" content="Manage books in the BookReview platform" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/admin" underline="hover" color="inherit">
              Admin Dashboard
            </Link>
            <Typography color="text.primary">Book Management</Typography>
          </Breadcrumbs>
        </Box>
        
        <Paper sx={{ p: 3 }}>
          <AdminBookList />
        </Paper>
      </Container>
    </>
  );
};

export default AdminBooksPage;
