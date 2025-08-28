import { useTheme, useMediaQuery } from '@mui/material';
import { Breakpoint } from '@mui/material/styles';

/**
 * Hook to check if the current viewport is above or below a specific breakpoint
 */
export const useResponsive = () => {
  const theme = useTheme();

  return {
    /**
     * Check if viewport is up to (inclusive) specified breakpoint
     * @param breakpoint - The breakpoint to check against (xs, sm, md, lg, xl)
     * @returns True if viewport width is less than or equal to breakpoint
     */
    isDown: (breakpoint: Breakpoint) => useMediaQuery(theme.breakpoints.down(breakpoint)),

    /**
     * Check if viewport is at least (inclusive) specified breakpoint
     * @param breakpoint - The breakpoint to check against (xs, sm, md, lg, xl)
     * @returns True if viewport width is greater than or equal to breakpoint
     */
    isUp: (breakpoint: Breakpoint) => useMediaQuery(theme.breakpoints.up(breakpoint)),

    /**
     * Check if viewport is exactly at specified breakpoint
     * @param breakpoint - The breakpoint to check against (xs, sm, md, lg, xl)
     * @returns True if viewport width matches exactly the specified breakpoint range
     */
    isOnly: (breakpoint: Breakpoint) => useMediaQuery(theme.breakpoints.only(breakpoint)),

    /**
     * Check if viewport is between start and end breakpoints
     * @param start - The starting breakpoint (inclusive)
     * @param end - The ending breakpoint (inclusive)
     * @returns True if viewport width is within the specified range
     */
    isBetween: (start: Breakpoint, end: Breakpoint) => 
      useMediaQuery(theme.breakpoints.between(start, end)),

    /**
     * Get current breakpoint value
     * @returns Current breakpoint as string ('xs', 'sm', 'md', 'lg', or 'xl')
     */
    current: (): Breakpoint => {
      const isXs = useMediaQuery(theme.breakpoints.only('xs'));
      const isSm = useMediaQuery(theme.breakpoints.only('sm'));
      const isMd = useMediaQuery(theme.breakpoints.only('md'));
      const isLg = useMediaQuery(theme.breakpoints.only('lg'));
      
      if (isXs) return 'xs';
      if (isSm) return 'sm';
      if (isMd) return 'md';
      if (isLg) return 'lg';
      return 'xl';
    },

    /**
     * Check if the device is likely to be touch-enabled
     * @returns True if device is likely touch-enabled
     */
    isTouch: () => {
      // This is a simplified check. In a production app, consider using a more robust detection
      return useMediaQuery('(hover: none) and (pointer: coarse)');
    },

    /**
     * Check if device is in portrait orientation
     * @returns True if device is in portrait orientation
     */
    isPortrait: () => useMediaQuery('(orientation: portrait)'),

    /**
     * Check if device is in landscape orientation
     * @returns True if device is in landscape orientation
     */
    isLandscape: () => useMediaQuery('(orientation: landscape)'),
  };
};

/**
 * Get responsive value based on current breakpoint
 * @param values - Object with breakpoint values
 * @returns The value for the current breakpoint
 */
export const useBreakpointValue = <T,>(values: { 
  xs?: T; 
  sm?: T; 
  md?: T; 
  lg?: T; 
  xl?: T; 
  base: T;
}): T => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));

  if (isXl && values.xl !== undefined) return values.xl;
  if (isLg && values.lg !== undefined) return values.lg;
  if (isMd && values.md !== undefined) return values.md;
  if (isSm && values.sm !== undefined) return values.sm;
  if (isXs && values.xs !== undefined) return values.xs;
  
  return values.base;
};

export default useResponsive;
