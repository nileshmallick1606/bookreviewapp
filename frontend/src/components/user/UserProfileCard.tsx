import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  Button,
  Chip,
  Divider,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';

// Define the interface for UserProfileCard props
interface UserProfileCardProps {
  /** User data object */
  user?: {
    id: string;
    username: string;
    name: string;
    bio?: string;
    avatarUrl?: string;
    joinDate: string;
    reviewCount: number;
    verified?: boolean;
    interests?: string[];
  };
  /** Whether the profile is for the current logged-in user */
  isCurrentUser?: boolean;
  /** Whether to show edit button */
  showEditButton?: boolean;
  /** Function to handle edit button click */
  onEditClick?: () => void;
  /** Whether data is loading */
  loading?: boolean;
}

// Styled components for better organization
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('sm')]: {
    width: 80,
    height: 80,
  }
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  overflow: 'visible',
  position: 'relative',
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  }
}));

const UserInfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const InterestsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

/**
 * UserProfileCard - A responsive card component for displaying user profile information
 */
const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  isCurrentUser = false,
  showEditButton = false,
  onEditClick,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) {
    return (
      <ProfileCard>
        <CardContent>
          <HeaderSection>
            <Skeleton variant="circular" width={isMobile ? 80 : 120} height={isMobile ? 80 : 120} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={40} />
              <Skeleton variant="text" width="40%" />
            </Box>
          </HeaderSection>
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="90%" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rounded" width="30%" height={32} sx={{ mr: 1, display: 'inline-block' }} />
            <Skeleton variant="rounded" width="30%" height={32} sx={{ mr: 1, display: 'inline-block' }} />
          </Box>
        </CardContent>
      </ProfileCard>
    );
  }

  if (!user) {
    return (
      <ProfileCard>
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            User profile not found
          </Typography>
        </CardContent>
      </ProfileCard>
    );
  }

  return (
    <ProfileCard>
      <CardContent>
        <HeaderSection>
          <ProfileAvatar
            src={user.avatarUrl}
            alt={user.name || user.username}
          >
            {!user.avatarUrl && <PersonIcon fontSize="large" />}
          </ProfileAvatar>
          
          <UserInfoSection>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                {user.name || user.username}
              </Typography>
              {user.verified && (
                <VerifiedIcon color="primary" fontSize="small" />
              )}
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary">
              @{user.username}
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Joined: {user.joinDate}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reviews: {user.reviewCount}
              </Typography>
            </Box>
          </UserInfoSection>
        </HeaderSection>

        {user.bio && (
          <Box sx={{ my: 2 }}>
            <Typography variant="body1">{user.bio}</Typography>
          </Box>
        )}
        
        {user.interests && user.interests.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Reading Interests:
            </Typography>
            <InterestsContainer>
              {user.interests.map((interest, index) => (
                <Chip 
                  key={index} 
                  label={interest} 
                  size={isMobile ? "small" : "medium"}
                  color="primary" 
                  variant="outlined" 
                />
              ))}
            </InterestsContainer>
          </>
        )}
      </CardContent>
      
      {showEditButton && isCurrentUser && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={onEditClick}
              size={isMobile ? "small" : "medium"}
            >
              Edit Profile
            </Button>
          </CardActions>
        </>
      )}
    </ProfileCard>
  );
};

export default UserProfileCard;
