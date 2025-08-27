import { updateTopRatedBooksIndex } from '../src/services/book/book.service';

/**
 * Script to manually update the top-rated books index
 */
const updateIndex = async () => {
  console.log('Updating top-rated books index...');
  try {
    await updateTopRatedBooksIndex();
    console.log('Top-rated books index updated successfully!');
  } catch (error) {
    console.error('Error updating top-rated books index:', error);
  }
};

updateIndex();
