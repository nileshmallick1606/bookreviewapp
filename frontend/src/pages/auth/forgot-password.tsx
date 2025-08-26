// src/pages/auth/forgot-password.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container } from '@mui/material';
import PasswordResetRequestForm from '../../components/auth/PasswordResetRequestForm';

const ForgotPasswordPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Forgot Password | BookReview</title>
        <meta name="description" content="Reset your BookReview account password" />
      </Head>
      
      <Container maxWidth="sm">
        <PasswordResetRequestForm />
      </Container>
    </>
  );
};

export default ForgotPasswordPage;
