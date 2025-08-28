import React, { useState } from 'react';
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Box,
  Divider,
  Avatar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Bookmark as BookmarkIcon,
  Reviews as ReviewsIcon,
  AccountCircle as AccountIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppSelector } from '../../hooks/reduxHooks';
import useLogout from '../../hooks/useLogout';

interface MobileNavProps {
  /**
   * Optional classname for styling
   */
  className?: string;
}

/**
 * Mobile navigation drawer component
 */
const MobileNav: React.FC<MobileNavProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={toggleDrawer(true)}
        className={className}
        sx={{
          display: { xs: 'flex', md: 'none' },
          mr: 2,
          // Increase touch target size
          padding: '12px',
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile navigation drawer */}
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <Box
          role="presentation"
          sx={{ width: 280, pt: 1, pb: 2 }}
        >
          {/* User info section if logged in */}
          {isAuthenticated && user && (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar alt={user.name || 'User'} sx={{ width: 40, height: 40, mr: 2 }}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 1 }} />

          {/* Main navigation items */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/')}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/books')}>
                <ListItemIcon>
                  <BookmarkIcon />
                </ListItemIcon>
                <ListItemText primary="Books" />
              </ListItemButton>
            </ListItem>
          </List>

          <Divider sx={{ my: 1 }} />

          {/* Auth navigation items */}
          <List>
            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation('/profile')}>
                    <ListItemIcon>
                      <AccountIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation('/my-reviews')}>
                    <ListItemIcon>
                      <ReviewsIcon />
                    </ListItemIcon>
                    <ListItemText primary="My Reviews" />
                  </ListItemButton>
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem disablePadding>
                  <ListItemButton onClick={handleLogoutClick}>
                    <ListItemIcon>
                      <LoginIcon sx={{ transform: 'rotate(180deg)' }} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation('/auth/login')}>
                    <ListItemIcon>
                      <LoginIcon />
                    </ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigation('/auth/register')}>
                    <ListItemIcon>
                      <RegisterIcon />
                    </ListItemIcon>
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default MobileNav;
