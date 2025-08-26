// src/components/auth/PasswordResetRequestForm.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import { requestPasswordReset } from '../../services/passwordResetService';

const PasswordResetRequestForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = re.test(email);
    
    if (!isValid) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
    
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear errors when typing
    setEmailError('');
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset state
    setError('');
    
    // Validate email
    if (!email.trim() || !validateEmail(email)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Submit request to API
      await requestPasswordReset(email);
      
      // Show success message
      setSuccess(true);
    } catch (error: any) {
      // Display error message
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Reset Password
      </Typography>
      
      {success ? (
        <Box sx={{ textAlign: 'center', my: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            If your email is registered, you will receive reset instructions shortly.
          </Alert>
          <Typography variant="body1" paragraph>
            Please check your email and follow the instructions to reset your password.
          </Typography>
          <Link href="/auth/login">
            <MuiLink component="span">
              Return to login
            </MuiLink>
          </Link>
        </Box>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleChange}
              error={!!emailError}
              helperText={emailError}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link href="/auth/login">
                <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
                  Back to Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default PasswordResetRequestForm;
