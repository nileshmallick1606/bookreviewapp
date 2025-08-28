// src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Container, Typography, Paper, Box, Button, CircularProgress, Alert } from '@mui/material';
import withAuth from '../components/common/withAuth';
import { useAppSelector, useAppDispatch } from '../hooks/reduxHooks';
import { logout } from '../store/slices/authSlice';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileNavigation from '../components/profile/ProfileNavigation';
import ProfileReviewsTab from '../components/profile/ProfileReviewsTab';
import ProfileFavoritesTab from '../components/profile/ProfileFavoritesTab';
import { getUserProfile, UserProfile } from '../services/userService';

const ProfilePage: NextPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites'>('reviews');
  
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
  
  const handleLogout = () => {
    dispatch(logout());
    // Note: You would typically also make an API call to invalidate the token
    // This would be implemented in a real logout function in the auth service
  };
  
  const handleEditProfile = () => {
    // This will be implemented in US 6.2: Edit Profile
    router.push('/profile/edit');
  };
  
  const handleTabChange = (tab: 'reviews' | 'favorites') => {
    setActiveTab(tab);
  };
  
  return (
    <>
      <Head>
        <title>Profile | BookReview</title>
        <meta name="description" content="Your profile on BookReview" />
      </Head>
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : userProfile ? (
            <>
              <ProfileHeader 
                profile={userProfile} 
                isOwnProfile={true} 
              />
              
              <ProfileNavigation
                isOwnProfile={true}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onEditProfile={handleEditProfile}
              />
              
              {activeTab === 'reviews' ? (
                <ProfileReviewsTab />
              ) : (
                <ProfileFavoritesTab />
              )}
              
              <Box sx={{ mt: 6, display: 'flex', justifyContent: 'space-between' }}>
                <Link href="/" passHref>
                  <Button variant="outlined">
                    Back to Home
                  </Button>
                </Link>
                
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </>
          ) : (
            <Alert severity="error">
              User profile not found.
            </Alert>
          )}
        </Paper>
      </Container>
    </>
  );
};

// Wrap the page with the auth HOC
export default withAuth(ProfilePage);
