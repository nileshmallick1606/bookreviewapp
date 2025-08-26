// src/pages/auth/reset-password/[token].tsx
import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Container } from '@mui/material';
import PasswordResetForm from '../../../components/auth/PasswordResetForm';

const ResetPasswordPage: NextPage = () => {
  const router = useRouter();
  const { token } = router.query;
  
  return (
    <>
      <Head>
        <title>Reset Password | BookReview</title>
        <meta name="description" content="Reset your BookReview account password" />
      </Head>
      
      <Container maxWidth="sm">
        {router.isReady && token && typeof token === 'string' ? (
          <PasswordResetForm token={token} />
        ) : null}
      </Container>
    </>
  );
};

export default ResetPasswordPage;
