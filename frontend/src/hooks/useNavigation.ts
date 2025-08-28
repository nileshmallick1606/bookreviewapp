import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook for navigation-related functionality
 * Helps determine active routes and provides navigation helpers
 */
const useNavigation = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  /**
   * Check if the current route matches or starts with a given path
   * @param path - The path to check against
   * @param exact - Whether to match exactly or just check if path is parent
   * @returns boolean indicating if path is active
   */
  const isActive = useCallback(
    (path: string, exact: boolean = false): boolean => {
      if (exact) {
        return currentPath === path;
      }
      return currentPath === path || currentPath.startsWith(`${path}/`);
    },
    [currentPath]
  );

  /**
   * Navigate to a specific route
   * @param path - The path to navigate to
   * @param options - Next.js router options
   */
  const navigateTo = useCallback(
    (path: string, options?: { shallow?: boolean; scroll?: boolean }) => {
      router.push(path, undefined, options);
    },
    [router]
  );

  /**
   * A map of main navigation routes with their active status
   */
  const mainRoutes = useMemo(
    () => [
      { name: 'Home', path: '/', active: isActive('/', true) },
      { name: 'Books', path: '/books', active: isActive('/books') },
      { name: 'Reviews', path: '/reviews', active: isActive('/reviews') },
      { name: 'Recommendations', path: '/recommendations', active: isActive('/recommendations') },
    ],
    [isActive]
  );

  /**
   * A map of user-specific routes with their active status
   */
  const userRoutes = useMemo(
    () => [
      { name: 'Profile', path: '/profile', active: isActive('/profile') },
      { name: 'My Reviews', path: '/my-reviews', active: isActive('/my-reviews') },
      { name: 'My Favorites', path: '/my-favorites', active: isActive('/my-favorites') },
    ],
    [isActive]
  );

  return {
    currentPath,
    isActive,
    navigateTo,
    mainRoutes,
    userRoutes,
  };
};

export default useNavigation;
