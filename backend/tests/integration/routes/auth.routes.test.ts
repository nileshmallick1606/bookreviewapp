// tests/integration/routes/auth.routes.test.ts
import { setupTestEnvironment, teardownTestEnvironment, getRequest, generateTestToken } from '../setup';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });
  
  afterAll(async () => {
    await teardownTestEnvironment();
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'newuser@example.com');
      expect(response.body.data.user).toHaveProperty('name', 'New User');
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data).toHaveProperty('token');
    });
    
    it('should return 400 for missing required fields', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/register')
        .send({
          email: 'incomplete@example.com',
          name: 'Incomplete User'
          // Missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('error');
    });
    
    it('should return 409 for duplicate email', async () => {
      // First register a user
      await getRequest()
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          name: 'Duplicate User',
          password: 'password123'
        });
      
      // Try to register again with the same email
      const response = await getRequest()
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          name: 'Another User',
          password: 'anotherpassword'
        });
      
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('already exists');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    beforeAll(async () => {
      // Ensure we have a user to login
      await getRequest()
        .post('/api/v1/auth/register')
        .send({
          email: 'logintest@example.com',
          name: 'Login Test User',
          password: 'password123'
        });
    });
    
    it('should login successfully with valid credentials', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('email', 'logintest@example.com');
      expect(response.body.data).toHaveProperty('token');
      
      // Check for HTTP-only cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArray.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
    });
    
    it('should return 401 for invalid password', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
    
    it('should return 404 for non-existent user', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/auth/refresh-token', () => {
    let refreshToken: string;
    
    beforeAll(async () => {
      // Login to get a refresh token
      const loginResponse = await getRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123'
        });
      
      // Extract refresh token from cookie
      const cookies = loginResponse.headers['set-cookie'];
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const refreshCookie = cookieArray.find((cookie: string) => cookie.includes('refreshToken'));
      refreshToken = refreshCookie.split(';')[0].split('=')[1];
    });
    
    it('should refresh token successfully with valid refresh token', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('token');
      
      // Check for new HTTP-only cookie
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArray.some((cookie: string) => cookie.includes('refreshToken'))).toBe(true);
    });
    
    it('should return 401 for missing refresh token', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/refresh-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
    
    it('should return 401 for invalid refresh token', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/refresh-token')
        .set('Cookie', 'refreshToken=invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
  });
  
  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;
    
    beforeAll(async () => {
      // Login to get tokens
      const loginResponse = await getRequest()
        .post('/api/v1/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.token;
    });
    
    it('should logout successfully with valid token', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.data).toHaveProperty('message');
      
      // Check that refresh token cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArray.some((cookie: string) => 
        cookie.includes('refreshToken') && cookie.includes('Max-Age=0')
      )).toBe(true);
    });
    
    it('should return 401 for missing token', async () => {
      const response = await getRequest()
        .post('/api/v1/auth/logout');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.error).toHaveProperty('message');
    });
  });
});
