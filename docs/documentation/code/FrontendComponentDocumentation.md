# Frontend Component Documentation

This document provides documentation for key frontend components of the BookReview Platform.

## Common Components

### Rating Component

```jsx
/**
 * Star Rating component that displays and optionally allows setting a rating value
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.value - Current rating value (1-5)
 * @param {boolean} [props.readOnly=false] - Whether the rating is interactive or display-only
 * @param {function} [props.onChange] - Callback when rating changes (required if not readOnly)
 * @param {string} [props.size='medium'] - Size of rating stars ('small', 'medium', 'large')
 * @param {string} [props.color='primary'] - Color theme for the stars
 * @returns {JSX.Element} Rendered star rating component
 * 
 * @example
 * // Read-only rating display
 * <Rating value={4.5} readOnly />
 * 
 * // Interactive rating input
 * <Rating value={rating} onChange={(newValue) => setRating(newValue)} />
 */
export const Rating = ({ 
  value, 
  readOnly = false, 
  onChange, 
  size = 'medium', 
  color = 'primary' 
}) => {
  // Component implementation
};
```

### Button Component

```jsx
/**
 * Custom button component with consistent styling across the application
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} [props.variant='contained'] - Button variant ('contained', 'outlined', 'text')
 * @param {string} [props.color='primary'] - Button color theme
 * @param {string} [props.size='medium'] - Button size ('small', 'medium', 'large')
 * @param {boolean} [props.fullWidth=false] - Whether the button should take full width
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {function} props.onClick - Click handler function
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element} Rendered button component
 * 
 * @example
 * <Button 
 *   variant="contained" 
 *   color="primary" 
 *   onClick={handleSubmit}
 *   disabled={isSubmitting}
 * >
 *   Submit
 * </Button>
 */
export const Button = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  size = 'medium',
  fullWidth = false,
  disabled = false,
  onClick,
  className
}) => {
  // Component implementation
};
```

## Layout Components

### PageContainer Component

```jsx
/**
 * Standard page container with consistent padding and max width
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {boolean} [props.narrow=false] - Whether to use a narrower max width
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element} Rendered page container component
 * 
 * @example
 * <PageContainer>
 *   <h1>Page Title</h1>
 *   <p>Page content goes here</p>
 * </PageContainer>
 */
export const PageContainer = ({ children, narrow = false, className }) => {
  // Component implementation
};
```

### AppBar Component

```jsx
/**
 * Application header bar with navigation and user menu
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.isLoggedIn=false] - Whether a user is logged in
 * @param {Object} [props.user=null] - User object for the logged in user
 * @param {function} [props.onLogout] - Logout handler function
 * @returns {JSX.Element} Rendered app bar component
 * 
 * @example
 * <AppBar 
 *   isLoggedIn={!!currentUser} 
 *   user={currentUser}
 *   onLogout={handleLogout}
 * />
 */
export const AppBar = ({ isLoggedIn = false, user = null, onLogout }) => {
  // Component implementation
};
```

## Book Components

### BookCard Component

```jsx
/**
 * Card component that displays book information in a grid or list view
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.book - Book object with book details
 * @param {string} props.book.id - Unique book identifier
 * @param {string} props.book.title - Book title
 * @param {string} props.book.author - Book author
 * @param {string} props.book.coverImage - URL to book cover image
 * @param {number} props.book.averageRating - Average rating value (0-5)
 * @param {number} props.book.reviewCount - Number of reviews
 * @param {string} [props.view='grid'] - Display mode ('grid' or 'list')
 * @param {function} [props.onClick] - Click handler function
 * @returns {JSX.Element} Rendered book card component
 * 
 * @example
 * <BookCard 
 *   book={{
 *     id: '123',
 *     title: 'Book Title',
 *     author: 'Author Name',
 *     coverImage: '/images/cover.jpg',
 *     averageRating: 4.5,
 *     reviewCount: 42
 *   }}
 *   onClick={() => router.push(`/books/${book.id}`)}
 * />
 */
export const BookCard = ({ book, view = 'grid', onClick }) => {
  // Component implementation
};
```

### BookDetail Component

```jsx
/**
 * Detailed book information display with all book metadata
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.book - Complete book object with all details
 * @param {boolean} [props.loading=false] - Whether book data is loading
 * @param {boolean} [props.isEditable=false] - Whether edit options should be shown (for admins)
 * @param {function} [props.onEdit] - Edit handler function
 * @returns {JSX.Element} Rendered book detail component
 * 
 * @example
 * <BookDetail 
 *   book={bookData}
 *   loading={isLoading}
 *   isEditable={userIsAdmin} 
 *   onEdit={() => router.push(`/admin/books/edit/${bookData.id}`)}
 * />
 */
export const BookDetail = ({ book, loading = false, isEditable = false, onEdit }) => {
  // Component implementation
};
```

## Review Components

### ReviewForm Component

```jsx
/**
 * Form for creating and editing book reviews
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.bookId - ID of the book being reviewed
 * @param {Object} [props.initialData=null] - Existing review data when editing
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} [props.onCancel] - Cancel handler function
 * @param {boolean} [props.submitting=false] - Whether form is currently submitting
 * @returns {JSX.Element} Rendered review form component
 * 
 * @example
 * <ReviewForm 
 *   bookId="123"
 *   onSubmit={handleSubmitReview}
 *   onCancel={() => setShowReviewForm(false)}
 *   submitting={isSubmitting}
 * />
 */
export const ReviewForm = ({ 
  bookId, 
  initialData = null, 
  onSubmit, 
  onCancel, 
  submitting = false 
}) => {
  // Component implementation
};
```

