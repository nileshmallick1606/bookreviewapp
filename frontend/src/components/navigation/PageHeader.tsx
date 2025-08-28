import React from 'react';
import { 
  Typography, 
  Box, 
  Paper, 
  Button,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Breadcrumbs, { BreadcrumbItem } from './Breadcrumbs';

const HeaderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'flex-start',
  },
}));

const Description = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
  },
}));

export interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  /**
   * The page title
   */
  title: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional breadcrumb items
   */
  breadcrumbs?: BreadcrumbItem[];
  /**
   * Optional action buttons
   */
  actions?: PageAction[];
  /**
   * Whether to show the breadcrumb home link
   */
  showBreadcrumbHome?: boolean;
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Children components to display below the description
   */
  children?: React.ReactNode;
}

/**
 * Responsive page header component with title, description, breadcrumbs, and actions
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  showBreadcrumbHome = true,
  className,
  children,
}) => {
  return (
    <HeaderContainer className={className} elevation={0}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} showHome={showBreadcrumbHome} />
      )}

      <TitleContainer>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 600,
            fontSize: {
              xs: '1.5rem',
              sm: '1.75rem',
              md: '2rem'
            }
          }}
        >
          {title}
        </Typography>

        {actions && actions.length > 0 && (
          <ActionsContainer>
            {actions.map((action, index) => (
              <Button
                key={`action-${index}`}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                startIcon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </ActionsContainer>
        )}
      </TitleContainer>

      {description && (
        <Description variant="body1" color="text.secondary">
          {description}
        </Description>
      )}

      {children && (
        <>
          <Divider sx={{ my: 2 }} />
          {children}
        </>
      )}
    </HeaderContainer>
  );
};

export default PageHeader;
