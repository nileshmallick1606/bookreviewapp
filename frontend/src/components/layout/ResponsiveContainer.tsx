import React from 'react';
import { Container, Box, ContainerProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Define responsive max-width variants beyond Material UI defaults
export type ContainerMaxWidthOption = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
export type MaxWidthOption = ContainerMaxWidthOption | 'full';

interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  maxWidth?: MaxWidthOption;
  padded?: boolean;
  narrow?: boolean;
  centered?: boolean;
}

// Create a styled Container component with custom maxWidth options
const StyledContainer = styled(Container, {
  shouldForwardProp: (prop) => 
    !['padded', 'narrow', 'centered'].includes(prop as string),
})<ResponsiveContainerProps>(({ theme, padded, narrow, centered }) => ({
  width: '100%',
  ...(narrow && {
    [theme.breakpoints.up('md')]: {
      maxWidth: theme.breakpoints.values.md - 160, // Narrower than default on larger screens
    },
  }),
  ...(padded && {
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4),
    },
  }),
  ...(centered && {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),
}));

/**
 * A responsive container component that adapts to different screen sizes
 * Extends Material UI Container with additional features
 */
const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ children, maxWidth = 'lg', padded = false, narrow = false, centered = false, ...rest }, ref) => {
    // For 'full' width, use the Box component without max-width constraint
    if (maxWidth === 'full') {
      return (
        <Box
          ref={ref}
          sx={{
            width: '100%',
            px: padded ? { xs: 2, sm: 3, md: 4 } : 0,
            ...(centered && {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }),
          }}
          {...rest}
        >
          {children}
        </Box>
      );
    }

    return (
      <StyledContainer
        ref={ref}
        maxWidth={maxWidth as ContainerMaxWidthOption} // Type assertion for TypeScript
        padded={padded}
        narrow={narrow}
        centered={centered}
        {...rest}
      >
        {children}
      </StyledContainer>
    );
  }
);

ResponsiveContainer.displayName = 'ResponsiveContainer';

export default ResponsiveContainer;
