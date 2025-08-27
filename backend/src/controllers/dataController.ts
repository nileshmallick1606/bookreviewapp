/**
 * Controller for data management operations
 */
import { Request, Response } from 'express';
import { execFile } from 'child_process';
import path from 'path';

export class DataController {
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
