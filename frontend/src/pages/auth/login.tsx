// src/pages/auth/login.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container } from '@mui/material';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Login | BookReview</title>
        <meta name="description" content="Sign in to your BookReview account" />
      </Head>
      
      <Container maxWidth="sm">
        <LoginForm />
      </Container>
    </>
  );
};

export default LoginPage;
