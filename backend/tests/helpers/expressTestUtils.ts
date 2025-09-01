/**
 * Request and response mocking utilities for Express
 * Provides mock Express request and response objects for controller testing
 */

import { Request, Response } from 'express';
import {jest} from '@jest/globals';

// Extended request interface to include file upload properties and user
interface ExtendedRequest extends Request {
  file?: any;
  files?: any;
  user?: any;
}

/**
 * Create a mock Express request object
 */
export const createMockRequest = (options: {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  cookies?: any;
  user?: any;
  file?: any;
  files?: any;
} = {}): Partial<ExtendedRequest> => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    user: options.user || undefined,
    file: options.file || undefined,
    files: options.files || undefined,
    get: jest.fn((name: string) => {
      return options.headers?.[name];
    }),
  };
};

/**
 * Create a mock Express response object with Jest spies
 */
export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  
  // Add Jest spy functions for common response methods
  res.status = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['status']>;
  res.json = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['json']>;
  res.send = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['send']>;
  res.cookie = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['cookie']>;
  res.clearCookie = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['clearCookie']>;
  res.sendStatus = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['sendStatus']>;
  res.redirect = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['redirect']>;
  res.end = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['end']>;
  res.set = jest.fn().mockReturnValue(res) as jest.MockedFunction<Response['set']>;
  
  return res;
};

/**
 * Create a mock Express next function with Jest spy
 */
export const createMockNext = (): jest.Mock => {
  return jest.fn();
};
