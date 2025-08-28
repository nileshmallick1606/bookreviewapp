// src/components/profile/ProfileForm.tsx
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Chip, 
  OutlinedInput, 
  FormHelperText, 
  Avatar,
  Typography
} from '@mui/material';
import { UserProfile, ProfileUpdateData } from '../../services/userService';

// Available genres for selection
const AVAILABLE_GENRES = [
  'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 
  'Mystery', 'Thriller', 'Romance', 'Horror', 
  'Biography', 'History', 'Self-Help', 'Business',
  'Children', 'Young Adult', 'Poetry', 'Classics'
];

interface ProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: ProfileUpdateData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit, onCancel, isSubmitting }) => {
  const [name, setName] = useState(profile.name || '');
  const [genres, setGenres] = useState<string[]>(profile.genrePreferences || []);
  const [profilePicture, setProfilePicture] = useState(profile.profilePicture || '');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    profilePicture?: string;
  }>({});
  
  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      profilePicture?: string;
    } = {};
    
    if (!name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (profilePicture && !profilePicture.match(/^(http|https):\/\//)) {
      errors.profilePicture = 'Profile picture must be a valid URL';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const updateData: ProfileUpdateData = {
      name: name.trim(),
      genrePreferences: genres,
      profilePicture: profilePicture.trim()
    };
    
    await onSubmit(updateData);
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar 
          src={profilePicture || undefined} 
          alt={name} 
          sx={{ width: 100, height: 100, mb: 2 }}
        >
          {name.charAt(0).toUpperCase()}
        </Avatar>
        
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Profile Picture
        </Typography>
      </Box>
      
      <TextField
        margin="normal"
        fullWidth
        id="name"
        label="Name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!formErrors.name}
        helperText={formErrors.name}
        disabled={isSubmitting}
        autoFocus
      />
      
      <TextField
        margin="normal"
        fullWidth
        id="profilePicture"
        label="Profile Picture URL"
        name="profilePicture"
        placeholder="https://example.com/your-image.jpg"
        value={profilePicture}
        onChange={(e) => setProfilePicture(e.target.value)}
        error={!!formErrors.profilePicture}
        helperText={formErrors.profilePicture}
        disabled={isSubmitting}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="genre-preferences-label">Genre Preferences</InputLabel>
        <Select
          labelId="genre-preferences-label"
          id="genre-preferences"
          multiple
          value={genres}
          onChange={(e) => setGenres(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
          input={<OutlinedInput label="Genre Preferences" />}
          disabled={isSubmitting}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {AVAILABLE_GENRES.map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>Select your favorite book genres</FormHelperText>
      </FormControl>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting}
          sx={{ mr: 2 }}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="contained" 
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default ProfileForm;
