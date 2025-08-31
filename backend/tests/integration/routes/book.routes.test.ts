// tests/integration/routes/book.routes.test.ts
import { setupTestEnvironment, teardownTestEnvironment, getRequest, generateTestToken } from '../setup';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Book Routes', () => {
  let adminToken: string;
  let userToken: string;
  
  beforeAll(async () => {
    await setupTestEnvironment();
    adminToken = generateTestToken('test-admin-id', 'admin');
    userToken = generateTestToken('test-user-id', 'user');
  });
  
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  describe('GET /api/v1/books', () => {
    it('should return a list of books with pagination', async () => {
      const response = await getRequest()
        .get('/api/v1/books')
        .query({ page: 1, limit: 10 });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('books');
      expect(Array.isArray(response.body.data.books)).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('totalItems');
      expect(response.body.data.pagination).toHaveProperty('totalPages');
      expect(response.body.data.pagination).toHaveProperty('currentPage');
      expect(response.body.data.pagination).toHaveProperty('itemsPerPage');
    });
    
    it('should filter books by search query', async () => {
      const response = await getRequest()
        .get('/api/v1/books')
        .query({ search: 'Test Book 1' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.books.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.books[0]).toHaveProperty('title', 'Test Book 1');
    });
    
    it('should sort books by specified field', async () => {
      const response = await getRequest()
        .get('/api/v1/books')
        .query({ 
          sortBy: 'title',
          sortOrder: 'desc'
        });
      
      expect(response.status).toBe(200);
      const books = response.body.data.books;
      
      // Check if books are sorted in descending order by title
      for (let i = 0; i < books.length - 1; i++) {
        expect(books[i].title >= books[i+1].title).toBe(true);
      }
    });
  });
  
  describe('GET /api/v1/books/:id', () => {
    it('should return a single book by ID', async () => {
      const response = await getRequest()
        .get('/api/v1/books/test-book-1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('book');
      expect(response.body.data.book).toHaveProperty('id', 'test-book-1');
      expect(response.body.data.book).toHaveProperty('title', 'Test Book 1');
      expect(response.body.data.book).toHaveProperty('author', 'Test Author 1');
    });
    
    it('should return 404 for non-existent book ID', async () => {
      const response = await getRequest()
        .get('/api/v1/books/non-existent-id');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/books', () => {
    it('should create a new book when authenticated as admin', async () => {
      const newBook = {
        title: 'New Test Book',
        author: 'New Test Author',
        description: 'Description for the new test book',
        genres: ['Fiction', 'Fantasy'],
        coverImage: 'new-test-cover.jpg'
      };
      
      const response = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newBook);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('book');
      expect(response.body.data.book).toHaveProperty('title', 'New Test Book');
      expect(response.body.data.book).toHaveProperty('author', 'New Test Author');
      expect(response.body.data.book).toHaveProperty('id');
      
      // Save book ID for later tests
      const bookId = response.body.data.book.id;
      
      // Verify the book was created
      const getResponse = await getRequest()
        .get(`/api/v1/books/${bookId}`);
      
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.data.book).toHaveProperty('title', 'New Test Book');
    });
    
    it('should return 401 when not authenticated', async () => {
      const newBook = {
        title: 'Unauthorized Book',
        author: 'Unauthorized Author',
        description: 'This book should not be created',
        genres: ['Fiction']
      };
      
      const response = await getRequest()
        .post('/api/v1/books')
        .send(newBook);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 403 when authenticated as regular user', async () => {
      const newBook = {
        title: 'Forbidden Book',
        author: 'Forbidden Author',
        description: 'This book should not be created',
        genres: ['Fiction']
      };
      
      const response = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newBook);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('PUT /api/v1/books/:id', () => {
    let bookIdToUpdate: string;
    
    beforeAll(async () => {
      // Create a book to update
      const createResponse = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Book to Update',
          author: 'Author to Update',
          description: 'This book will be updated in tests',
          genres: ['Fiction', 'Drama']
        });
      
      bookIdToUpdate = createResponse.body.data.book.id;
    });
    
    it('should update a book when authenticated as admin', async () => {
      const updateData = {
        title: 'Updated Book Title',
        description: 'This book has been updated'
      };
      
      const response = await getRequest()
        .put(`/api/v1/books/${bookIdToUpdate}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('book');
      expect(response.body.data.book).toHaveProperty('title', 'Updated Book Title');
      expect(response.body.data.book).toHaveProperty('description', 'This book has been updated');
      expect(response.body.data.book).toHaveProperty('author', 'Author to Update');
    });
    
    it('should return 401 when not authenticated', async () => {
      const updateData = {
        title: 'Unauthorized Update'
      };
      
      const response = await getRequest()
        .put(`/api/v1/books/${bookIdToUpdate}`)
        .send(updateData);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 403 when authenticated as regular user', async () => {
      const updateData = {
        title: 'Forbidden Update'
      };
      
      const response = await getRequest()
        .put(`/api/v1/books/${bookIdToUpdate}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
  
  describe('DELETE /api/v1/books/:id', () => {
    let bookIdToDelete: string;
    
    beforeAll(async () => {
      // Create a book to delete
      const createResponse = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Book to Delete',
          author: 'Author to Delete',
          description: 'This book will be deleted in tests',
          genres: ['Fiction', 'Mystery']
        });
      
      bookIdToDelete = createResponse.body.data.book.id;
    });
    
    it('should delete a book when authenticated as admin', async () => {
      const response = await getRequest()
        .delete(`/api/v1/books/${bookIdToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      
      // Verify the book was deleted
      const getResponse = await getRequest()
        .get(`/api/v1/books/${bookIdToDelete}`);
      
      expect(getResponse.status).toBe(404);
    });
    
    it('should return 401 when not authenticated', async () => {
      // Create another book
      const createResponse = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Another Book to Delete',
          author: 'Another Author',
          description: 'This book should not be deleted by unauthorized request',
          genres: ['Fiction']
        });
      
      const bookId = createResponse.body.data.book.id;
      
      const response = await getRequest()
        .delete(`/api/v1/books/${bookId}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
    });
    
    it('should return 403 when authenticated as regular user', async () => {
      // Create another book
      const createResponse = await getRequest()
        .post('/api/v1/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Book for Forbidden Delete',
          author: 'Forbidden Author',
          description: 'This book should not be deleted by a regular user',
          genres: ['Fiction']
        });
      
      const bookId = createResponse.body.data.book.id;
      
      const response = await getRequest()
        .delete(`/api/v1/books/${bookId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('status', 'error');
    });
  });
});
