// src/pages/auth/register.tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { Container } from '@mui/material';
import RegisterForm from '../../components/auth/RegisterForm';

const RegisterPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Register | BookReview</title>
        <meta name="description" content="Create a new account for BookReview platform" />
      </Head>
      
      <Container maxWidth="sm">
        <RegisterForm />
      </Container>
    </>
  );
};

export default RegisterPage;
