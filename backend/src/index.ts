// src/index.ts
import { startServer } from './app';

// Start the server when this file is executed directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
