import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Grid,
  Paper,
  Alert,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import Image from 'next/image';

interface ImageUploadProps {
  images: File[];
  onChange: (images: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxFiles = 3,
  maxSizeMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    
    setError(null);
    
    // Check if adding new files would exceed the limit
    if (images.length + fileList.length > maxFiles) {
      setError(`You can only upload a maximum of ${maxFiles} images`);
      return;
    }
    
    // Validate files and create preview URLs
    const validFiles: File[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.');
        continue;
      }
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be less than ${maxSizeMB}MB`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    // Update images state with valid files
    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]);
    }
  };
  
  const handleRemove = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onChange(updatedImages);
  };
  
  return (
    <Box>
      <input
        id="image-upload"
        type="file"
        accept={allowedTypes.join(',')}
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={images.length >= maxFiles}
      />
      
      <label htmlFor="image-upload">
        <Button
          component="span"
          variant="outlined"
          startIcon={<CloudUpload />}
          disabled={images.length >= maxFiles}
        >
          Upload Images
        </Button>
      </label>
      
      <Typography variant="caption" display="block" color="textSecondary" mt={1}>
        {`Maximum ${maxFiles} images (${maxSizeMB}MB each). JPG, PNG, GIF, WEBP only.`}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      {images.length > 0 && (
        <Grid container spacing={2} mt={2}>
          {images.map((file, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Paper sx={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.7)',
                    },
                    color: 'white',
                  }}
                  onClick={() => handleRemove(index)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;
