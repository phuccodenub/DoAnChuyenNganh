import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

/**
 * SafeImage component với các attributes để giảm Tracking Prevention warnings
 * - crossorigin="anonymous": Cho phép CORS nhưng không gửi credentials
 * - referrerPolicy="no-referrer-when-downgrade": Giảm tracking
 * - loading="lazy": Lazy load images để tối ưu performance
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className,
  ...props 
}) => {
  // Kiểm tra nếu là Cloudinary URL
  const isCloudinary = src?.includes('cloudinary.com') || src?.includes('res.cloudinary.com');
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      crossOrigin={isCloudinary ? "anonymous" : undefined}
      referrerPolicy="no-referrer-when-downgrade"
      loading="lazy"
      {...props}
    />
  );
};

