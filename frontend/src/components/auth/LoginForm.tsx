// src/components/auth/LoginForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  Box,
  Button, 
  TextField, 
  Typography, 
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import SocialLogin from './SocialLogin';

// Validation types
interface ValidationErrors {
  email?: string;
  password?: string;
}

const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Get auth state from Redux
  const { loading, error } = useAppSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'rememberMe' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear validation error when user types
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Clear server error when user types
    if (error) {
      dispatch(clearError());
    }
  };
  
  // Validate form inputs
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await dispatch(loginUser({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })).unwrap();
        
        // Check if there's a redirect URL in the query params
        const redirect = router.query.redirect as string;
        
        // Redirect to the specified page or home page after successful login
        router.push(redirect || '/');
      } catch (err) {
        // Error is already handled by the slice reducer
        console.error('Login failed:', err);
      }
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Sign In
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
          value={formData.email}
          onChange={handleChange}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
        />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                color="primary"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
            }
            label="Remember me"
          />
          
          <Link href="/auth/forgot-password">
            <Typography variant="body2" component="span" sx={{ cursor: 'pointer', color: 'primary.main' }}>
              Forgot password?
            </Typography>
          </Link>
        </Box>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        
        {/* Social Login Buttons */}
        <SocialLogin 
          onError={(message) => {
            dispatch({
              type: 'auth/setError',
              payload: message
            });
          }} 
        />
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/auth/register">
            <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
              Don't have an account? Sign Up
            </Typography>
          </Link>
        </Box>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link href="/">
            <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
              Back to Home
            </Typography>
          </Link>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;
