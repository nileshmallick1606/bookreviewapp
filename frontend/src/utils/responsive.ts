import { Theme } from '@mui/material/styles';

/**
 * Get responsive spacing value based on breakpoint
 * @param theme - Material UI theme
 * @param spacingMap - Object mapping breakpoints to spacing values
 * @returns Object with CSS styles for responsive spacing
 */
export const responsiveSpacing = (
  theme: Theme,
  spacingMap: {
    xs?: number | string;
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    base: number | string;
  }
) => {
  const styles: any = {};
  
  // Base style (will be overridden by breakpoint-specific styles)
  styles.padding = typeof spacingMap.base === 'number' 
    ? theme.spacing(spacingMap.base)
    : String(spacingMap.base);
  
  // Add media queries for each breakpoint
  if (spacingMap.xs !== undefined) {
    styles[`${theme.breakpoints.up('xs')}`] = {
      padding: typeof spacingMap.xs === 'number' 
        ? theme.spacing(spacingMap.xs)
        : String(spacingMap.xs)
    };
  }
  
  if (spacingMap.sm !== undefined) {
    styles[`${theme.breakpoints.up('sm')}`] = {
      padding: typeof spacingMap.sm === 'number' 
        ? theme.spacing(spacingMap.sm)
        : String(spacingMap.sm)
    };
  }
  
  if (spacingMap.md !== undefined) {
    styles[`${theme.breakpoints.up('md')}`] = {
      padding: typeof spacingMap.md === 'number' 
        ? theme.spacing(spacingMap.md)
        : String(spacingMap.md)
    };
  }
  
  if (spacingMap.lg !== undefined) {
    styles[`${theme.breakpoints.up('lg')}`] = {
      padding: typeof spacingMap.lg === 'number' 
        ? theme.spacing(spacingMap.lg)
        : String(spacingMap.lg)
    };
  }
  
  if (spacingMap.xl !== undefined) {
    styles[`${theme.breakpoints.up('xl')}`] = {
      padding: typeof spacingMap.xl === 'number' 
        ? theme.spacing(spacingMap.xl)
        : String(spacingMap.xl)
    };
  }
  
  return styles;
};

/**
 * Get responsive font size based on breakpoint
 * @param theme - Material UI theme
 * @param sizeMap - Object mapping breakpoints to font size values
 * @returns Object with CSS styles for responsive font sizes
 */
export const responsiveFontSize = (
  theme: Theme,
  sizeMap: {
    xs?: number | string;
    sm?: number | string;
    md?: number | string;
    lg?: number | string;
    xl?: number | string;
    base: number | string;
  }
) => {
  const styles: any = {};
  
  // Base style (will be overridden by breakpoint-specific styles)
  styles.fontSize = String(sizeMap.base);
  
  // Add media queries for each breakpoint
  if (sizeMap.xs !== undefined) {
    styles[`${theme.breakpoints.up('xs')}`] = {
      fontSize: String(sizeMap.xs)
    };
  }
  
  if (sizeMap.sm !== undefined) {
    styles[`${theme.breakpoints.up('sm')}`] = {
      fontSize: String(sizeMap.sm)
    };
  }
  
  if (sizeMap.md !== undefined) {
    styles[`${theme.breakpoints.up('md')}`] = {
      fontSize: String(sizeMap.md)
    };
  }
  
  if (sizeMap.lg !== undefined) {
    styles[`${theme.breakpoints.up('lg')}`] = {
      fontSize: String(sizeMap.lg)
    };
  }
  
  if (sizeMap.xl !== undefined) {
    styles[`${theme.breakpoints.up('xl')}`] = {
      fontSize: String(sizeMap.xl)
    };
  }
  
  return styles;
};

/**
 * Generate responsive grid values based on breakpoints
 * @param gridMap - Object mapping breakpoints to grid column counts
 * @returns Object with grid template column values for each breakpoint
 */
export const responsiveGrid = (
  gridMap: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    base: number;
  }
) => {
  return {
    gridTemplateColumns: `repeat(${gridMap.base}, 1fr)`,
    ...(gridMap.xs && { 
      '@media (min-width:0px)': {
        gridTemplateColumns: `repeat(${gridMap.xs}, 1fr)`
      }
    }),
    ...(gridMap.sm && { 
      '@media (min-width:600px)': {
        gridTemplateColumns: `repeat(${gridMap.sm}, 1fr)`
      }
    }),
    ...(gridMap.md && { 
      '@media (min-width:960px)': {
        gridTemplateColumns: `repeat(${gridMap.md}, 1fr)`
      }
    }),
    ...(gridMap.lg && { 
      '@media (min-width:1280px)': {
        gridTemplateColumns: `repeat(${gridMap.lg}, 1fr)`
      }
    }),
    ...(gridMap.xl && { 
      '@media (min-width:1920px)': {
        gridTemplateColumns: `repeat(${gridMap.xl}, 1fr)`
      }
    })
  } as any; // Type assertion to avoid TypeScript errors
};

/**
 * Helper to get minimum touch target size for accessibility
 * Ensures elements are at least 44x44px on touch devices
 */
export const touchTargetSize = {
  minWidth: '44px',
  minHeight: '44px',
};

/**
 * Detect if device is touch-capable
 * @returns Boolean indicating if device has touch capability
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Calculate responsive image sizes for srcSet
 * @param baseUrl - Base URL of the image
 * @param widths - Array of image widths to generate
 * @param extension - File extension (default: 'jpg')
 * @returns Object with srcSet and sizes strings for responsive images
 */
export const getResponsiveImageProps = (
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  extension: string = 'jpg'
) => {
  // Generate srcSet string with multiple image sizes
  const srcSet = widths
    .map((width) => `${baseUrl}-${width}.${extension} ${width}w`)
    .join(', ');

  // Generate sizes attribute for responsive images
  const sizes = '(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw';

  return { srcSet, sizes };
};

export default {
  responsiveSpacing,
  responsiveFontSize,
  responsiveGrid,
  touchTargetSize,
  isTouchDevice,
  getResponsiveImageProps
};
