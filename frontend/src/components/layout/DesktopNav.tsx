import React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { styled } from '@mui/material/styles';
import { useAppSelector } from '../../hooks/reduxHooks';
import useLogout from '../../hooks/useLogout';

// Custom styled components
const NavLink = styled(Button)(({ theme }) => ({
  color: 'inherit',
  marginRight: theme.spacing(2),
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  [theme.breakpoints.down('sm')]: {
    marginRight: theme.spacing(1),
    padding: theme.spacing(0.75, 1),
    minWidth: 'unset',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
})) as typeof Typography;

interface DesktopNavProps {
  /**
   * Optional classname for styling
   */
  className?: string;
}

/**
 * Desktop navigation component - the main app bar with navigation links
 */
const DesktopNav: React.FC<DesktopNavProps> = ({ className }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { handleLogout } = useLogout();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    handleProfileMenuClose();
  };

  return (
    <AppBar position="static" className={className} elevation={1} color="default">
      <Toolbar>
        {/* Logo/Brand */}
        <Link href="/" passHref legacyBehavior>
          <LogoText variant="h6" component="div" sx={{ flexGrow: { xs: 1, sm: 0 } }}>
            BookReview
          </LogoText>
        </Link>

        {/* Main navigation links - only visible on desktop */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4 }}>
          <Link href="/books" passHref legacyBehavior>
            <NavLink color="inherit">Books</NavLink>
          </Link>
          <Link href="/reviews" passHref legacyBehavior>
            <NavLink color="inherit">Reviews</NavLink>
          </Link>
          <Link href="/recommendations" passHref legacyBehavior>
            <NavLink color="inherit">Recommendations</NavLink>
          </Link>
        </Box>

        {/* Auth-specific buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleProfileMenuOpen}
                  size="small"
                  aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                >
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    alt={user?.name || 'User'}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>

              {/* User dropdown menu */}
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    width: 220,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigateTo('/profile')}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => navigateTo('/my-reviews')}>
                  My Reviews
                </MenuItem>
                <MenuItem onClick={() => navigateTo('/my-favorites')}>
                  My Favorites
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Link href="/auth/login" passHref legacyBehavior>
                <Button 
                  color="primary" 
                  variant="text"
                  sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}
                >
                  Login
                </Button>
              </Link>
              <Link href="/auth/register" passHref legacyBehavior>
                <Button 
                  color="primary" 
                  variant="contained"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default DesktopNav;
