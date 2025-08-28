import React, { useState, useRef, useEffect } from 'react';
import {
  InputBase,
  Paper,
  IconButton,
  Box,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  MenuItem,
  Button,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  AppBar,
  Toolbar,
  Slide,
  List,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { TransitionProps } from '@mui/material/transitions';

// Transition for mobile search dialog
const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const SearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(0.5, 1),
  transition: 'all 0.3s ease',
  '&:focus-within': {
    boxShadow: theme.shadows[2],
  },
}));

const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
}));

const FilterButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  minWidth: 'auto',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5),
    '& .MuiButton-startIcon': {
      margin: 0,
    },
    '& .MuiButton-endIcon': {
      margin: 0,
    },
    '& .MuiTypography-root': {
      display: 'none',
    },
  },
}));

interface SearchBarProps {
  /**
   * Placeholder text for the search input
   */
  placeholder?: string;
  /**
   * Initial search value
   */
  initialValue?: string;
  /**
   * Function called when search is submitted
   */
  onSearch?: (value: string) => void;
  /**
   * Whether to show the filter button
   */
  showFilter?: boolean;
  /**
   * Function called when filter button is clicked
   */
  onFilterClick?: () => void;
  /**
   * Items to show in search dropdown (recent searches)
   */
  suggestedItems?: string[];
  /**
   * Optional className for styling
   */
  className?: string;
}

/**
 * Responsive search bar component with optional filter button and suggestions dropdown
 * On mobile devices, opens a full-screen dialog for better interaction
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  initialValue = '',
  onSearch,
  showFilter = false,
  onFilterClick,
  suggestedItems = [],
  className,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchValue, setSearchValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };
  
  // Open mobile search dialog
  const handleMobileSearchOpen = () => {
    setDialogOpen(true);
  };

  // Close mobile search dialog
  const handleMobileSearchClose = () => {
    setDialogOpen(false);
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    
    // Show suggestions if there's input and we have suggested items
    if (value && suggestedItems.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  // Handle search submit
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchValue.trim() && onSearch) {
      onSearch(searchValue.trim());
      setOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchValue(suggestion);
    if (onSearch) {
      onSearch(suggestion);
    }
    setOpen(false);
  };

  // Clear search input
  const handleClear = () => {
    setSearchValue('');
    setOpen(false);
  };

  // Filter button click handler
  const handleFilterClick = () => {
    if (onFilterClick) {
      onFilterClick();
    }
  };

  // Filter suggestions based on current input
  const filteredSuggestions = suggestedItems.filter(item =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close dropdown when clicking escape
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <>
      <Box className={className} ref={anchorRef} sx={{ position: 'relative', width: '100%' }}>
        {isMobile ? (
          // Mobile version - show button that opens dialog
          <SearchContainer onClick={handleMobileSearchOpen} sx={{ cursor: 'pointer' }}>
            <IconButton aria-label="search">
              <SearchIcon />
            </IconButton>
            <SearchInput
              placeholder={placeholder}
              disabled
              fullWidth
              inputProps={{ 'aria-label': 'search' }}
            />
            {showFilter && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                <IconButton size="small" onClick={(e) => { 
                  e.stopPropagation(); 
                  if (onFilterClick) onFilterClick();
                }}>
                  <TuneIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </SearchContainer>
        ) : (
          // Desktop version - normal search bar
          <form onSubmit={handleSubmit}>
            <SearchContainer>
              <IconButton type="submit" aria-label="search">
                <SearchIcon />
              </IconButton>
              
              <SearchInput
                placeholder={placeholder}
                value={searchValue}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ 'aria-label': 'search' }}
              />
              
              {searchValue && (
                <IconButton size="small" onClick={handleClear} aria-label="clear search">
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              
              {showFilter && (
                <>
                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                  <FilterButton
                    variant="text"
                    color="primary"
                    startIcon={<TuneIcon />}
                    onClick={handleFilterClick}
                    size="small"
                  >
                    <Typography variant="body2">Filter</Typography>
                  </FilterButton>
                </>
              )}
            </SearchContainer>
          </form>
        )}

        {/* Desktop suggestions dropdown */}
        <Popper
          open={!isMobile && open && filteredSuggestions.length > 0}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-start"
          transition
          disablePortal
          style={{ width: anchorRef.current?.clientWidth, zIndex: 1300 }}
        >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: 'top left',
            }}
          >
            <Paper elevation={3}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="search-suggestions-menu">
                  {filteredSuggestions.map((suggestion, index) => (
                    <MenuItem 
                      key={index} 
                      onClick={() => handleSuggestionClick(suggestion)}
                      dense
                    >
                      <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', opacity: 0.7 }} />
                      {suggestion}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
    
    {/* Mobile search dialog */}
    <Dialog
      fullScreen
      open={dialogOpen}
      onClose={handleMobileSearchClose}
      TransitionComponent={Transition}
    >
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleMobileSearchClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          
          <form onSubmit={handleSubmit} style={{ flexGrow: 1 }}>
            <SearchInput
              autoFocus
              placeholder={placeholder}
              value={searchValue}
              onChange={handleInputChange}
              fullWidth
              inputProps={{ 'aria-label': 'search' }}
            />
          </form>
          
          {searchValue && (
            <IconButton edge="end" onClick={handleClear}>
              <CloseIcon />
            </IconButton>
          )}
          
          <IconButton 
            edge="end" 
            onClick={handleSubmit}
            color="primary"
            disabled={!searchValue.trim()}
          >
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Mobile suggestions */}
      {filteredSuggestions.length > 0 && (
        <Paper elevation={0} square sx={{ width: '100%', maxHeight: '70vh', overflow: 'auto' }}>
          <List>
            {filteredSuggestions.map((suggestion, index) => (
              <MenuItem 
                key={index} 
                onClick={() => {
                  handleSuggestionClick(suggestion);
                  handleMobileSearchClose();
                }}
              >
                <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', opacity: 0.7 }} />
                <Typography variant="body1">{suggestion}</Typography>
              </MenuItem>
            ))}
          </List>
        </Paper>
      )}
      
      {suggestedItems.length === 0 && searchValue && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No suggestions found
          </Typography>
        </Box>
      )}
    </Dialog>
    </>
  );
};

export default SearchBar;
