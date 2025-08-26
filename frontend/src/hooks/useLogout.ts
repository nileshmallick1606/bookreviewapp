// src/hooks/useLogout.ts
import { useRouter } from 'next/router';
import { useAppDispatch } from './reduxHooks';
import { logout as logoutAction } from '../store/slices/authSlice';
import { logout as logoutService } from '../services/authService';

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call logout API endpoint to clear the cookie
      await logoutService();
      
      // Update Redux state
      dispatch(logoutAction());
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { handleLogout };
};

export default useLogout;
