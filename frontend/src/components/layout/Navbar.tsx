// src/components/layout/Navbar.tsx
import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { BookOutlined as BookIcon } from '@mui/icons-material';
import { useAppSelector } from '../../hooks/reduxHooks';
import useLogout from '../../hooks/useLogout';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const { handleLogout: logout } = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleMenuClose();
  };
  
  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo and site name */}
          <BookIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            BookReview
          </Typography>
          
          {/* Mobile logo */}
          <BookIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            BookReview
          </Typography>
          
          {/* Main menu items */}
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <Button
              component={Link}
              href="/books"
              sx={{ my: 2, color: 'white', display: 'block' }}
            >
              Books
            </Button>
          </Box>
          
          {/* Auth buttons / User menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                  <Avatar alt={user?.name || 'User'}>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
                <Menu
                  sx={{ mt: '45px' }}
                  id="user-menu"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    router.push('/profile');
                  }}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => {
                    handleMenuClose();
                    router.push('/my-reviews');
                  }}>
                    My Reviews
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/auth/login"
                  sx={{ color: 'white' }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  sx={{ ml: 1, bgcolor: 'secondary.main' }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
