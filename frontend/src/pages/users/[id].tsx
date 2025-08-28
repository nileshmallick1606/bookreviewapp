// src/pages/users/[id].tsx
import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import { getUserById, UserProfile, User } from '../../services/userService';
import { useAppSelector } from '../../hooks/reduxHooks';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileReviewsList from '../../components/profile/ProfileReviewsList';
import { getUserReviews, ReviewWithBook } from '../../services/reviewService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-profile-tabpanel-${index}`}
      aria-labelledby={`user-profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const UserProfilePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAppSelector(state => state.auth);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<ReviewWithBook[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === id;
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const userId = id as string;
        const user = await getUserById(userId);
        
        if (user) {
          // Convert User to UserProfile by adding default stats
          const userProfile: UserProfile = {
            ...user,
            stats: {
              reviewCount: 0,  // Default value, will be updated when reviews are loaded
              favoriteCount: 0 // Default value, will be updated when favorites are loaded
            }
          };
          setUserProfile(userProfile);
          setError(null);
        } else {
          setUserProfile(null);
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to load user profile. The user may not exist.');
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [id]);
  
  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!id || tabValue !== 0) return;
      
      try {
        setReviewsLoading(true);
        // Fetch reviews to update the stats
        const userId = id as string;
        
        try {
          const response = await getUserReviews(userId, 1, 1); // Just to get the total count
          
          // Update user profile stats with review count
          setUserProfile(prevProfile => {
            if (prevProfile) {
              return {
                ...prevProfile,
                stats: {
                  ...prevProfile.stats,
                  reviewCount: response.pagination.total
                }
              };
            }
            return prevProfile;
          });
        } catch (reviewErr) {
          console.error('Error fetching review count:', reviewErr);
        }
        
        setReviewsLoading(false);
      } catch (err) {
        console.error('Error loading user reviews:', err);
        setReviewsLoading(false);
      }
    };
    
    fetchUserReviews();
  }, [id, tabValue]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <>
      <Head>
        <title>
          {userProfile ? `${userProfile.name}'s Profile` : 'User Profile'} | BookReview
        </title>
        <meta 
          name="description" 
          content={userProfile ? `${userProfile.name}'s profile on BookReview` : 'User profile on BookReview'} 
        />
      </Head>
      
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Button 
                component={Link}
                href="/" 
                variant="contained"
              >
                Back to Home
              </Button>
            </Box>
          ) : userProfile ? (
            <>
              <ProfileHeader 
                profile={userProfile} 
                isOwnProfile={isOwnProfile} 
              />
              
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  aria-label="user profile tabs"
                >
                  <Tab label="Reviews" id="user-profile-tab-0" />
                </Tabs>
              </Box>
              
              <TabPanel value={tabValue} index={0}>
                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <ProfileReviewsList userId={userProfile.id} isOwnProfile={isOwnProfile} />
                )}
              </TabPanel>
              
              <Box sx={{ mt: 4 }}>
                <Button 
                  component={Link}
                  href="/" 
                  variant="outlined"
                >
                  Back to Home
                </Button>
                
                {isOwnProfile && (
                  <Button 
                    component={Link}
                    href="/profile" 
                    variant="contained" 
                    sx={{ ml: 2 }}
                  >
                    Go to My Profile
                  </Button>
                )}
              </Box>
            </>
          ) : (
            <Alert severity="error">
              User not found.
            </Alert>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default UserProfilePage;
