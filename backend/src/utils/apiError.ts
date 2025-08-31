// src/utils/apiError.ts
/**
 * Custom API Error class that extends the native Error class
 * with additional properties for API error handling.
 */
export class ApiError extends Error {
  code: number;
  data?: any;
  
  /**
   * Creates an ApiError instance
   * 
   * @param message The error message
   * @param code The HTTP status code (defaults to 500)
   * @param data Additional error data (optional)
   */
  constructor(message: string, code: number = 500, data?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.data = data;
    
    // This is needed because we're extending a built-in class
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Convert the error to a plain object suitable for response
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.data ? { details: this.data } : {}),
    };
  }

  /**
   * Factory method for creating a BadRequest (400) error
   */
  static badRequest(message: string = 'Bad request', data?: any): ApiError {
    return new ApiError(message, 400, data);
  }

  /**
   * Factory method for creating an Unauthorized (401) error
   */
  static unauthorized(message: string = 'Unauthorized', data?: any): ApiError {
    return new ApiError(message, 401, data);
  }

  /**
   * Factory method for creating a Forbidden (403) error
   */
  static forbidden(message: string = 'Forbidden', data?: any): ApiError {
    return new ApiError(message, 403, data);
  }

  /**
   * Factory method for creating a NotFound (404) error
   */
  static notFound(message: string = 'Resource not found', data?: any): ApiError {
    return new ApiError(message, 404, data);
  }

  /**
   * Factory method for creating a Conflict (409) error
   */
  static conflict(message: string = 'Resource conflict', data?: any): ApiError {
    return new ApiError(message, 409, data);
  }

  /**
   * Factory method for creating an InternalServer (500) error
   */
  static internal(message: string = 'Internal server error', data?: any): ApiError {
    return new ApiError(message, 500, data);
  }

  /**
   * Factory method for creating a ValidationError (400) with validation details
   */
  static validation(errors: any[]): ApiError {
    return new ApiError('Validation failed', 400, { errors });
  }
}
