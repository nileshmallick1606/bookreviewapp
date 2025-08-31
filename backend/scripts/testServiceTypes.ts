// scripts/testServiceTypes.ts
/**
 * Script to test service type consistency
 * 
 * This script runs our custom tests to verify that services
 * implement the correct interfaces for controller integration.
 */
import { testServiceAdapter } from '../tests/unit/services/serviceAdapter.test';
import { testBookService } from '../tests/unit/services/bookService.test';

console.log('=== Testing Service Types ===');
console.log('This test suite verifies that service implementations');
console.log('match the interfaces expected by controllers.');
console.log();

// Run all tests
try {
  // Test service adapter
  testServiceAdapter();
  console.log();
  
  // Test book service
  testBookService();
  console.log();
  
  console.log('=== All Tests Passed! ===');
  process.exit(0);
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}
