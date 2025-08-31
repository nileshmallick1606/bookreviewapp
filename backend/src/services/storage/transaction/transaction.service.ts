/**
 * Transaction Service
 * 
 * Manages atomic operations across multiple files.
 * Provides transaction-like guarantees with rollback capabilities.
 */
import { FileStorageManager } from '../fileStorageManager';

export interface TransactionOperation {
  type: 'write' | 'delete';
  filePath: string;
  data?: any;
  backup?: string;
}

export interface TransactionContext {
  id: string;
  operations: TransactionOperation[];
  startTime: Date;
}

export class TransactionService {
  private fileManager: FileStorageManager;
  
  /**
   * Constructor
   * @param fileManager File storage manager instance
   */
  constructor(fileManager: FileStorageManager) {
    this.fileManager = fileManager;
  }
  
  /**
   * Begin a new transaction
   * @returns Transaction context
   */
  beginTransaction(): TransactionContext {
    return {
      id: Math.random().toString(36).substring(2, 15),
      operations: [],
      startTime: new Date()
    };
  }
  
  /**
   * Add a write operation to the transaction
   * @param context Transaction context
   * @param filePath Path to file to write
   * @param data Data to write
   */
  async addWrite<T>(context: TransactionContext, filePath: string, data: T): Promise<void> {
    // Create backup of the file if it exists
    const backup = await this.fileManager.createBackup(filePath);
    
    context.operations.push({
      type: 'write',
      filePath,
      data,
      backup: backup || undefined
    });
  }
  
  /**
   * Add a delete operation to the transaction
   * @param context Transaction context
   * @param filePath Path to file to delete
   */
  async addDelete(context: TransactionContext, filePath: string): Promise<void> {
    // Create backup of the file if it exists
    const backup = await this.fileManager.createBackup(filePath);
    
    context.operations.push({
      type: 'delete',
      filePath,
      backup: backup || undefined
    });
  }
  
  /**
   * Commit the transaction
   * @param context Transaction context
   */
  async commit(context: TransactionContext): Promise<void> {
    try {
      // Execute all operations
      for (const operation of context.operations) {
        if (operation.type === 'write') {
          await this.fileManager.writeJsonFile(operation.filePath, operation.data);
        } else if (operation.type === 'delete') {
          await this.fileManager.deleteFile(operation.filePath);
        }
      }
      
      // Clean up backups after successful commit
      await this.cleanupBackups(context);
      
    } catch (error) {
      // If any operation fails, roll back the transaction
      console.error(`Transaction ${context.id} failed: ${error}`);
      await this.rollback(context);
      throw new Error(`Transaction failed: ${error}`);
    }
  }
  
  /**
   * Roll back the transaction
   * @param context Transaction context
   */
  async rollback(context: TransactionContext): Promise<void> {
    console.log(`Rolling back transaction ${context.id}`);
    
    // Restore from backups in reverse order
    for (let i = context.operations.length - 1; i >= 0; i--) {
      const operation = context.operations[i];
      
      if (operation.backup) {
        // Restore from backup
        await this.fileManager.restoreFromBackup(operation.backup, operation.filePath);
      } else if (operation.type === 'write') {
        // No backup means the file didn't exist before, so delete it
        await this.fileManager.deleteFile(operation.filePath);
      }
      // For delete operations without backup, nothing needs to be done
    }
  }
  
  /**
   * Clean up backup files after successful commit
   * @param context Transaction context
   */
  private async cleanupBackups(context: TransactionContext): Promise<void> {
    for (const operation of context.operations) {
      if (operation.backup) {
        try {
          await this.fileManager.deleteFile(operation.backup);
        } catch (error) {
          console.error(`Error cleaning up backup ${operation.backup}: ${error}`);
          // Continue cleanup even if one fails
        }
      }
    }
  }
}
