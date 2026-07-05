import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange,
}) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starValue = idx + 1;

        const isFilled = starValue <= Math.round(rating);

        return (
          <Star
            key={idx}
            size={size}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${
              isFilled
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-200 fill-slate-200'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          />
        );
      })}
    </div>
  );
};

