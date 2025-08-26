// src/components/auth/RegisterForm.tsx
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
  Paper
} from '@mui/material';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';

// Validation types
interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
}

const RegisterForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // Get auth state from Redux
  const { loading, error } = useAppSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
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
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { email, password, name } = formData;
      try {
        const resultAction = await dispatch(registerUser({ email, password, name })).unwrap();
        // If we get here, the registration was successful
        router.push('/login');
      } catch (err) {
        // Error is already handled by the slice reducer
        console.error('Registration failed:', err);
      }
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 500, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Create an Account
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
          id="name"
          label="Full Name"
          name="name"
          autoComplete="name"
          autoFocus
          value={formData.name}
          onChange={handleChange}
          error={!!validationErrors.name}
          helperText={validationErrors.name}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
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
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Register'}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login">
            <Typography variant="body2" component="span" sx={{ cursor: 'pointer' }}>
              Already have an account? Sign in
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

export default RegisterForm;
