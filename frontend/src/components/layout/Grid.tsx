import React from 'react';
import { Grid as MuiGrid, GridProps as MuiGridProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Breakpoint } from '@mui/material/styles';

// Extend the MUI Grid props with our custom props
export interface GridProps extends MuiGridProps {
  /**
   * Apply equal spacing between grid items at various breakpoints
   * @example spacing={{ xs: 1, sm: 2, md: 3 }}
   */
  responsiveSpacing?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Container padding at various breakpoints
   * @example padding={{ xs: 1, sm: 2, md: 3 }}
   */
  responsivePadding?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Auto-flow grid template with columns specified for different breakpoints
   * @example columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
   */
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /**
   * Use CSS grid layout instead of flexbox
   */
  useCssGrid?: boolean;
}

// Create a styled Grid component
const StyledGrid = styled(MuiGrid, {
  shouldForwardProp: (prop) =>
    !['responsiveSpacing', 'responsivePadding', 'columns', 'useCssGrid'].includes(
      prop as string
    ),
})<GridProps>(({ theme, responsiveSpacing, responsivePadding, columns, useCssGrid }) => ({
  // Apply responsive spacing
  ...(responsiveSpacing && {
    ...(responsiveSpacing.xs !== undefined && {
      [theme.breakpoints.up('xs')]: {
        gap: theme.spacing(responsiveSpacing.xs),
      },
    }),
    ...(responsiveSpacing.sm !== undefined && {
      [theme.breakpoints.up('sm')]: {
        gap: theme.spacing(responsiveSpacing.sm),
      },
    }),
    ...(responsiveSpacing.md !== undefined && {
      [theme.breakpoints.up('md')]: {
        gap: theme.spacing(responsiveSpacing.md),
      },
    }),
    ...(responsiveSpacing.lg !== undefined && {
      [theme.breakpoints.up('lg')]: {
        gap: theme.spacing(responsiveSpacing.lg),
      },
    }),
    ...(responsiveSpacing.xl !== undefined && {
      [theme.breakpoints.up('xl')]: {
        gap: theme.spacing(responsiveSpacing.xl),
      },
    }),
  }),

  // Apply responsive padding
  ...(responsivePadding && {
    ...(responsivePadding.xs !== undefined && {
      [theme.breakpoints.up('xs')]: {
        padding: theme.spacing(responsivePadding.xs),
      },
    }),
    ...(responsivePadding.sm !== undefined && {
      [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(responsivePadding.sm),
      },
    }),
    ...(responsivePadding.md !== undefined && {
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(responsivePadding.md),
      },
    }),
    ...(responsivePadding.lg !== undefined && {
      [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(responsivePadding.lg),
      },
    }),
    ...(responsivePadding.xl !== undefined && {
      [theme.breakpoints.up('xl')]: {
        padding: theme.spacing(responsivePadding.xl),
      },
    }),
  }),

  // Apply CSS Grid if requested
  ...(useCssGrid && {
    display: 'grid',
    ...(columns && {
      ...(columns.xs !== undefined && {
        [theme.breakpoints.up('xs')]: {
          gridTemplateColumns: `repeat(${columns.xs}, 1fr)`,
        },
      }),
      ...(columns.sm !== undefined && {
        [theme.breakpoints.up('sm')]: {
          gridTemplateColumns: `repeat(${columns.sm}, 1fr)`,
        },
      }),
      ...(columns.md !== undefined && {
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: `repeat(${columns.md}, 1fr)`,
        },
      }),
      ...(columns.lg !== undefined && {
        [theme.breakpoints.up('lg')]: {
          gridTemplateColumns: `repeat(${columns.lg}, 1fr)`,
        },
      }),
      ...(columns.xl !== undefined && {
        [theme.breakpoints.up('xl')]: {
          gridTemplateColumns: `repeat(${columns.xl}, 1fr)`,
        },
      }),
    }),
  }),
}));

/**
 * Enhanced Grid component with responsive spacing and CSS Grid support
 * Extends Material UI Grid with additional responsive features
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      children,
      responsiveSpacing,
      responsivePadding,
      columns,
      useCssGrid,
      container,
      item,
      spacing,
      ...rest
    },
    ref
  ) => {
    // If using CSS Grid, ignore MUI's grid system props
    if (useCssGrid) {
      return (
        <StyledGrid
          ref={ref}
          responsiveSpacing={responsiveSpacing}
          responsivePadding={responsivePadding}
          columns={columns}
          useCssGrid={useCssGrid}
          {...rest}
        >
          {children}
        </StyledGrid>
      );
    }

    // Otherwise use Material UI's grid system
    return (
      <StyledGrid
        ref={ref}
        responsiveSpacing={responsiveSpacing}
        responsivePadding={responsivePadding}
        container={container}
        item={item}
        spacing={spacing}
        {...rest}
      >
        {children}
      </StyledGrid>
    );
  }
);

Grid.displayName = 'Grid';

export default Grid;
