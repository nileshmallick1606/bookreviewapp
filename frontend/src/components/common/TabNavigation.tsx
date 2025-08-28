import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  useTheme, 
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';

// Tab item interface
export interface TabItem {
  /** Label text to display */
  label: string;
  /** Unique value for tab */
  value: string | number;
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Badge count - if provided, shows a badge with count */
  badgeCount?: number;
  /** Whether tab is disabled */
  disabled?: boolean;
}

// Props interface
interface TabNavigationProps {
  /** Array of tab items */
  tabs: TabItem[];
  /** Currently selected tab value */
  value: string | number;
  /** Change handler */
  onChange: (value: string | number) => void;
  /** Tab orientation - default is horizontal */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to collapse tabs into a dropdown on mobile */
  collapseOnMobile?: boolean;
  /** Maximum number of tabs to display before collapsing extras (mobile only) */
  maxVisibleMobileTabs?: number;
  /** Optional classes to apply to tabs */
  className?: string;
  /** Whether to show divider below tabs */
  showDivider?: boolean;
}

// Styled components
const StyledTabs = styled(Tabs)(({ theme, orientation }) => ({
  minHeight: orientation === 'vertical' ? 'auto' : undefined,
  '& .MuiTabs-indicator': {
    ...(orientation === 'vertical' && {
      right: 'auto',
      left: 0
    })
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
}));

const BadgeWrapper = styled('span')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  padding: '0px 6px',
  fontSize: '0.75rem',
  marginLeft: theme.spacing(1),
  display: 'inline-block',
  minWidth: '20px',
  textAlign: 'center',
}));

/**
 * TabNavigation - A responsive tab navigation component
 * Automatically adapts to screen size and can collapse into dropdown menu on mobile
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  value,
  onChange,
  orientation = 'horizontal',
  collapseOnMobile = false,
  maxVisibleMobileTabs = 2,
  className,
  showDivider = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [visibleTabs, setVisibleTabs] = useState<TabItem[]>(tabs);
  const [overflowTabs, setOverflowTabs] = useState<TabItem[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  // Handle tab visibility based on screen size
  useEffect(() => {
    if (collapseOnMobile && isMobile && tabs.length > maxVisibleMobileTabs) {
      setVisibleTabs(tabs.slice(0, maxVisibleMobileTabs));
      setOverflowTabs(tabs.slice(maxVisibleMobileTabs));
    } else {
      setVisibleTabs(tabs);
      setOverflowTabs([]);
    }
  }, [tabs, isMobile, collapseOnMobile, maxVisibleMobileTabs]);

  // Handle menu open
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle menu item selection
  const handleMenuItemClick = (tabValue: string | number) => {
    onChange(tabValue);
    handleMenuClose();
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StyledTabs
          value={value}
          onChange={(_, newValue) => onChange(newValue)}
          orientation={orientation}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="navigation tabs"
          className={className}
          sx={{ flex: 1 }}
        >
          {visibleTabs.map((tab) => (
            <StyledTab
              key={tab.value}
              label={
                tab.badgeCount ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {tab.label}
                    <BadgeWrapper>{tab.badgeCount}</BadgeWrapper>
                  </Box>
                ) : (
                  tab.label
                )
              }
              value={tab.value}
              disabled={tab.disabled}
              iconPosition={orientation === 'vertical' ? 'start' : 'top'}
              {...(tab.icon ? { icon: tab.icon as React.ReactElement } : {})}
            />
          ))}
        </StyledTabs>

        {overflowTabs.length > 0 && (
          <Box>
            <IconButton
              aria-label="more tabs"
              id="tabs-menu-button"
              aria-controls={menuOpen ? 'tabs-menu' : undefined}
              aria-expanded={menuOpen ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="tabs-menu"
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'tabs-menu-button',
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {overflowTabs.map((tab) => (
                <MenuItem
                  key={tab.value}
                  onClick={() => handleMenuItemClick(tab.value)}
                  disabled={tab.disabled}
                  selected={value === tab.value}
                >
                  {tab.icon && (
                    <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                      {tab.icon}
                    </Box>
                  )}
                  <Typography variant="body2">{tab.label}</Typography>
                  {tab.badgeCount !== undefined && (
                    <BadgeWrapper sx={{ ml: 1 }}>{tab.badgeCount}</BadgeWrapper>
                  )}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        )}
      </Box>
      
      {showDivider && <Divider sx={{ mt: 0, mb: 2 }} />}
    </Box>
  );
};

export default TabNavigation;
