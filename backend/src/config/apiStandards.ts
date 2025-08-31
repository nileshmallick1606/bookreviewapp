/**
 * API Standards for BookReview Platform
 * 
 * This file defines the API standards and conventions to be used throughout the project.
 */

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  error: ApiError | null;
  meta?: {
    pagination?: PaginationMeta;
  };
}

/**
 * API error format
 */
export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, any>;
}

/**
 * Pagination metadata format
 */
export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string; // Format: "field:direction" (e.g., "createdAt:desc")
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationQuery {
  search?: string;
  fields?: string; // Comma-separated list of fields to include
}

/**
 * HTTP Status Codes used in the API
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Creates a success response
 * 
 * @param data - The data to include in the response
 * @param meta - Optional metadata (e.g., pagination)
 * @returns A standardized success response object
 */
export const successResponse = <T>(data: T, meta?: { pagination?: PaginationMeta }): ApiResponse<T> => ({
  status: 'success',
  data,
  error: null,
  meta,
});

/**
 * Creates an error response
 * 
 * @param code - HTTP status code
 * @param message - Error message
 * @param details - Optional error details
 * @returns A standardized error response object
 */
export const errorResponse = (
  code: number,
  message: string,
  details?: Record<string, any>
): ApiResponse<null> => ({
  status: 'error',
  data: null,
  error: {
    code,
    message,
    details,
  },
});

/**
 * Creates pagination metadata
 * 
 * @param currentPage - Current page number
 * @param pageSize - Items per page
 * @param totalItems - Total number of items
 * @returns Pagination metadata object
 */
export const createPaginationMeta = (
  currentPage: number,
  pageSize: number,
  totalItems: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / pageSize);
  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