### ReviewList Component

```jsx
/**
 * Displays a paginated list of reviews for a book
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Array of review objects
 * @param {number} props.total - Total number of reviews
 * @param {number} props.page - Current page number
 * @param {number} props.pageSize - Number of reviews per page
 * @param {function} props.onPageChange - Page change handler
 * @param {string} [props.userId] - Current user ID to highlight their reviews
 * @returns {JSX.Element} Rendered review list component
 * 
 * @example
 * <ReviewList 
 *   reviews={bookReviews}
 *   total={totalReviews}
 *   page={currentPage}
 *   pageSize={10}
 *   onPageChange={handlePageChange}
 *   userId={currentUser?.id}
 * />
 */
export const ReviewList = ({ 
  reviews, 
  total, 
  page, 
  pageSize, 
  onPageChange, 
  userId 
}) => {
  // Component implementation
};
```

## User Profile Components

### ProfileHeader Component

```jsx
/**
 * User profile header with user information and actions
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with profile information
 * @param {boolean} [props.isOwnProfile=false] - Whether this is the current user's profile
 * @param {function} [props.onEdit] - Edit profile handler
 * @returns {JSX.Element} Rendered profile header component
 * 
 * @example
 * <ProfileHeader 
 *   user={userData}
 *   isOwnProfile={userData.id === currentUser.id}
 *   onEdit={() => router.push('/profile/edit')}
 * />
 */
export const ProfileHeader = ({ user, isOwnProfile = false, onEdit }) => {
  // Component implementation
};
```

### FavoriteBooksList Component

```jsx
/**
 * Displays and manages a user's favorite books list
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.books - Array of book objects
 * @param {boolean} [props.isEditable=false] - Whether user can modify the list
 * @param {function} [props.onRemove] - Handler for removing a book from favorites
 * @returns {JSX.Element} Rendered favorite books component
 * 
 * @example
 * <FavoriteBooksList 
 *   books={favoriteBooks}
 *   isEditable={isOwnProfile}
 *   onRemove={handleRemoveFromFavorites}
 * />
 */
export const FavoriteBooksList = ({ books, isEditable = false, onRemove }) => {
  // Component implementation
};
```

## Authentication Components

### LoginForm Component

```jsx
/**
 * User login form with email/password and social login options
 * 
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onSocialLogin - Social login handler
 * @param {boolean} [props.loading=false] - Whether form is submitting
 * @param {string} [props.error=null] - Error message to display
 * @returns {JSX.Element} Rendered login form component
 * 
 * @example
 * <LoginForm 
 *   onSubmit={handleLoginSubmit}
 *   onSocialLogin={handleSocialLogin}
 *   loading={isLoading}
 *   error={loginError}
 * />
 */
export const LoginForm = ({ onSubmit, onSocialLogin, loading = false, error = null }) => {
  // Component implementation
};
```

### RegistrationForm Component

```jsx
/**
 * New user registration form
 * 
 * @component
 * @param {Object} props - Component props
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onSocialSignup - Social signup handler
 * @param {boolean} [props.loading=false] - Whether form is submitting
 * @param {string} [props.error=null] - Error message to display
 * @returns {JSX.Element} Rendered registration form component
 * 
 * @example
 * <RegistrationForm 
 *   onSubmit={handleRegistrationSubmit}
 *   onSocialSignup={handleSocialSignup}
 *   loading={isLoading}
 *   error={registrationError}
 * />
 */
export const RegistrationForm = ({ 
  onSubmit, 
  onSocialSignup, 
  loading = false, 
  error = null 
}) => {
  // Component implementation
};
```

## Recommendations Components

### RecommendationCarousel Component

```jsx
/**
 * Horizontal scrolling carousel for book recommendations
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.books - Array of recommended book objects
 * @param {string} props.title - Section title
 * @param {boolean} [props.loading=false] - Whether recommendations are loading
 * @param {function} [props.onRefresh] - Handler for refreshing recommendations
 * @returns {JSX.Element} Rendered recommendation carousel component
 * 
 * @example
 * <RecommendationCarousel 
 *   books={recommendedBooks}
 *   title="Books You Might Like"
 *   loading={isLoading}
 *   onRefresh={handleRefreshRecommendations}
 * />
 */
export const RecommendationCarousel = ({ books, title, loading = false, onRefresh }) => {
  // Component implementation
};
```

## Custom Hooks

```jsx
/**
 * Hook for managing pagination state and logic
 * 
 * @hook
 * @param {Object} options - Hook options
 * @param {number} [options.initialPage=1] - Initial page number
 * @param {number} [options.pageSize=10] - Number of items per page
 * @param {number} options.totalItems - Total number of items
 * @returns {Object} Pagination state and handlers
 * @returns {number} returns.page - Current page number
 * @returns {number} returns.pageSize - Items per page
 * @returns {number} returns.totalPages - Total number of pages
 * @returns {function} returns.goToPage - Function to navigate to specific page
 * @returns {function} returns.nextPage - Function to navigate to next page
 * @returns {function} returns.prevPage - Function to navigate to previous page
 * 
 * @example
 * const { 
 *   page, 
 *   pageSize, 
 *   totalPages,
 *   goToPage,
 *   nextPage,
 *   prevPage
 * } = usePagination({ 
 *   initialPage: 1, 
 *   pageSize: 20, 
 *   totalItems: 100 
 * });
 */
export const usePagination = ({ initialPage = 1, pageSize = 10, totalItems }) => {
  // Hook implementation
};
```
