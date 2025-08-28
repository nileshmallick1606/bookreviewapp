// src/pages/profile/edit.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Paper, Box, Button, Alert, CircularProgress } from '@mui/material';
import withAuth from '../../components/common/withAuth';
import { useAppSelector } from '../../hooks/reduxHooks';
import { getUserProfile, updateProfile, ProfileUpdateData, UserProfile } from '../../services/userService';
import ProfileForm from '../../components/profile/ProfileForm';

const EditProfilePage: NextPage = () => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          const profile = await getUserProfile(user.id);
          setUserProfile(profile);
          setError(null);
        } catch (err) {
          setError('Failed to load profile data. Please try again.');
          console.error('Error loading profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const handleSubmit = async (data: ProfileUpdateData) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      
      const updatedProfile = await updateProfile(user.id, data);
      
      if (updatedProfile) {
        setSuccessMessage('Profile updated successfully!');
        
        // Navigate back to profile page after a short delay
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while updating your profile.');
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/profile');
  };
  
  return (
    <>
      <Head>
        <title>Edit Profile | BookReview</title>
        <meta name="description" content="Edit your profile on BookReview" />
      </Head>
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Edit Profile
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {successMessage}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : userProfile ? (
            <ProfileForm 
              profile={userProfile}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          ) : (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                Unable to load profile data. Please try again.
              </Alert>
              
              <Link href="/profile" passHref>
                <Button variant="contained">
                  Back to Profile
                </Button>
              </Link>
            </Box>
          )}
        </Paper>
      </Container>
    </>
  );
};

// Wrap the page with the auth HOC
export default withAuth(EditProfilePage);
