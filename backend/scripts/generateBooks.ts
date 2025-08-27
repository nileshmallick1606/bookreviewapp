/**
 * Book data generator
 * 
 * This script generates 100 books with realistic data and saves them to the data/books directory.
 * Run this script to populate the initial book data for the application.
 */

import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Book } from '../src/models/interfaces/book.interface';

// Path to book data directory
const BOOKS_DIR = path.join(__dirname, '../data/books');

// Available genres for book categorization
const GENRES = [
  'Fiction',
  'Non-fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Biography',
  'Self-help',
  'Business',
  'Technology',
  'Science',
  'Philosophy',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Young Adult',
  'Children'
];

// Sample author names
const AUTHORS = [
  'Jane Austen',
  'George Orwell',
  'J.K. Rowling',
  'Stephen King',
  'Agatha Christie',
  'Ernest Hemingway',
  'Mark Twain',
  'Virginia Woolf',
  'F. Scott Fitzgerald',
  'Toni Morrison',
  'Gabriel Garcia Marquez',
  'Haruki Murakami',
  'Neil Gaiman',
  'Maya Angelou',
  'J.R.R. Tolkien',
  'Philip K. Dick',
  'Isaac Asimov',
  'Margaret Atwood',
  'Leo Tolstoy',
  'Fyodor Dostoevsky'
];

// Book title templates
const TITLE_PREFIXES = [
  'The', 'A', 'Beyond', 'Under', 'Secret', 'Last', 'First', 'Lost',
  'Hidden', 'Forgotten', 'Eternal', 'Ancient', 'Modern', 'Dark'
];

const TITLE_SUBJECTS = [
  'City', 'Mountain', 'Garden', 'Forest', 'River', 'Island', 'Kingdom',
  'War', 'Peace', 'Love', 'Dream', 'Memory', 'Shadow', 'Light', 'Star',
  'Secret', 'Story', 'Chronicle', 'Legend', 'Myth', 'Tale', 'Path',
  'Journey', 'Adventure', 'Mystery', 'History', 'Future', 'Past'
];

const TITLE_SUFFIXES = [
  'of Time', 'of Destiny', 'of Shadows', 'of Light', 'of Dreams',
  'of Eternity', 'of the Ages', 'of the Universe', 'of the Mind',
  'Reborn', 'Forgotten', 'Remembered', 'Untold', 'Revealed', 'Discovered'
];

// Cover image URLs
const PLACEHOLDER_COVER_IMAGES = [
  'https://placeholder.pics/svg/300x400/DEDEDE/555555/Book%20Cover',
  'https://placeholder.pics/svg/300x400/5EA1D2/FFFFFF/Book%20Cover',
  'https://placeholder.pics/svg/300x400/ED4264/FFFFFF/Book%20Cover',
  'https://placeholder.pics/svg/300x400/4CAF50/FFFFFF/Book%20Cover',
  'https://placeholder.pics/svg/300x400/FFC107/333333/Book%20Cover',
  'https://placeholder.pics/svg/300x400/9C27B0/FFFFFF/Book%20Cover'
];

/**
 * Generate a random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select random element from array
 */
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Select random elements from array
 */
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Generate a random book title
 */
function generateTitle(): string {
  // Various patterns for title generation
  const patterns = [
    () => `${getRandomElement(TITLE_PREFIXES)} ${getRandomElement(TITLE_SUBJECTS)}`,
    () => `${getRandomElement(TITLE_PREFIXES)} ${getRandomElement(TITLE_SUBJECTS)} ${getRandomElement(TITLE_SUFFIXES)}`,
    () => `${getRandomElement(TITLE_SUBJECTS)} ${getRandomElement(TITLE_SUFFIXES)}`,
    () => `${getRandomElement(TITLE_SUBJECTS)} and ${getRandomElement(TITLE_SUBJECTS)}`
  ];

  return getRandomElement(patterns)();
}

/**
 * Generate a random book description
 */
function generateDescription(): string {
  const paragraphs = getRandomInt(2, 4);
  const description: string[] = [];

  for (let i = 0; i < paragraphs; i++) {
    const sentences = getRandomInt(3, 8);
    const paragraph: string[] = [];

    for (let j = 0; j < sentences; j++) {
      const sentenceLength = getRandomInt(10, 25);
      const words: string[] = [];

      for (let k = 0; k < sentenceLength; k++) {
        const wordLength = getRandomInt(3, 12);
        words.push('lorem'.substring(0, wordLength));
      }

      paragraph.push(words.join(' ') + '.');
    }

    description.push(paragraph.join(' '));
  }

  return description.join('\n\n');
}

/**
 * Generate a random book
 */
function generateBook(): Book {
  const id = uuidv4();
  const now = new Date();
  const publishedYear = getRandomInt(1900, now.getFullYear());
  
  return {
    id,
    title: generateTitle(),
    author: getRandomElement(AUTHORS),
    description: generateDescription(),
    coverImage: getRandomElement(PLACEHOLDER_COVER_IMAGES),
    genres: getRandomElements(GENRES, getRandomInt(1, 4)),
    publishedYear,
    createdAt: now,
    updatedAt: now,
    averageRating: Math.round(Math.random() * 5 * 10) / 10, // Random rating between 0 and 5, with 1 decimal point
    reviewCount: getRandomInt(0, 100)
  };
}

/**
 * Generate and save books
 */
async function generateBooks(count: number): Promise<void> {
  try {
    // Ensure books directory exists
    if (!fs.existsSync(BOOKS_DIR)) {
      fs.mkdirSync(BOOKS_DIR, { recursive: true });
    }
    
    console.log(`Generating ${count} books...`);
    
    // Generate books
    for (let i = 0; i < count; i++) {
      const book = generateBook();
      const filePath = path.join(BOOKS_DIR, `${book.id}.json`);
      
      // Write to file
      await fs.promises.writeFile(filePath, JSON.stringify(book, null, 2));
      
      // Log progress
      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${count} books`);
      }
    }
    
    console.log(`Successfully generated ${count} books!`);
    console.log(`Books saved to ${BOOKS_DIR}`);
  } catch (error) {
    console.error('Error generating books:', error);
  }
}

// Get book count from command line arguments, default to 100
const BOOK_COUNT = process.argv.length > 2 
  ? parseInt(process.argv[2], 10) 
  : 100;

// Validate count
if (isNaN(BOOK_COUNT) || BOOK_COUNT < 1) {
  console.error('Invalid book count. Using default of 100.');
  generateBooks(100);
} else {
  generateBooks(BOOK_COUNT);
}
