// tests/unit/services/serviceAdapter.test.ts
/**
 * Test suite for serviceAdapter
 * 
 * This file contains tests for the service adapter that ensures
 * type consistency between controllers and services
 */
import { createTypedServices, addServiceLogging } from '../../../src/services/serviceAdapter';
import { BookService, ReviewService, UserService } from '../../../src/types/services';

/**
 * Test function to verify the service adapter works correctly
 */
export function testServiceAdapter() {
  console.log('Running serviceAdapter tests...');
  
  // Test createTypedServices
  testCreateTypedServices();
  
  // Test addServiceLogging
  testAddServiceLogging();
  
  console.log('All serviceAdapter tests passed!');
}

/**
 * Test that createTypedServices returns an object with the expected services and methods
 */
function testCreateTypedServices() {
  const services = createTypedServices();
  
  // Check that services object has required properties
  if (!services.book) throw new Error('Book service not found');
  if (!services.review) throw new Error('Review service not found');
  if (!services.user) throw new Error('User service not found');
  
  // Check book service methods
  const bookService = services.book;
  if (typeof bookService.getBookById !== 'function') throw new Error('getBookById method not found');
  if (typeof bookService.searchBooks !== 'function') throw new Error('searchBooks method not found');
  if (typeof bookService.getSuggestions !== 'function') throw new Error('getSuggestions method not found');
  if (typeof bookService.updateAverageRating !== 'function') throw new Error('updateAverageRating method not found');
  
  console.log('✓ createTypedServices returns correctly structured services object');
}

/**
 * Test that addServiceLogging correctly adds logging to service methods
 */
async function testAddServiceLogging() {
  // Create mock service
  const mockService = {
    someMethod: async (...args: any[]) => {
      // Check if args match expected
      if (args[0] !== 'arg1' || args[1] !== 'arg2') {
        throw new Error('Arguments not passed correctly');
      }
      return 'result';
    },
    anotherMethod: async () => {
      throw new Error('test error');
    }
  };
  
  // Track log calls
  let logCalls: string[] = [];
  let errorCalls: string[] = [];
  
  // Save original console methods
  const originalLog = console.log;
  const originalError = console.error;
  
  // Override console methods to track calls
  console.log = (...args: any[]) => {
    logCalls.push(args.join(' '));
  };
  
  console.error = (...args: any[]) => {
    errorCalls.push(args.join(' '));
  };
  
  try {
    // Add logging to service
    const loggedService = addServiceLogging(mockService, 'TestService');
    
    // Call successful method
    const result = await loggedService.someMethod('arg1', 'arg2');
    
    // Check result
    if (result !== 'result') throw new Error(`Expected 'result' but got '${result}'`);
    
    // Check logs
    if (!logCalls.some(log => log.includes('[TestService] Calling method: someMethod'))) {
      throw new Error('Missing log for method call');
    }
    
    if (!logCalls.some(log => log.includes('[TestService] Method someMethod completed successfully'))) {
      throw new Error('Missing log for method completion');
    }
    
    // Call method that throws error
    try {
      await loggedService.anotherMethod();
      throw new Error('Expected error not thrown');
    } catch (error) {
      // Expected error - check error log
      if (!errorCalls.some(log => log.includes('[TestService] Error in method anotherMethod'))) {
        throw new Error('Missing error log for failed method');
      }
    }
    
    console.log('✓ addServiceLogging correctly adds logging to service methods');
  } finally {
    // Restore original console methods
    console.log = originalLog;
    console.error = originalError;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testServiceAdapter();
}
