import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { errorResponse, HttpStatus } from '../config/apiStandards';

/**
 * Middleware factory that processes validation results from express-validator
 * If validation fails, it returns a standardized error response with validation details
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().reduce((acc: Record<string, string>, error: any) => {
      acc[error.path] = error.msg;
      return acc;
    }, {});
    
    // Return error response with validation details
    return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json(
      errorResponse(
        HttpStatus.UNPROCESSABLE_ENTITY,
        'Validation failed',
        formattedErrors
      )
    );
  };
};
