import React from 'react';
import Box from '@mui/material/Box';
import MobileNav from './MobileNav';
import DesktopNav from './DesktopNav';

interface MainNavProps {
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Main navigation component that handles responsive navigation
 * Uses MobileNav for small screens and DesktopNav for larger screens
 */
const MainNav: React.FC<MainNavProps> = ({ className }) => {
  return (
    <Box className={className} component="nav">
      {/* Desktop Navigation - hidden on mobile */}
      <DesktopNav />
      
      {/* Mobile Navigation - hidden on desktop */}
      <MobileNav />
    </Box>
  );
};

export default MainNav;
