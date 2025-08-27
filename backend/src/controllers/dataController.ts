/**
 * Controller for data management operations
 */
import { Request, Response } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export class DataController {
  /**
   * Check data directories and permissions
   * @param req Express request object
   * @param res Express response object
   */
  static async checkDataDirectories(req: Request, res: Response): Promise<void> {
    try {
      const DIRS = [
        path.join(process.cwd(), 'data'),
        path.join(process.cwd(), 'data', 'books'),
        path.join(process.cwd(), 'data', 'reviews'),
        path.join(process.cwd(), 'data', 'indexes'),
        path.join(process.cwd(), 'data', 'indexes', 'reviewsByBook'),
        path.join(process.cwd(), 'data', 'indexes', 'reviewsByUser'),
        path.join(process.cwd(), 'uploads')
      ];
      
      const results = DIRS.map(dir => {
        // Check if directory exists
        const exists = fs.existsSync(dir);
        
        let writable = false;
        let contents = [];
        
        // Check if directory is writable and get contents if it exists
        if (exists) {
          try {
            const testFile = path.join(dir, '.test-write-permission');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
            writable = true;
            
            contents = fs.readdirSync(dir);
          } catch (err) {
            writable = false;
          }
        } else {
          // Try to create the directory if it doesn't exist
          try {
            fs.mkdirSync(dir, { recursive: true });
            writable = true;
          } catch (err) {
            console.error(`Failed to create directory: ${dir}`, err);
          }
        }
        
        return {
          path: dir,
          exists: fs.existsSync(dir),
          writable,
          contentsCount: exists ? contents.length : 0
        };
      });
      
      res.status(200).json({
        status: 'success',
        data: results,
        error: null
      });
    } catch (error) {
      console.error('Error checking data directories:', error);
      res.status(500).json({
        status: 'error',
        error: { code: 500, message: 'Failed to check data directories' },
        data: null
      });
    }
  }
  
  /**
   * Generate sample book data
   * @param req Express request object
   * @param res Express response object
   */
  static async generateBooks(req: Request, res: Response): Promise<void> {
    try {
      const count = parseInt(req.query.count as string, 10) || 100;
      
      if (count < 1 || count > 500) {
        res.status(400).json({
          status: 'error',
          error: {
            code: 400,
            message: 'Book count must be between 1 and 500'
          }
        });
        return;
      }
      
      // Path to the script
      const scriptPath = path.resolve(__dirname, '../../scripts/generateBooks.js');
      
      // Execute the script as a child process
      execFile('node', [scriptPath, count.toString()], (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing script: ${error.message}`);
          res.status(500).json({
            status: 'error',
            error: {
              code: 500,
              message: 'Failed to generate book data'
            }
          });
          return;
        }
        
        if (stderr) {
          console.error(`Script error: ${stderr}`);
        }
        
        console.log(`Script output: ${stdout}`);
        res.status(200).json({
          status: 'success',
          data: {
            message: `Successfully generated ${count} books`,
            count
          }
        });
      });
    } catch (error) {
      console.error('Error in generate books:', error);
      res.status(500).json({
        status: 'error',
        error: {
          code: 500,
          message: 'Internal server error'
        }
      });
    }
  }
}
