// src/components/common/withAuth.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';

/**
 * Higher-order component to protect routes that require authentication
 * @param WrappedComponent The component that requires authentication
 * @returns A wrapped component with authentication check
 */
export const withAuth = <P extends {}>(WrappedComponent: NextPage<P>) => {
  const WithAuth: NextPage<P> = (props: P) => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, loading } = useAppSelector(state => state.auth);
    
    useEffect(() => {
      const checkAuth = async () => {
        try {
          // Try to fetch current user data
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Only redirect if we get a 401 error
          const typedError = error as any;
          if (typedError?.error?.code === 401) {
            router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
          }
        }
      };
      
      // Only check auth if not already authenticated
      if (!isAuthenticated && !loading) {
        checkAuth();
      }
    }, [dispatch, isAuthenticated, loading, router]);
    
    // Show nothing while checking authentication
    if (loading || !isAuthenticated) {
      return null;
    }
    
    // Return the original component if authenticated
    return <WrappedComponent {...props} />;
  };
  
  return WithAuth;
};

export default withAuth;
