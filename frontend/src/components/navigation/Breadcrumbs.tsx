import React from 'react';
import { 
  Breadcrumbs as MuiBreadcrumbs, 
  Typography, 
  Box, 
  Link as MuiLink 
} from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { styled } from '@mui/material/styles';

interface BreadcrumbsLinkProps {
  href: string;
  label: string;
  icon?: React.ReactNode;
  isLast?: boolean;
}

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 0),
    '& .MuiBreadcrumbs-ol': {
      flexWrap: 'nowrap',
      overflowX: 'auto',
      scrollbarWidth: 'none', // Firefox
      '&::-webkit-scrollbar': { // Webkit browsers
        display: 'none'
      }
    }
  },
}));

const BreadcrumbsLink = ({ href, label, icon, isLast = false }: BreadcrumbsLinkProps) => {
  const content = (
    <>
      {icon && <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>{icon}</Box>}
      <Typography 
        variant="body2" 
        color={isLast ? 'text.primary' : 'inherit'}
        sx={{ 
          fontWeight: isLast ? 500 : 400,
          display: 'flex',
          alignItems: 'center' 
        }}
      >
        {label}
      </Typography>
    </>
  );

  if (isLast) {
    return <Box sx={{ display: 'flex', alignItems: 'center' }}>{content}</Box>;
  }

  return (
    <Link href={href} passHref legacyBehavior>
      <MuiLink 
        underline="hover" 
        color="inherit"
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          '&:hover': {
            color: 'primary.main',
          }
        }}
      >
        {content}
      </MuiLink>
    </Link>
  );
};

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  /**
   * Array of breadcrumb items to display
   */
  items: BreadcrumbItem[];
  /**
   * Whether to show the home icon at the start
   */
  showHome?: boolean;
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Responsive breadcrumbs navigation component
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  showHome = true,
  className 
}) => {
  const allItems = showHome 
    ? [{ label: 'Home', href: '/', icon: <HomeIcon fontSize="small" /> }, ...items]
    : items;

  return (
    <BreadcrumbsContainer className={className}>
      <MuiBreadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
      >
        {allItems.map((item, index) => (
          <BreadcrumbsLink 
            key={`${item.href}-${index}`}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isLast={index === allItems.length - 1}
          />
        ))}
      </MuiBreadcrumbs>
    </BreadcrumbsContainer>
  );
};

export default Breadcrumbs;
