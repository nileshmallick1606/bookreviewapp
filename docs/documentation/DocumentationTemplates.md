# Documentation Templates

This file contains templates for documenting different code components in the BookReview Platform.

## JavaScript/TypeScript File Template

```javascript
/**
 * @fileoverview [Brief description of what this file does]
 * @author [Your Name] <[your.email@example.com]>
 * @created [YYYY-MM-DD]
 * @modified [YYYY-MM-DD]
 */

// Imports go here

/**
 * [Brief description of the class/component/function]
 * 
 * [More detailed description if needed]
 * 
 * @class [if it's a class]
 * @component [if it's a React component]
 */
```

## React Component Template

```javascript
/**
 * [Component name] - [Brief description]
 * 
 * [More detailed description of the component's purpose and functionality]
 * 
 * @component
 * @example
 * return (
 *   <ComponentName 
 *     prop1="value1"
 *     prop2="value2"
 *   />
 * )
 */
export const ComponentName = ({ prop1, prop2, ...props }) => {
  // Component implementation
};

ComponentName.propTypes = {
  /**
   * [Description of what this prop is for]
   */
  prop1: PropTypes.string.isRequired,
  
  /**
   * [Description of what this prop is for]
   * @default "defaultValue"
   */
  prop2: PropTypes.string
};

export default ComponentName;
```

## Service Class Template

```javascript
/**
 * [ServiceName] - [Brief description]
 * 
 * [More detailed description of the service's purpose and functionality]
 * 
 * @class
 */
class ServiceName {
  /**
   * Create an instance of [ServiceName]
   * 
   * @param {Object} options - Configuration options
   * @param {String} options.someOption - Description of option
   */
  constructor(options) {
    // Implementation
  }
  
  /**
   * [Brief description of what the method does]
   * 
   * @async [if the method is async]
   * @param {Type} paramName - Description of parameter
   * @returns {Promise<ReturnType>} Description of the return value
   * @throws {ErrorType} Description of when this error is thrown
   * @example
   * // Example usage
   * const result = await service.methodName(param);
   */
  async methodName(paramName) {
    // Implementation
  }
}

export default ServiceName;
```

## API Controller Template

```javascript
/**
 * [ControllerName] - Controller for [resource/entity] operations
 * 
 * @module controllers/[controllerName]
 */

/**
 * Get all [resources]
 * 
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @api {get} /api/v1/[resources] Get all [resources]
 * @apiName GetAll[Resources]
 * @apiGroup [ResourceGroup]
 * @apiSuccess {Object[]} data Array of [resource] objects
 * @apiError {Object} error Error information
 */
export const getAll = async (req, res, next) => {
  // Implementation
};

/**
 * Get a single [resource] by ID
 * 
 * @async
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * 
 * @api {get} /api/v1/[resources]/:id Get [resource] by ID
 * @apiName Get[Resource]
 * @apiGroup [ResourceGroup]
 * @apiParam {String} id [Resource] unique ID
 * @apiSuccess {Object} data [Resource] object
 * @apiError {Object} error Error information
 */
export const getById = async (req, res, next) => {
  // Implementation
};
```

## Model Template

```javascript
/**
 * [ModelName] model definition
 * 
 * [Description of what this model represents in the system]
 * 
 * @module models/[modelName]
 */

/**
 * [ModelName] schema definition
 * 
 * @typedef {Object} [ModelName]
 * @property {string} id - Unique identifier
 * @property {string} name - Name of the [model]
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Creates a new [ModelName]
 * 
 * @param {Object} data - The [model] data
 * @returns {[ModelName]} The created [model]
 */
export const create = (data) => {
  // Implementation
};

/**
 * Finds a [ModelName] by ID
 * 
 * @param {string} id - The [model] ID to find
 * @returns {[ModelName]|null} The found [model] or null if not found
 */
export const findById = (id) => {
  // Implementation
};
```

## Utility Function Template

```javascript
/**
 * [Brief description of what the utility function does]
 * 
 * @function
 * @param {Type} param1 - Description of first parameter
 * @param {Type} param2 - Description of second parameter
 * @returns {ReturnType} Description of the return value
 * @example
 * // Example usage
 * const result = utilityFunction(value1, value2);
 */
export const utilityFunction = (param1, param2) => {
  // Implementation
};
```

## Redux Action Creator Template

```javascript
/**
 * [Action description]
 * 
 * @function
 * @param {Type} payload - Description of the action payload
 * @returns {Object} Redux action object
 */
export const actionCreator = (payload) => ({
  type: ACTION_TYPE,
  payload,
});

/**
 * Async [action description]
 * 
 * @function
 * @param {Type} params - Parameters for the async action
 * @returns {Function} Thunk function that accepts dispatch
 */
export const asyncActionCreator = (params) => async (dispatch) => {
  try {
    // Implementation
    dispatch(actionCreator(result));
  } catch (error) {
    // Error handling
  }
};
```

## Redux Reducer Template

```javascript
/**
 * [State slice name] reducer
 * 
 * @module reducers/[reducerName]
 */

/**
 * @typedef {Object} StateType
 * @property {boolean} loading - Indicates if a request is in progress
 * @property {Object|null} data - The state data
 * @property {string|null} error - Error message if any
 */

/** @type {StateType} */
const initialState = {
  loading: false,
  data: null,
  error: null,
};

/**
 * Reducer for [state slice]
 * 
 * @param {StateType} state - Current state
 * @param {Object} action - Redux action
 * @param {string} action.type - Action type
 * @param {*} action.payload - Action payload
 * @returns {StateType} New state
 */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    // Cases
    default:
      return state;
  }
}
```

## Custom Hook Template

```javascript
/**
 * [HookName] - [Brief description]
 * 
 * [More detailed description of what the hook does and when to use it]
 * 
 * @hook
 * @param {Type} param - Description of parameter
 * @returns {Object} Description of return value
 * @example
 * const { data, loading, error } = useHookName(param);
 */
export const useHookName = (param) => {
  // Implementation
  
  return {
    // Return values
  };
};
```

## Middleware Template

```javascript
/**
 * [MiddlewareName] - [Brief description]
 * 
 * [More detailed description of what the middleware does]
 * 
 * @middleware
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Express.NextFunction} next - Express next middleware function
 * @returns {void}
 */
export const middlewareName = (req, res, next) => {
  // Implementation
  next();
};
```

## Route Template

```javascript
/**
 * [ResourceName] routes
 * 
 * @module routes/[resourceName]
 */

import { Router } from 'express';
import * as controller from '../controllers/[controllerName]';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * @route GET /api/v1/[resources]
 * @group [ResourceGroup] - Operations about [resources]
 * @returns {Object} 200 - Success response with array of [resources]
 * @returns {Error} default - Unexpected error
 * @security JWT
 */
router.get('/', authMiddleware, controller.getAll);

/**
 * @route GET /api/v1/[resources]/:id
 * @group [ResourceGroup] - Operations about [resources]
 * @param {string} id.path.required - [Resource] ID
 * @returns {Object} 200 - Success response with [resource] object
 * @returns {Error} 404 - [Resource] not found
 * @returns {Error} default - Unexpected error
 * @security JWT
 */
router.get('/:id', authMiddleware, controller.getById);

export default router;
```
