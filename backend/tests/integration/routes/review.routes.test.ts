// tests/integration/routes/review.routes.test.ts
import { setupTestEnvironment, teardownTestEnvironment, getRequest, generateTestToken } from '../setup';
// This properly imports the Jest global functions
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Review Routes', () => {
  let adminToken: string;
  let userToken: string;
  let userId: string = 'test-user-id';
  
  beforeAll(async () => {
    await setupTestEnvironment();
    adminToken = generateTestToken('test-admin-id', 'admin');
    userToken = generateTestToken(userId);
  });
  
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  describe('GET /books/:bookId/reviews', () => {
    it('should return a list of reviews for a book', async () => {
      const response = await getRequest()
        .get('/books/test-book-1/reviews');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should return reviews when book has no reviews yet', async () => {
      // This assumes there's no reviews for test-book-2 yet
      const response = await getRequest()
        .get('/books/test-book-2/reviews');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('POST /books/:bookId/reviews', () => {
    it('should create a new review when authenticated', async () => {
      const newReview = {
        rating: 4,
        text: 'This is a test review for integration testing'
      };
      
      const response = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newReview);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('rating', 4);
      expect(response.body.data).toHaveProperty('text', 'This is a test review for integration testing');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('bookId', 'test-book-1');
    });
    
    it('should return 401 when not authenticated', async () => {
      const newReview = {
        rating: 3,
        text: 'This review should not be created'
      };
      
      const response = await getRequest()
        .post('/books/test-book-1/reviews')
        .send(newReview);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 400 for invalid review data', async () => {
      const invalidReview = {
        rating: 6, // Invalid rating (should be 1-5)
        text: 'This review has invalid data'
      };
      
      const response = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidReview);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('GET /reviews/:reviewId', () => {
    let reviewId: string;
    
    beforeAll(async () => {
      // Create a review to retrieve
      const createResponse = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          text: 'This is a review that will be retrieved by ID'
        });
      
      reviewId = createResponse.body.data.id;
    });
    
    it('should return a single review by ID', async () => {
      const response = await getRequest()
        .get(`/reviews/${reviewId}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('id', reviewId);
      expect(response.body.data).toHaveProperty('rating', 5);
      expect(response.body.data).toHaveProperty('text', 'This is a review that will be retrieved by ID');
    });
    
    it('should return 404 for non-existent review ID', async () => {
      const response = await getRequest()
        .get('/reviews/non-existent-id');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('PUT /reviews/:reviewId', () => {
    let reviewId: string;
    
    beforeAll(async () => {
      // Create a review to update
      const createResponse = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 3,
          text: 'This review will be updated in tests'
        });
      
      reviewId = createResponse.body.data.id;
    });
    
    it('should update a review when authenticated as the review owner', async () => {
      const updateData = {
        rating: 4,
        text: 'This review has been updated'
      };
      
      const response = await getRequest()
        .put(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('rating', 4);
      expect(response.body.data).toHaveProperty('text', 'This review has been updated');
    });
    
    it('should return 401 when not authenticated', async () => {
      const updateData = {
        rating: 2,
        text: 'This update should be rejected'
      };
      
      const response = await getRequest()
        .put(`/reviews/${reviewId}`)
        .send(updateData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 403 when authenticated as another user', async () => {
      // Create a review as user
      const createResponse = await getRequest()
        .post('/books/test-book-2/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 3,
          text: 'This review should not be updated by another user'
        });
      
      const anotherReviewId = createResponse.body.data.id;
      
      // Try to update as admin (not the owner)
      const response = await getRequest()
        .put(`/reviews/${anotherReviewId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 1,
          text: 'This update should fail'
        });
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('DELETE /reviews/:reviewId', () => {
    let reviewId: string;
    let adminReviewId: string;
    
    beforeAll(async () => {
      // Create a review by user to delete
      const createUserResponse = await getRequest()
        .post('/books/test-book-2/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 4,
          text: 'This review will be deleted by the user'
        });
      
      reviewId = createUserResponse.body.data.id;
      
      // Create a review by admin
      const createAdminResponse = await getRequest()
        .post('/books/test-book-2/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 5,
          text: 'This review was created by an admin'
        });
      
      adminReviewId = createAdminResponse.body.data.id;
    });
    
    it('should delete a review when authenticated as the review owner', async () => {
      const response = await getRequest()
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify the review was deleted
      const getResponse = await getRequest()
        .get(`/reviews/${reviewId}`);
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await getRequest()
        .delete(`/reviews/${adminReviewId}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 403 when authenticated as another user', async () => {
      // Try to delete admin's review as regular user
      const response = await getRequest()
        .delete(`/reviews/${adminReviewId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('POST /reviews/:reviewId/like', () => {
    let reviewId: string;
    
    beforeAll(async () => {
      // Create a review by admin that user will like
      const createResponse = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 4,
          text: 'This review will be liked by a user'
        });
      
      reviewId = createResponse.body.data.id;
    });
    
    it('should toggle like on a review when authenticated', async () => {
      const response = await getRequest()
        .post(`/reviews/${reviewId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Toggle like again (unlike)
      const unlikeResponse = await getRequest()
        .post(`/reviews/${reviewId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(unlikeResponse.status).toBe(200);
    });
    
    it('should return 401 when not authenticated', async () => {
      const response = await getRequest()
        .post(`/reviews/${reviewId}/like`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 400 when liking your own review', async () => {
      // Create a review by user
      const createResponse = await getRequest()
        .post('/books/test-book-2/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          text: 'This is my own review that I should not be able to like'
        });
      
      const ownReviewId = createResponse.body.data.id;
      
      // Try to like own review
      const response = await getRequest()
        .post(`/reviews/${ownReviewId}/like`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('POST /reviews/:reviewId/comment', () => {
    let reviewId: string;
    
    beforeAll(async () => {
      // Create a review by admin that user will comment on
      const createResponse = await getRequest()
        .post('/books/test-book-1/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          rating: 3,
          text: 'This review will receive comments'
        });
      
      reviewId = createResponse.body.data.id;
    });
    
    it('should add a comment to a review when authenticated', async () => {
      const commentData = {
        text: 'This is a test comment on a review'
      };
      
      const response = await getRequest()
        .post(`/reviews/${reviewId}/comment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(commentData);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Check that the review now has the comment
      const getResponse = await getRequest()
        .get(`/reviews/${reviewId}`);
      
      expect(getResponse.body.data.comments).toBeDefined();
      expect(getResponse.body.data.comments.length).toBeGreaterThan(0);
      
      // Find the comment we just added
      const addedComment = getResponse.body.data.comments.find(
        (c: any) => c.text === 'This is a test comment on a review'
      );
      
      expect(addedComment).toBeDefined();
      expect(addedComment.userId).toBe(userId);
    });
    
    it('should return 401 when not authenticated', async () => {
      const commentData = {
        text: 'This comment should not be added'
      };
      
      const response = await getRequest()
        .post(`/reviews/${reviewId}/comment`)
        .send(commentData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 400 for invalid comment data', async () => {
      // Empty text
      const invalidComment = {
        text: ''
      };
      
      const response = await getRequest()
        .post(`/reviews/${reviewId}/comment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidComment);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      
      // Too long text (more than 500 chars)
      const tooLongComment = {
        text: 'a'.repeat(501)
      };
      
      const response2 = await getRequest()
        .post(`/reviews/${reviewId}/comment`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(tooLongComment);
      
      expect(response2.status).toBe(400);
      expect(response2.body).toHaveProperty('status', 'error');
    });
  });
});
