import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container, Box, Divider } from '@mui/material';
import BookList from '../../components/books/BookList';
import BookSearch from '../../components/books/BookSearch';
import TopRatedBooks from '../../components/home/TopRatedBooks';
import Recommendations from '../../components/recommendations/Recommendations';

/**
 * Books listing page
 */
const BooksPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Books | BookReview</title>
        <meta name="description" content="Browse recommended and top-rated books from our collection" />
      </Head>
      <Container maxWidth={false} sx={{ py: 4 }}>
        {/* Search bar */}
        <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          <BookSearch />
        </Box>

        {/* Recommendations section - horizontal scrolling carousel */}
        <Recommendations />
        
        <Divider sx={{ my: 4 }} />
        
        {/* Top-rated books section - horizontal scrolling carousel */}
        <TopRatedBooks />
        
        <Divider sx={{ my: 4 }} />
        
        {/* Book listing */}
        <BookList />
      </Container>
    </>
  );
};

export default BooksPage;
