// src/components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Container, Box } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box component="main" sx={{ pt: 3, pb: 5 }}>
        <Container>
          {children}
        </Container>
      </Box>
    </>
  );
};

export default Layout;
