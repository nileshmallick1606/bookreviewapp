import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography,
  CircularProgress,
  Alert,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Head from 'next/head';
import Layout from '../../components/layout/Layout';
import PageHeader from '../../components/navigation/PageHeader';
import ReviewCard from '../../components/reviews/ReviewCard';
import SearchBar from '../../components/common/SearchBar';
import { useRouter } from 'next/router';
import TabNavigation from '../../components/common/TabNavigation';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// Mock data for reviews
const MOCK_REVIEWS = [
  {
    id: '1',
    userId: 'user1',
    username: 'Sarah Johnson',
    userAvatar: '',
    rating: 4.5,
    title: 'Engaging and Well-Written',
    content: 'This book kept me engaged from beginning to end. The character development was exceptional and the plot had unexpected twists that kept me turning pages well into the night.',
    date: '2025-08-01T14:30:00',
    bookTitle: 'The Silent Echo',
    bookId: 'book1',
    upvotes: 42,
    downvotes: 3,
    tags: ['Fiction', 'Mystery'],
  },
  {
    id: '2',
    userId: 'user2',
    username: 'Michael Chen',
    userAvatar: '',
    rating: 5,
    title: 'A Modern Classic',
    content: 'I couldn\'t put this book down! The author\'s writing style is beautiful and the story is incredibly moving. Highly recommend for anyone who enjoys literary fiction with deep character development.',
    date: '2025-08-10T09:15:00',
    bookTitle: 'Beyond the Horizon',
    bookId: 'book2',
    upvotes: 108,
    downvotes: 5,
    tags: ['Fiction', 'Literary'],
  },
  {
    id: '3',
    userId: 'user3',
    username: 'Emily Rodriguez',
    userAvatar: '',
    rating: 3,
    title: 'Promising but Flawed',
    content: 'The premise was interesting but the execution fell short. Some characters felt underdeveloped and the ending was rushed. Still worth reading if you enjoy the genre.',
    date: '2025-08-15T16:45:00',
    bookTitle: 'Midnight Shadows',
    bookId: 'book3',
    upvotes: 24,
    downvotes: 12,
    tags: ['Thriller', 'Mystery'],
  },
  {
    id: '4',
    userId: 'user4',
    username: 'James Wilson',
    userAvatar: '',
    rating: 4,
    title: 'Thought-Provoking Read',
    content: 'This non-fiction book offers fascinating insights into a complex topic. The research is thorough and presented in an accessible way that makes it enjoyable even for casual readers.',
    date: '2025-08-20T11:20:00',
    bookTitle: 'The Hidden Patterns',
    bookId: 'book4',
    upvotes: 65,
    downvotes: 8,
    tags: ['Non-fiction', 'Science'],
  },
];

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const ReviewsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('recent');
  const [sortBy, setSortBy] = useState('recent');
  const [timeFrame, setTimeFrame] = useState('all');
  const [ratings, setRatings] = useState('all');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab options
  const tabs = [
    { label: 'Recent Reviews', value: 'recent' },
    { label: 'Popular', value: 'popular' },
    { label: 'Controversial', value: 'controversial' },
    { label: 'Top Rated', value: 'top-rated' },
  ];

  // Handle tab change
  const handleTabChange = (newValue: string | number) => {
    setActiveTab(newValue as string);
    setLoading(true);
    
    // In a real app, this would fetch different data based on the tab
    setTimeout(() => {
      setLoading(false);
      setReviews(MOCK_REVIEWS);
    }, 500);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    
    // In a real app, this would search reviews
    setTimeout(() => {
      const filtered = MOCK_REVIEWS.filter(review => 
        review.title.toLowerCase().includes(value.toLowerCase()) ||
        review.content.toLowerCase().includes(value.toLowerCase()) ||
        review.bookTitle.toLowerCase().includes(value.toLowerCase())
      );
      setReviews(filtered);
      setLoading(false);
    }, 300);
  };

  // Handle voting
  const handleUpvote = (reviewId: string) => {
    console.log(`Upvoted review ${reviewId}`);
    // In a real app, this would call an API
    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, upvotes: review.upvotes + 1, isUserUpvoted: true }
        : review
    );
    setReviews(updatedReviews);
  };

  const handleDownvote = (reviewId: string) => {
    console.log(`Downvoted review ${reviewId}`);
    // In a real app, this would call an API
    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, downvotes: review.downvotes + 1, isUserDownvoted: true }
        : review
    );
    setReviews(updatedReviews);
  };

  // Load initial data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(MOCK_REVIEWS);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <>
      <Head>
        <title>Book Reviews | BookReview</title>
        <meta name="description" content="Browse and search for book reviews from our community" />
      </Head>

      <Container>
        <PageHeader
            title="Book Reviews"
            description="Discover honest reviews from our community of book lovers"
            breadcrumbs={[{ label: 'Reviews', href: '/reviews' }]}
          />

        {/* Search bar */}
        <Box sx={{ mb: 3 }}>
          <SearchBar
            placeholder="Search reviews by title, content, or book"
            onSearch={handleSearch}
            showFilter
          />
        </Box>

        {/* Tab navigation */}
        <TabNavigation
          tabs={tabs}
          value={activeTab}
          onChange={handleTabChange}
          collapseOnMobile
          maxVisibleMobileTabs={3}
        />

        {/* Filters */}
        <FilterContainer>
          <StyledFormControl size="small">
            <InputLabel id="sort-by-label">Sort By</InputLabel>
            <Select
              labelId="sort-by-label"
              id="sort-by"
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="recent">Most Recent</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="rating-high">Highest Rating</MenuItem>
              <MenuItem value="rating-low">Lowest Rating</MenuItem>
            </Select>
          </StyledFormControl>

          <StyledFormControl size="small">
            <InputLabel id="time-frame-label">Time</InputLabel>
            <Select
              labelId="time-frame-label"
              id="time-frame"
              value={timeFrame}
              label="Time"
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Past Week</MenuItem>
              <MenuItem value="month">Past Month</MenuItem>
              <MenuItem value="year">Past Year</MenuItem>
            </Select>
          </StyledFormControl>

          <StyledFormControl size="small">
            <InputLabel id="ratings-label">Rating</InputLabel>
            <Select
              labelId="ratings-label"
              id="ratings"
              value={ratings}
              label="Rating"
              onChange={(e) => setRatings(e.target.value)}
            >
              <MenuItem value="all">All Ratings</MenuItem>
              <MenuItem value="5">5 Stars</MenuItem>
              <MenuItem value="4">4+ Stars</MenuItem>
              <MenuItem value="3">3+ Stars</MenuItem>
              <MenuItem value="2">2+ Stars</MenuItem>
              <MenuItem value="1">1+ Star</MenuItem>
            </Select>
          </StyledFormControl>
        </FilterContainer>

        <Divider sx={{ my: 2 }} />

        {/* Reviews list */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : reviews.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No reviews found matching your criteria
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <ReviewCard
                  id={review.id}
                  userId={review.userId}
                  username={review.username}
                  userAvatar={review.userAvatar}
                  rating={review.rating}
                  title={review.title}
                  content={review.content}
                  date={review.date}
                  bookTitle={review.bookTitle}
                  bookId={review.bookId}
                  upvotes={review.upvotes}
                  downvotes={review.downvotes}
                  isUserUpvoted={review.isUserUpvoted}
                  isUserDownvoted={review.isUserDownvoted}
                  tags={review.tags}
                  onUpvoteClick={handleUpvote}
                  onDownvoteClick={handleDownvote}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
};

export default ReviewsPage;
