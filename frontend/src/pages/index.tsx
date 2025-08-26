// src/pages/index.tsx
import type { NextPage } from 'next';
import { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Button, Box } from '@mui/material';
import styles from '@/styles/Home.module.css';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { fetchCurrentUser } from '../store/slices/authSlice';

const Home: NextPage = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading } = useAppSelector(state => state.auth);
  
  // Try to fetch current user on page load
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      dispatch(fetchCurrentUser()).catch(() => {
        // Ignore errors - user may not be logged in
      });
    }
  }, [dispatch, isAuthenticated, loading]);
  
  return (
    <div className={styles.container}>
      <Head>
        <title>BookReview Platform</title>
        <meta name="description" content="Review and discover books" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.highlight}>BookReview</span>
          {isAuthenticated && user && <span> {user.name}!</span>}
        </h1>

        <p className={styles.description}>
          Discover, review, and share your favorite books
        </p>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Getting Started</h2>
            <p>The BookReview platform is currently under development.</p>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              {!isAuthenticated ? (
                <>
                  <Link href="/auth/register" passHref>
                    <Button
                      variant="contained"
                      color="primary"
                    >
                      Register
                    </Button>
                  </Link>
                  <Link href="/auth/login" passHref>
                    <Button
                      variant="outlined"
                      color="primary"
                    >
                      Login
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile" passHref>
                    <Button
                      variant="contained"
                      color="primary"
                    >
                      My Profile
                    </Button>
                  </Link>
                </>
              )}
            </Box>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>BookReview Platform &copy; 2025</p>
      </footer>
    </div>
  );
};

export default Home;
