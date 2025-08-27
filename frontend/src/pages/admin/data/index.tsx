import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import BookDataGenerator from '../../../components/admin/BookDataGenerator';

/**
 * Admin data population page
 */
const DataPopulationPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Data Population | Admin | BookReview</title>
        <meta name="description" content="Populate data for the BookReview platform" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/admin" underline="hover" color="inherit">
              Admin Dashboard
            </Link>
            <Typography color="text.primary">Data Population</Typography>
          </Breadcrumbs>
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Data Population
        </Typography>
        
        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          This page provides tools to populate the BookReview platform with dummy data for testing and development purposes.
        </Typography>
        
        <BookDataGenerator />
      </Container>
    </>
  );
};

export default DataPopulationPage;
