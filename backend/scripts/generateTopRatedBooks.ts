// Script to generate the top-rated books index
import { updateTopRatedBooksIndex } from '../src/services/book/book.service';

async function generateTopRatedBooksIndex() {
  try {
    console.log('Generating top-rated books index...');
    await updateTopRatedBooksIndex();
    console.log('Top-rated books index generated successfully!');
  } catch (error) {
    console.error('Error generating top-rated books index:', error);
  }
}

generateTopRatedBooksIndex();
