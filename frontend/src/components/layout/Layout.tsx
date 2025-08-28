// src/components/layout/Layout.tsx
import React, { ReactNode } from 'react';
import MainNav from './MainNav';
import Footer from './Footer';
import ResponsiveContainer from './ResponsiveContainer';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface LayoutProps {
  children: ReactNode;
  /**
   * Set to true for full-width layout without container constraints
   */
  fullWidth?: boolean;
  /**
   * Remove top padding (useful for pages with hero sections)
   */
  noTopPadding?: boolean;
  /**
   * Set to true to hide the main navigation (useful when page has its own header)
   */
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  fullWidth = false,
  noTopPadding = false,
  hideNav = false
}) => {
  const theme = useTheme();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh'
      }}
    >
      {!hideNav && <MainNav />}
      <Box 
        component="main" 
        sx={{ 
          pt: noTopPadding ? 0 : { xs: 2, sm: 3, md: 4 },
          pb: { xs: 4, sm: 5, md: 6 },
          flexGrow: 1,
          width: '100%',
          // Add top margin to account for fixed navbar height if needed
          // mt: { xs: '56px', sm: '64px' },
        }}
      >
        {fullWidth ? (
          children
        ) : (
          <ResponsiveContainer maxWidth="lg">
            {children}
          </ResponsiveContainer>
        )}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
