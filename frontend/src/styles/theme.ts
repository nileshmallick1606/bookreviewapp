import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteOptions } from '@mui/material/styles/createPalette';

// Define breakpoints to match our user story requirements (600px, 960px, 1280px, 1920px)
const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};

// Define color palette with accessible contrast ratios
const palette: PaletteOptions = {
  primary: {
    main: '#0070f3', // Primary blue
    light: '#4dabf5',
    dark: '#0051cb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#19857b', // Teal secondary
    light: '#4fb5ac',
    dark: '#00574b',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#f7f7f7',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Define typography scale with responsive considerations
const typography = {
  fontFamily: [
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem', // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (min-width:600px)': {
      fontSize: '3rem', // 48px on larger screens
    },
  },
  h2: {
    fontSize: '2rem', // 32px
    fontWeight: 700,
    lineHeight: 1.2,
    '@media (min-width:600px)': {
      fontSize: '2.25rem', // 36px on larger screens
    },
  },
  h3: {
    fontSize: '1.75rem', // 28px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.5rem', // 24px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h5: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1.125rem', // 18px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1rem', // 16px
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '1rem', // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.57,
  },
  button: {
    fontSize: '0.875rem', // 14px
    fontWeight: 500,
    lineHeight: 1.57,
    textTransform: 'none' as const, // Don't uppercase button text
  },
  caption: {
    fontSize: '0.75rem', // 12px
    fontWeight: 400,
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem', // 12px
    fontWeight: 600,
    lineHeight: 1.66,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
};

// Define spacing and shape configuration
const spacing = 8; // Base spacing unit of 8px

const shape = {
  borderRadius: 8,
};

// Define shadows for different elevations
const shadows = [
  'none',
  '0px 2px 1px -1px rgba(0,0,0,0.1),0px 1px 1px 0px rgba(0,0,0,0.07),0px 1px 3px 0px rgba(0,0,0,0.06)',
  '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.07),0px 1px 5px 0px rgba(0,0,0,0.06)',
  '0px 3px 3px -2px rgba(0,0,0,0.1),0px 3px 4px 0px rgba(0,0,0,0.07),0px 1px 8px 0px rgba(0,0,0,0.06)',
  '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.07),0px 1px 10px 0px rgba(0,0,0,0.06)',
  // Continue with default values for remaining shadows...
];

// Create the base theme
let theme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  shadows: shadows as any,
  components: {
    // Override component styles here
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          minWidth: '64px',
          // Increase touch target for mobile
          '@media (max-width:600px)': {
            padding: '10px 16px',
            minHeight: '44px', // Minimum recommended touch target size
          },
        },
        containedPrimary: {
          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.1),0px 2px 2px 0px rgba(0,0,0,0.07)',
          '&:hover': {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1),0px 4px 5px 0px rgba(0,0,0,0.07)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px',
          '&:last-child': {
            paddingBottom: '16px',
          },
          '@media (min-width:600px)': {
            padding: '24px',
            '&:last-child': {
              paddingBottom: '24px',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '16px',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          // Increase input height on mobile for better touch targets
          '@media (max-width:600px)': {
            minHeight: '24px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          // Increase touch target size on mobile
          '@media (max-width:600px)': {
            paddingTop: '12px',
            paddingBottom: '12px',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Ensure icon buttons are properly sized for touch
          '@media (max-width:600px)': {
            padding: '12px',
          },
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          color: '#0070f3', // Use direct color value instead of palette reference
          textDecorationColor: 'rgba(0, 112, 243, 0.4)',
          '&:hover': {
            textDecorationColor: 'rgba(0, 112, 243, 0.9)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          // Increase height for better touch targets on mobile
          '@media (max-width:600px)': {
            height: '32px',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
        },
      },
    },
    // Focus visible styles for accessibility
    MuiCssBaseline: {
      styleOverrides: {
        '& *:focus-visible': {
          outline: `2px solid #0070f3`, // Use direct color value instead of palette reference
          outlineOffset: '2px',
        },
      },
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

export default theme;
