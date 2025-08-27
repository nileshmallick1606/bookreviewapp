import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileExists } from '../utils/file';

const readFile = promisify(fs.readFile);

const TOP_RATED_BOOKS_PATH = path.join(process.cwd(), 'data', 'indexes', 'topRatedBooks.json');

/**
 * Get top-rated books
 */
export const getTopRatedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Check if the index file exists
    if (!(await fileExists(TOP_RATED_BOOKS_PATH))) {
      res.status(200).json({
        status: 'success',
        data: {
          books: []
        }
      });
      return;
    }
    
    // Read the top-rated books index
    const indexData = await readFile(TOP_RATED_BOOKS_PATH, 'utf-8');
    const topRatedBooks = JSON.parse(indexData);
    
    // Limit the number of results
    const limitedBooks = topRatedBooks.slice(0, limit);
    
    res.status(200).json({
      status: 'success',
      data: {
        books: limitedBooks
      }
    });
  } catch (error) {
    console.error('Error fetching top-rated books:', error);
    res.status(500).json({
      status: 'error',
      error: {
        code: 500,
        message: 'Failed to fetch top-rated books'
      }
    });
  }
};
