import 'dotenv/config';
import { OpenAIService } from '../src/services/ai/openai.service';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const BOOKS_DIR = path.join(process.cwd(), 'data', 'books');
const USERS_DIR = path.join(process.cwd(), 'data', 'users');
const REVIEWS_DIR = path.join(process.cwd(), 'data', 'reviews');
const FAVORITES_DIR = path.join(process.cwd(), 'data', 'favorites');

/**
 * Test script to verify OpenAI integration for book recommendations
 */
const testOpenAIRecommendations = async () => {
  try {
    console.log('Testing OpenAI recommendations integration...');
    
    // 1. Initialize OpenAI service
    const openaiService = new OpenAIService();
    
    // 2. Check if OpenAI is available
    if (!openaiService.isAvailable()) {
      console.error('OpenAI API is not configured. Please set OPENAI_API_KEY in your .env file.');
      return;
    }
    
    console.log('OpenAI API is configured correctly.');
    
    // 3. Load sample data
    
    // Load a sample user
    const userFiles = await readdir(USERS_DIR);
    if (userFiles.length === 0) {
      console.error('No users found. Please create at least one user account.');
      return;
    }
    
    const sampleUserFile = userFiles[0];
    const sampleUserData = await readFile(path.join(USERS_DIR, sampleUserFile), 'utf-8');
    const sampleUser = JSON.parse(sampleUserData);
    
    console.log(`Selected sample user: ${sampleUser.username} (${sampleUser.id})`);
    
    // Load all books
    const bookFiles = await readdir(BOOKS_DIR);
    const books = [];
    
    for (const file of bookFiles.slice(0, 100)) { // Limit to 100 books for testing
      if (file.endsWith('.json')) {
        const bookData = await readFile(path.join(BOOKS_DIR, file), 'utf-8');
        books.push(JSON.parse(bookData));
      }
    }
    
    console.log(`Loaded ${books.length} books for testing`);
    
    // Load reviews by the sample user
    const reviews = [];
    const reviewFiles = await readdir(REVIEWS_DIR);
    
    for (const file of reviewFiles) {
      if (file.endsWith('.json')) {
        const reviewData = await readFile(path.join(REVIEWS_DIR, file), 'utf-8');
        const review = JSON.parse(reviewData);
        
        if (review.userId === sampleUser.id) {
          reviews.push(review);
        }
      }
    }
    
    console.log(`Found ${reviews.length} reviews by the sample user`);
    
    // Load favorites by the sample user
    let favorites = [];
    const favoritesPath = path.join(FAVORITES_DIR, `${sampleUser.id}.json`);
    
    if (fs.existsSync(favoritesPath)) {
      const favoritesData = await readFile(favoritesPath, 'utf-8');
      const favoriteIds = JSON.parse(favoritesData);
      
      favorites = books.filter(book => favoriteIds.includes(book.id));
    }
    
    console.log(`Found ${favorites.length} favorite books for the sample user`);
    
    // 4. Call OpenAI for recommendations
    console.log('Requesting AI-powered recommendations...');
    const startTime = Date.now();
    
    const recommendations = await openaiService.getPersonalizedRecommendations(
      sampleUser,
      reviews,
      favorites,
      books,
      5
    );
    
    const duration = Date.now() - startTime;
    
    console.log(`Received ${recommendations.length} recommendations in ${duration}ms`);
    console.log('Recommended books:');
    
    // 5. Display results
    recommendations.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} by ${book.author}`);
    });
    
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Error during OpenAI integration test:', error);
  }
};

// Run the test
testOpenAIRecommendations().catch(console.error);
