import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Box } from '@mui/material';
import BookList from '../../components/books/BookList';
import BookSearch from '../../components/books/BookSearch';

/**
 * Books listing page
 */
const BooksPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Books | BookReview</title>
        <meta name="description" content="Browse our collection of books" />
      </Head>
      <Container maxWidth={false} sx={{ py: 4 }}>
        {/* Search bar */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <BookSearch />
        </Box>
        
        {/* Book listing */}
        <BookList />
      </Container>
    </>
  );
};

export default BooksPage;
