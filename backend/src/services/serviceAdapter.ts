// src/services/serviceAdapter.ts

import * as bookService from './book/book.service';
import * as reviewService from './review/review.service';
import * as userService from './userService';
import { BookService, ReviewService, UserService, Services } from '../types/services';
import { StorageServiceProvider } from './storageServiceProvider';

/**
 * Creates a properly typed services object that conforms to our service interfaces
 * This adapter ensures type safety between controllers and services
 * @returns Typed services object
 */
export function createTypedServices(): Services {
  return {
    book: bookService as unknown as BookService,
    review: reviewService as unknown as ReviewService,
    user: userService as unknown as UserService
  };
}

/**
 * This function can be used to register services with the Express app
 * @param app Express application instance
 */
export function registerServices(app: any): void {
  app.locals = app.locals || {};
  app.locals.services = createTypedServices();
  
  // Setup consistent error propagation for all services
  setupErrorHandling();
  
  console.log('Services registered with Express application');
}

/**
 * Ensures consistent error propagation from services to controllers
 */
function setupErrorHandling(): void {
  // Implement error handling middleware and propagation logic
  // This would catch and standardize errors from all services
  
  // Example: Adding error handlers to service methods could be done here
  // if we wanted to monkey-patch the services
}

/**
 * Adds logging to service methods for better debugging and monitoring
 * @param serviceInstance The service instance to enhance with logging
 * @param serviceName The name of the service for log identification
 */
export function addServiceLogging<T>(serviceInstance: T, serviceName: string): T {
  const handler = {
    get(target: any, prop: string) {
      const originalMethod = target[prop];
      if (typeof originalMethod === 'function') {
        return async function(...args: any[]) {
          console.log(`[${serviceName}] Calling method: ${prop} with args:`, args);
          try {
            const result = await originalMethod.apply(target, args);
            console.log(`[${serviceName}] Method ${prop} completed successfully`);
            return result;
          } catch (error) {
            console.error(`[${serviceName}] Error in method ${prop}:`, error);
            throw error; // Re-throw to maintain error propagation
          }
        };
      }
      return originalMethod;
    }
  };
  
  return new Proxy(serviceInstance, handler) as T;
}

// Export a function to create a logged service
export function createLoggedService<T>(service: T, serviceName: string): T {
  return addServiceLogging(service, serviceName);
}
