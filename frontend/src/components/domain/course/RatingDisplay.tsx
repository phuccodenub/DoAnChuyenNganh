import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  totalRatings: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingDisplay({ 
  rating, 
  totalRatings, 
  showLabel = true,
  size = 'md' 
}: RatingDisplayProps) {
  const clampedRating = Math.min(Math.max(rating, 0), 5);
  const remainder = clampedRating - Math.floor(clampedRating);
  const fullStars = remainder >= 0.75
    ? Math.min(Math.floor(clampedRating) + 1, 5)
    : Math.floor(clampedRating);
  const hasHalfStar = fullStars < 5 && remainder >= 0.25 && remainder < 0.75;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400 flex-shrink-0`}
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative inline-flex flex-shrink-0">
            <Star className={`${sizeClasses[size]} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={`${sizeClasses[size]} text-gray-300 flex-shrink-0`}
          />
        ))}
      </div>
      
      {showLabel && (
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="font-semibold">{rating.toFixed(1)}</span>
          {totalRatings > 0 && (
            <span className="text-gray-500">({totalRatings} đánh giá)</span>
          )}
        </div>
      )}
    </div>
  );
}

