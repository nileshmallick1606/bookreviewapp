// src/pages/_app.tsx
import React from 'react';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import store from '../store';
import '../styles/globals.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#0070f3',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f7f7f7',
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </Provider>
  );
}

export default MyApp;
