import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/navigation/PageHeader';
import BookGrid from '../../components/books/BookGrid';
import SearchBar from '../../components/common/SearchBar';
import TabNavigation from '../../components/common/TabNavigation';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import FilterListIcon from '@mui/icons-material/FilterList';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WhatshotIcon from '@mui/icons-material/Whatshot';

// Mock data for recommended books
const MOCK_RECOMMENDATIONS = [
  {
    id: 'rec1',
    title: 'Personalized Recommendations',
    description: 'Based on your reading history, ratings, and preferences',
    books: [
      {
        id: 'book1',
        title: 'The Silent Echo',
        author: 'Michelle Spencer',
        coverImage: 'https://placeholder.pics/svg/300x400/ED4264/FFFFFF/Book%20Cover',
        genres: ['Mystery', 'Fiction'],
        averageRating: 4.5,
        totalReviews: 124,
      },
      {
        id: 'book2',
        title: 'Beyond the Horizon',
        author: 'David Chen',
        coverImage: 'https://placeholder.pics/svg/300x400/5A32F0/FFFFFF/Book%20Cover',
        genres: ['Fiction', 'Literary'],
        averageRating: 4.7,
        totalReviews: 89,
      },
      {
        id: 'book3',
        title: 'Midnight Shadows',
        author: 'Alexandra Smith',
        coverImage: 'https://placeholder.pics/svg/300x400/007AFF/FFFFFF/Book%20Cover',
        genres: ['Thriller', 'Mystery'],
        averageRating: 3.9,
        totalReviews: 56,
      },
    ],
  },
  {
    id: 'rec2',
    title: 'Based on Your Favorite Genres',
    description: 'Top-rated books in your preferred genres',
    books: [
      {
        id: 'book4',
        title: 'The Hidden Patterns',
        author: 'Robert Johnson',
        coverImage: 'https://placeholder.pics/svg/300x400/FF9500/FFFFFF/Book%20Cover',
        genres: ['Non-fiction', 'Science'],
        averageRating: 4.3,
        totalReviews: 78,
      },
      {
        id: 'book5',
        title: 'Ocean\'s Depth',
        author: 'Sarah Williams',
        coverImage: 'https://placeholder.pics/svg/300x400/00CD95/FFFFFF/Book%20Cover',
        genres: ['Adventure', 'Fiction'],
        averageRating: 4.1,
        totalReviews: 45,
      },
      {
        id: 'book6',
        title: 'The Quantum Paradox',
        author: 'Thomas Lee',
        coverImage: 'https://placeholder.pics/svg/300x400/8C54FF/FFFFFF/Book%20Cover',
        genres: ['Science Fiction', 'Thriller'],
        averageRating: 4.6,
        totalReviews: 112,
      },
    ],
  },
  {
    id: 'rec3',
    title: 'Similar to Books You\'ve Rated Highly',
    description: 'Readers who enjoyed the same books also liked these',
    books: [
      {
        id: 'book7',
        title: 'The Forgotten Key',
        author: 'Emily Rogers',
        coverImage: 'https://placeholder.pics/svg/300x400/FF3B30/FFFFFF/Book%20Cover',
        genres: ['Mystery', 'Historical Fiction'],
        averageRating: 4.4,
        totalReviews: 67,
      },
      {
        id: 'book8',
        title: 'Starlight Chronicles',
        author: 'James Wilson',
        coverImage: 'https://placeholder.pics/svg/300x400/34C759/FFFFFF/Book%20Cover',
        genres: ['Fantasy', 'Adventure'],
        averageRating: 4.8,
        totalReviews: 94,
      },
      {
        id: 'book9',
        title: 'Mind\'s Eye',
        author: 'Sophia Chen',
        coverImage: 'https://placeholder.pics/svg/300x400/FF9500/FFFFFF/Book%20Cover',
        genres: ['Thriller', 'Psychological'],
        averageRating: 4.2,
        totalReviews: 53,
      },
    ],
  },
];

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  overflow: 'visible',
}));

const CategoryHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > :not(:first-of-type)': {
      marginTop: theme.spacing(1),
    },
  },
}));

const RecommendationsPage = () => {
  const [activeTab, setActiveTab] = useState('personalized');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Tab options
  const tabs = [
    { 
      label: 'Personalized', 
      value: 'personalized',
      icon: <AutoAwesomeIcon /> 
    },
    { 
      label: 'By Genre', 
      value: 'genre',
      icon: <BookmarkIcon /> 
    },
    { 
      label: 'Trending', 
      value: 'trending',
      icon: <WhatshotIcon /> 
    },
    { 
      label: 'For You', 
      value: 'for-you',
      icon: <LocalLibraryIcon /> 
    },
  ];

  // Handle tab change
  const handleTabChange = (newValue: string | number) => {
    setActiveTab(newValue as string);
    setLoading(true);
    
    // In a real app, this would fetch different data based on the tab
    setTimeout(() => {
      setLoading(false);
      setRecommendations(MOCK_RECOMMENDATIONS);
    }, 800);
  };

  // Load initial data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecommendations(MOCK_RECOMMENDATIONS);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Head>
        <title>Book Recommendations | BookReview</title>
        <meta name="description" content="Personalized book recommendations based on your preferences" />
      </Head>

      <Container>
        <PageHeader
            title="Book Recommendations"
            description="Discover your next favorite book with personalized recommendations"
            breadcrumbs={[{ label: 'Recommendations', href: '/recommendations' }]}
          />

        {/* Tab navigation */}
        <TabNavigation
          tabs={tabs}
          value={activeTab}
          onChange={handleTabChange}
          collapseOnMobile
          maxVisibleMobileTabs={3}
        />

        {/* Settings */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              size="small"
            >
              Preferences
            </Button>
            <Button 
              variant="outlined" 
              size="small"
            >
              Refresh
            </Button>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={showAll}
                onChange={() => setShowAll(!showAll)}
                size="small"
              />
            }
            label="Show all recommendations"
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Recommendations list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : recommendations.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recommendations available yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Rate more books or update your preferences to get personalized recommendations
            </Typography>
            <Button variant="contained" color="primary">
              Rate Some Books
            </Button>
          </Paper>
        ) : (
          <Box>
            {recommendations.map((section) => (
              <StyledCard key={section.id}>
                <CardContent>
                  <CategoryHeader>
                    <Box>
                      <SectionTitle variant="h6">
                        <AutoAwesomeIcon color="primary" />
                        {section.title}
                      </SectionTitle>
                      <Typography variant="body2" color="text.secondary">
                        {section.description}
                      </Typography>
                    </Box>
                    <Button size="small">See All</Button>
                  </CategoryHeader>
                  
                  <BookGrid books={section.books} />
                </CardContent>
              </StyledCard>
            ))}
            
            {/* Additional insights section */}
            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Reading Insights
              </Typography>
              <Typography variant="body2" paragraph>
                Based on your reading history, you might enjoy these genres:
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                <Chip label="Mystery" color="primary" variant="outlined" />
                <Chip label="Fiction" color="primary" variant="outlined" />
                <Chip label="Science Fiction" color="primary" variant="outlined" />
                <Chip label="Historical Fiction" color="primary" variant="outlined" />
              </Box>
              
              <List sx={{ bgcolor: 'background.paper' }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><LocalLibraryIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Reading Pattern"
                    secondary="You typically enjoy longer books over 350 pages"
                  />
                </ListItem>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar><BookmarkIcon /></Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Author Preferences"
                    secondary="You frequently read books by Michelle Spencer and James Wilson"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        )}
      </Container>
    </>
  );
};

export default RecommendationsPage;
