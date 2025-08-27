import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
});

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/image as a function that returns a standard img
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return {
      type: 'img',
      props: {
        ...props,
        alt: props.alt || '',
      }
    };
  },
}));
