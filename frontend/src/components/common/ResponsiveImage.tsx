import React from 'react';
import Image, { ImageProps } from 'next/image';
import { Box, Skeleton, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Define props for our responsive image component
interface ResponsiveImageProps extends Omit<ImageProps, 'width' | 'height'> {
  /**
   * Width of the image (can be a number or CSS value)
   */
  width?: number | string;
  /**
   * Height of the image (can be a number or CSS value)
   */
  height?: number | string;
  /**
   * Aspect ratio for the image (e.g., '16/9', '4/3', '1/1')
   * If provided, it will maintain this aspect ratio at all screen sizes
   */
  aspectRatio?: string;
  /**
   * Whether to make the image fill its container
   */
  fill?: boolean;
  /**
   * Optional container props
   */
  containerProps?: BoxProps;
  /**
   * Show a skeleton loader while the image is loading
   */
  showSkeleton?: boolean;
  /**
   * Add rounded corners to the image
   */
  rounded?: boolean | string;
  /**
   * Make the image circle-shaped
   */
  circle?: boolean;
}

// Styled container for handling image aspect ratio and loading states
const ImageContainer = styled(Box, {
  shouldForwardProp: (prop) => !['aspectRatio', 'rounded', 'circle'].includes(prop as string),
})<{ 
  aspectRatio?: string; 
  rounded?: boolean | string;
  circle?: boolean;
}>(({ aspectRatio, rounded, circle }) => ({
  position: 'relative',
  overflow: 'hidden',
  ...(aspectRatio && {
    aspectRatio,
  }),
  ...(rounded && {
    borderRadius: typeof rounded === 'string' ? rounded : '8px',
  }),
  ...(circle && {
    borderRadius: '50%',
  }),
}));

/**
 * A responsive image component that adapts to different screen sizes
 * Extends Next.js Image with additional features like aspect ratio control
 */
const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width: widthProp,
  height: heightProp,
  aspectRatio,
  fill = false,
  containerProps = {},
  showSkeleton = true,
  rounded = false,
  circle = false,
  ...rest
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  // Calculate width and height based on props
  const width = typeof widthProp === 'number' ? widthProp : undefined;
  const height = typeof heightProp === 'number' ? heightProp : undefined;

  // Determine container style based on props
  const containerStyle = {
    width: widthProp,
    height: heightProp,
    ...containerProps.sx,
  };

  return (
    <ImageContainer
      aspectRatio={aspectRatio}
      rounded={rounded}
      circle={circle}
      sx={containerStyle}
      {...containerProps}
    >
      {showSkeleton && isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill={fill || Boolean(aspectRatio)}
        width={!fill && !aspectRatio ? width : undefined}
        height={!fill && !aspectRatio ? height : undefined}
        onLoad={() => setIsLoading(false)}
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          // Hide the image until it's loaded if showing skeleton
          opacity: isLoading && showSkeleton ? 0 : 1,
          // If using aspect ratio or fill, take up the full container
          position: aspectRatio || fill ? 'absolute' : 'relative',
        }}
        {...rest}
      />
    </ImageContainer>
  );
};

export default ResponsiveImage;
