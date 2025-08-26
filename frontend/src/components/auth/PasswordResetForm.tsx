// src/components/auth/PasswordResetForm.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
import { validatePasswordResetToken, resetPassword } from '../../services/passwordResetService';

interface PasswordResetFormProps {
  token: string;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ token }) => {
  const router = useRouter();
  
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation state
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Component state
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        setValidatingToken(true);
        const data = await validatePasswordResetToken(token);
        setTokenValid(true);
        setTokenEmail(data.email);
      } catch (error) {
        setTokenValid(false);
        setError('This password reset link is invalid or has expired.');
      } finally {
        setValidatingToken(false);
      }
    };
    
    checkToken();
  }, [token]);
  
  // Validate password strength
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return false;
    }
    
    if (!/[a-z]/.test(password)) {
      setPasswordError('Password must contain at least one lowercase letter');
      return false;
    }
    
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return false;
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      setPasswordError('Password must contain at least one special character');
      return false;
    }
    
    setPasswordError('');
    return true;
  };
  
  // Validate matching passwords
  const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    
    setConfirmPasswordError('');
    return true;
  };
  
  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    if (confirmPassword) {
      validateConfirmPassword(newPassword, confirmPassword);
    }
  };
  
  // Handle confirm password change
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    
    if (newConfirmPassword) {
      validateConfirmPassword(password, newConfirmPassword);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setError('');
    
    // Validate form
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirmPassword);
    
    if (!isPasswordValid || !isConfirmValid) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Submit password reset to API
      await resetPassword(token, password);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
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
  
  // Show loading indicator while validating token
  if (validatingToken) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Validating reset link...
        </Typography>
      </Paper>
    );
  }
  
  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Invalid Reset Link
        </Typography>
        
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/auth/forgot-password">
            <Button variant="contained">
              Request New Reset Link
            </Button>
          </Link>
          
          <Box sx={{ mt: 2 }}>
            <Link href="/auth/login">
              <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
                Back to Login
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    );
  }
  
  // Show success message after password reset
  if (success) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Password Reset Complete
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password has been reset successfully.
        </Alert>
        
        <Typography align="center" paragraph>
          You will be redirected to the login page in a few seconds.
        </Typography>
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/auth/login">
            <Button variant="contained">
              Go to Login
            </Button>
          </Link>
        </Box>
      </Paper>
    );
  }
  
  // Show password reset form
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Reset Password
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        Enter a new password for {tokenEmail}
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
          name="password"
          label="New Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={handlePasswordChange}
          error={!!passwordError}
          helperText={passwordError}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm New Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={!!confirmPasswordError}
          helperText={confirmPasswordError}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/auth/login">
            <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
              Back to Login
            </Typography>
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default PasswordResetForm;
