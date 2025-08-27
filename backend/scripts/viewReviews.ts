// scripts/viewReviews.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Review } from '../src/models/review/review.model';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

const REVIEWS_DIR = path.join(__dirname, '../data/reviews');
const BOOKS_DIR = path.join(__dirname, '../data/books');
const USERS_DIR = path.join(__dirname, '../data/users');

// Helper function to get user name
async function getUserName(userId: string): Promise<string> {
  try {
    const userPath = path.join(USERS_DIR, `${userId}.json`);
    const userData = JSON.parse(await readFile(userPath, 'utf8'));
    return userData.name || 'Unknown User';
  } catch (err) {
    return 'Unknown User';
  }
}

// Helper function to get book title
async function getBookTitle(bookId: string): Promise<string> {
  try {
    const bookPath = path.join(BOOKS_DIR, `${bookId}.json`);
    const bookData = JSON.parse(await readFile(bookPath, 'utf8'));
    return bookData.title || 'Unknown Book';
  } catch (err) {
    return 'Unknown Book';
  }
}

// List all reviews
async function listAllReviews(): Promise<void> {
  try {
    console.log('\n===== ALL REVIEWS =====');
    const files = await readdir(REVIEWS_DIR);
    const reviewFiles = files.filter(file => file.endsWith('.json'));
    
    if (reviewFiles.length === 0) {
      console.log('No reviews found.');
      return;
    }
    
    console.log(`Found ${reviewFiles.length} reviews.\n`);
    
    for (const file of reviewFiles) {
      const reviewPath = path.join(REVIEWS_DIR, file);
      const reviewData = JSON.parse(await readFile(reviewPath, 'utf8')) as Review;
      
      const userName = await getUserName(reviewData.userId);
      const bookTitle = await getBookTitle(reviewData.bookId);
      
      console.log(`Review ID: ${reviewData.id}`);
      console.log(`Book: ${bookTitle} (${reviewData.bookId})`);
      console.log(`User: ${userName} (${reviewData.userId})`);
      console.log(`Rating: ${'★'.repeat(reviewData.rating)}${'☆'.repeat(5 - reviewData.rating)} (${reviewData.rating}/5)`);
      console.log(`Date: ${new Date(reviewData.createdAt).toLocaleDateString()}`);
      console.log(`Text: ${reviewData.text}`);
      console.log(`Images: ${reviewData.imageUrls?.length || 0}`);
      console.log(`Likes: ${reviewData.likes.length}`);
      console.log(`Comments: ${reviewData.comments.length}`);
      console.log('-------------------------------------------\n');
    }
  } catch (err) {
    console.error('Error listing reviews:', err);
  }
}

// List reviews for a specific book
async function listBookReviews(bookId: string): Promise<void> {
  try {
    let bookTitle = await getBookTitle(bookId);
    console.log(`\n===== REVIEWS FOR BOOK: ${bookTitle} =====`);
    
    const files = await readdir(REVIEWS_DIR);
    const reviewFiles = files.filter(file => file.endsWith('.json'));
    
    let bookReviews = [];
    
    for (const file of reviewFiles) {
      const reviewPath = path.join(REVIEWS_DIR, file);
      const reviewData = JSON.parse(await readFile(reviewPath, 'utf8')) as Review;
      
      if (reviewData.bookId === bookId) {
        bookReviews.push(reviewData);
      }
    }
    
    if (bookReviews.length === 0) {
      console.log(`No reviews found for book ID: ${bookId}`);
      return;
    }
    
    console.log(`Found ${bookReviews.length} reviews.\n`);
    
    for (const review of bookReviews) {
      const userName = await getUserName(review.userId);
      
      console.log(`Review ID: ${review.id}`);
      console.log(`User: ${userName} (${review.userId})`);
      console.log(`Rating: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} (${review.rating}/5)`);
      console.log(`Date: ${new Date(review.createdAt).toLocaleDateString()}`);
      console.log(`Text: ${review.text}`);
      console.log(`Images: ${review.imageUrls?.length || 0}`);
      console.log(`Likes: ${review.likes.length}`);
      console.log(`Comments: ${review.comments.length}`);
      console.log('-------------------------------------------\n');
    }
  } catch (err) {
    console.error('Error listing book reviews:', err);
  }
}

// Main function
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  
  if (!command || command === 'all') {
    await listAllReviews();
  } else if (command === 'book' && args[1]) {
    await listBookReviews(args[1]);
  } else {
    console.log('Usage:');
    console.log('  npm run view-reviews -- all        # List all reviews');
    console.log('  npm run view-reviews -- book <id>  # List reviews for a specific book');
  }
}

// Run the script
main().catch(console.error);
