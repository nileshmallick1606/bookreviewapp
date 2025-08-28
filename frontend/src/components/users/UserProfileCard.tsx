import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Skeleton,
  Divider,
  Badge,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { useRouter } from 'next/router';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'visible',
  position: 'relative',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}));

const LargeAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(2),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    flexWrap: 'wrap',
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ProfileBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontSize: 10,
    height: 20,
    minWidth: 20,
  },
}));

interface UserProfileCardProps {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  joinDate: string;
  reviewCount: number;
  favoriteCount: number;
  badges?: string[];
  isLoading?: boolean;
  isCurrentUser?: boolean;
  onEditProfileClick?: () => void;
  className?: string;
}

/**
 * Responsive user profile card component
 */
const UserProfileCard: React.FC<UserProfileCardProps> = ({
  id,
  name,
  avatar,
  bio,
  joinDate,
  reviewCount,
  favoriteCount,
  badges = [],
  isLoading = false,
  isCurrentUser = false,
  onEditProfileClick,
  className,
}) => {
  const router = useRouter();
  
  const handleReviewsClick = () => {
    router.push(`/profile/${id}/reviews`);
  };
  
  const handleFavoritesClick = () => {
    router.push(`/profile/${id}/favorites`);
  };

  if (isLoading) {
    return (
      <StyledCard className={className}>
        <CardContent>
          <ProfileHeader>
            <Skeleton variant="circular" width={100} height={100} sx={{ mb: 2 }} />
            <Skeleton width="50%" height={32} />
            <Skeleton width="30%" height={24} />
          </ProfileHeader>
          
          <Divider sx={{ my: 2 }} />
          
          <StatsContainer>
            <Skeleton width={80} height={60} />
            <Skeleton width={80} height={60} />
          </StatsContainer>
          
          <Skeleton width="100%" height={60} />
        </CardContent>
      </StyledCard>
    );
  }

  const formattedJoinDate = new Date(joinDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <StyledCard className={className}>
      <CardContent>
        <ProfileHeader>
          <ProfileBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            invisible={badges.length === 0}
          >
            <LargeAvatar src={avatar} alt={name}>
              {name?.charAt(0).toUpperCase()}
            </LargeAvatar>
          </ProfileBadge>

          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
            {name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Member since {formattedJoinDate}
          </Typography>
        </ProfileHeader>

        {/* User badges */}
        {badges.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 2 }}>
            {badges.map((badge, index) => (
              <Chip 
                key={index} 
                label={badge} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            ))}
          </Box>
        )}
        
        {/* Bio section */}
        {bio && (
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              {bio}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        {/* Stats section */}
        <StatsContainer>
          <StatItem onClick={handleReviewsClick} sx={{ cursor: 'pointer' }}>
            <RateReviewIcon color="primary" sx={{ mb: 0.5 }} />
            <Typography variant="h6">{reviewCount}</Typography>
            <Typography variant="body2" color="text.secondary">Reviews</Typography>
          </StatItem>
          
          <StatItem onClick={handleFavoritesClick} sx={{ cursor: 'pointer' }}>
            <BookmarkIcon color="primary" sx={{ mb: 0.5 }} />
            <Typography variant="h6">{favoriteCount}</Typography>
            <Typography variant="body2" color="text.secondary">Favorites</Typography>
          </StatItem>
        </StatsContainer>
        
        {/* Edit profile button (only visible to current user) */}
        {isCurrentUser && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={onEditProfileClick}
            >
              Edit Profile
            </Button>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default UserProfileCard;
