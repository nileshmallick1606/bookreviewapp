import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  useMediaQuery,
  Menu,
  MenuItem,
  Button
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface TabItem {
  label: string;
  value: string;
  icon?: React.ReactElement | string;
  disabled?: boolean;
}

const TabsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
}));

interface TabNavigationProps {
  /**
   * Array of tab items
   */
  tabs: TabItem[];
  /**
   * Current selected tab value
   */
  value: string;
  /**
   * Change handler for tab selection
   */
  onChange: (newValue: string) => void;
  /**
   * Maximum tabs to show before collapsing to dropdown on mobile
   */
  mobileMaxTabs?: number;
  /**
   * Optional variant for the tabs
   */
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Responsive tab navigation that converts to dropdown on mobile
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  value,
  onChange,
  mobileMaxTabs = 2,
  variant = 'standard',
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
    onChange(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuItemClick = (tabValue: string) => {
    onChange(tabValue);
    handleMenuClose();
  };

  // For mobile view, show a limited number of tabs and put the rest in a dropdown
  if (isMobile && tabs.length > mobileMaxTabs) {
    const visibleTabs = tabs.slice(0, mobileMaxTabs);
    const menuTabs = tabs.slice(mobileMaxTabs);
    const currentTab = tabs.find(tab => tab.value === value);

    // Check if the current selected tab should be in the dropdown
    const isSelectedInDropdown = menuTabs.some(tab => tab.value === value);
    
    // If selected tab is in dropdown, swap it with the last visible tab
    let adjustedVisibleTabs = [...visibleTabs];
    let adjustedMenuTabs = [...menuTabs];
    
    if (isSelectedInDropdown && currentTab) {
      adjustedVisibleTabs = [...visibleTabs.slice(0, mobileMaxTabs - 1), currentTab];
      adjustedMenuTabs = [
        ...menuTabs.filter(tab => tab.value !== value),
        visibleTabs[mobileMaxTabs - 1]
      ];
    }

    return (
      <TabsContainer className={className}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Tabs
            value={value}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="navigation tabs"
            sx={{ 
              flexGrow: 1,
              '& .MuiTabs-flexContainer': {
                justifyContent: variant === 'fullWidth' ? 'space-around' : 'flex-start',
              }
            }}
          >
            {adjustedVisibleTabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                icon={tab.icon || undefined}
                iconPosition={tab.icon ? "start" : undefined}
                disabled={tab.disabled}
              />
            ))}
          </Tabs>
          
          <Button
            onClick={handleMenuOpen}
            endIcon={<ExpandMoreIcon />}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            More
          </Button>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {adjustedMenuTabs.map((tab) => (
              <MenuItem
                key={tab.value}
                onClick={() => handleMenuItemClick(tab.value)}
                disabled={tab.disabled}
                selected={tab.value === value}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {tab.icon ? <Box sx={{ mr: 1, display: 'flex' }}>{tab.icon}</Box> : null}
                {tab.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </TabsContainer>
    );
  }

  // For desktop or when there are fewer tabs
  return (
    <TabsContainer className={className}>
      <Tabs
        value={value}
        onChange={handleTabChange}
        variant={variant}
        scrollButtons="auto"
        aria-label="navigation tabs"
        sx={{
          '& .MuiTabs-flexContainer': {
            justifyContent: variant === 'fullWidth' ? 'space-around' : 'flex-start',
          }
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon || undefined}
            iconPosition={tab.icon ? "start" : undefined}
            disabled={tab.disabled}
          />
        ))}
      </Tabs>
    </TabsContainer>
  );
};

export default TabNavigation;
