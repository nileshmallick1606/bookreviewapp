import React from 'react';
import { Box, Container, Typography, Link as MuiLink, Grid, Divider } from '@mui/material';
import Link from 'next/link';
import { styled } from '@mui/material/styles';

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(4, 0),
  },
}));

const FooterLink = styled(MuiLink)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'none',
  },
  display: 'block',
  marginBottom: theme.spacing(1),
}));

const FooterHeading = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
}));

interface FooterProps {
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Footer component with responsive layout
 */
const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter component="footer" className={className}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About section */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">BookReview</FooterHeading>
            <Typography variant="body2" color="text.secondary" paragraph>
              Discover your next favorite book with our comprehensive review platform. Share your thoughts
              and connect with other book lovers.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={3} md={2}>
            <FooterHeading variant="h6">Quick Links</FooterHeading>
            <Link href="/" passHref legacyBehavior>
              <FooterLink>Home</FooterLink>
            </Link>
            <Link href="/books" passHref legacyBehavior>
              <FooterLink>Books</FooterLink>
            </Link>
            <Link href="/reviews" passHref legacyBehavior>
              <FooterLink>Reviews</FooterLink>
            </Link>
            <Link href="/recommendations" passHref legacyBehavior>
              <FooterLink>Recommendations</FooterLink>
            </Link>
          </Grid>

          {/* Account Links */}
          <Grid item xs={6} sm={3} md={2}>
            <FooterHeading variant="h6">Account</FooterHeading>
            <Link href="/auth/login" passHref legacyBehavior>
              <FooterLink>Login</FooterLink>
            </Link>
            <Link href="/auth/register" passHref legacyBehavior>
              <FooterLink>Sign Up</FooterLink>
            </Link>
            <Link href="/profile" passHref legacyBehavior>
              <FooterLink>My Profile</FooterLink>
            </Link>
            <Link href="/my-reviews" passHref legacyBehavior>
              <FooterLink>My Reviews</FooterLink>
            </Link>
          </Grid>

          {/* Support Links */}
          <Grid item xs={12} sm={6} md={3}>
            <FooterHeading variant="h6">Support</FooterHeading>
            <Link href="/help" passHref legacyBehavior>
              <FooterLink>Help Center</FooterLink>
            </Link>
            <Link href="/privacy" passHref legacyBehavior>
              <FooterLink>Privacy Policy</FooterLink>
            </Link>
            <Link href="/terms" passHref legacyBehavior>
              <FooterLink>Terms of Service</FooterLink>
            </Link>
            <Link href="/contact" passHref legacyBehavior>
              <FooterLink>Contact Us</FooterLink>
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 4, mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} BookReview. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <FooterLink href="#" underline="none">
              Facebook
            </FooterLink>
            <FooterLink href="#" underline="none">
              Twitter
            </FooterLink>
            <FooterLink href="#" underline="none">
              Instagram
            </FooterLink>
          </Box>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;
