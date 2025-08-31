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
import { getAllReviews, Review as ReviewType } from '../../services/reviewService';
import { BookService } from '../../services/bookService';

// Fallback mock data for reviews (used when API fails)
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
    // The useEffect hook will handle fetching the data when activeTab changes
  };

  // Handle search
  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    
    try {
      // In a real implementation, we'd have a dedicated search endpoint
      // For now, we'll fetch all reviews and filter on the client side
      const result = await getAllReviews(1, 50); // Get more reviews to search through
      
      // Process and filter reviews
      const processedReviews = await Promise.all(result.items.map(async (review) => {
        try {
          const book = await BookService.getBookById(review.bookId);
          
          // Create a searchable version of the review
          const searchableReview = {
            id: review.id,
            userId: review.userId,
            username: 'User',
            userAvatar: '',
            rating: review.rating,
            title: book?.title || 'Unknown Book',
            content: review.text,
            date: review.createdAt,
            bookTitle: book?.title || 'Unknown Book',
            bookId: review.bookId,
            upvotes: review.likes?.length || 0,
            downvotes: 0,
            tags: book?.genres || [],
          };
          
          // Check if it matches the search query
          if (value && (
            searchableReview.title.toLowerCase().includes(value.toLowerCase()) ||
            searchableReview.content.toLowerCase().includes(value.toLowerCase()) ||
            searchableReview.bookTitle.toLowerCase().includes(value.toLowerCase())
          )) {
            return searchableReview;
          }
          return null;
        } catch (err) {
          console.error('Error processing review:', err);
          return null;
        }
      }));
      
      const filteredReviews = processedReviews.filter(Boolean);
      setReviews(filteredReviews.length > 0 ? filteredReviews : []);
      setLoading(false);
    } catch (err) {
      console.error('Error searching reviews:', err);
      setError('Failed to search reviews. Please try again later.');
      setLoading(false);
    }
  };

  // Handle voting
  const handleUpvote = async (reviewId: string) => {
    console.log(`Upvoted review ${reviewId}`);
    // We would ideally call the toggleLikeReview API here
    
    // For now, just update the UI optimistically
    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, upvotes: review.upvotes + 1, isUserUpvoted: true }
        : review
    );
    setReviews(updatedReviews);
  };

  const handleDownvote = (reviewId: string) => {
    // This is a placeholder since our API doesn't support downvotes
    console.log(`Downvoted review ${reviewId}`);
    const updatedReviews = reviews.map(review =>
      review.id === reviewId
        ? { ...review, downvotes: review.downvotes + 1, isUserDownvoted: true }
        : review
    );
    setReviews(updatedReviews);
  };

  // Load initial data
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which endpoint to call based on active tab
        let result;
        
        if (activeTab === 'recent') {
          result = await getAllReviews(1, 10, 'createdAt', 'desc');
        } else if (activeTab === 'popular') {
          // For popular reviews, we'd ideally sort by likes count
          result = await getAllReviews(1, 10, 'likes', 'desc');
        } else if (activeTab === 'controversial') {
          // For controversial, we might use a different endpoint or sort
          result = await getAllReviews(1, 10, 'comments', 'desc');
        } else if (activeTab === 'top-rated') {
          result = await getAllReviews(1, 10, 'rating', 'desc');
        } else {
          result = await getAllReviews();
        }
        
        // Process reviews to match the format expected by ReviewCard
        const processedReviews = await Promise.all(result.items.map(async (review) => {
          try {
            // Get book details for each review
            const book = await BookService.getBookById(review.bookId);
            
            return {
              id: review.id,
              userId: review.userId,
              username: 'User', // We should ideally fetch username from user service
              userAvatar: '',
              rating: review.rating,
              title: book?.title || 'Unknown Book',
              content: review.text,
              date: review.createdAt,
              bookTitle: book?.title || 'Unknown Book',
              bookId: review.bookId,
              upvotes: review.likes?.length || 0,
              downvotes: 0, // Our API doesn't have downvotes
              tags: book?.genres || [],
            };
          } catch (err) {
            console.error('Error processing review:', err);
            return null;
          }
        }));
        
        setReviews(processedReviews.filter(Boolean));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
        setReviews(MOCK_REVIEWS); // Fallback to mock data
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [activeTab]);

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
