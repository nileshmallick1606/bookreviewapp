// src/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import store from '../store';
import Layout from '../components/layout/Layout';
import theme from '../styles/theme';
import '../styles/globals.css';

// Add a type for pageProps that might include a getLayout function
type PagePropsWithLayout = {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
} & AppProps['pageProps'];

function MyApp({ Component, pageProps }: AppProps) {
  // Check if the page has a custom layout
  const getLayout = (pageProps as PagePropsWithLayout).getLayout || 
    ((page: React.ReactElement) => <Layout>{page}</Layout>);
    
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {getLayout(<Component {...pageProps} />)}
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
