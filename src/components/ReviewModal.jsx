import React from "react";
import { Star, X } from "lucide-react";

function ReviewModal({ 
  isOpen, 
  onOpenChange, 
  product, 
  rating, 
  setRating, 
  comment, 
  setComment, 
  submitting, 
  onSubmit 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => onOpenChange(false)} 
      />
      
      {/* Modal Dialog - Using background/foreground for theme support */}
      <div className="relative w-full max-w-sm rounded-2xl bg-background border border-default-200 dark:border-white/10 shadow-2xl p-6">
        <button 
          onClick={() => onOpenChange(false)} 
          className="absolute right-4 top-4 text-default-400 hover:text-default-600 transition-colors"
        >
          <X size={18} />
        </button>
        
        <h2 className="text-lg font-semibold text-foreground">
          Review {product?.title}
        </h2>
        
        {/* Rating Stars */}
        <div className="flex gap-1.5 justify-center my-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button 
              key={star} 
              type="button" 
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Star 
                size={32} 
                className={star <= rating 
                  ? "fill-amber-500 text-amber-500" 
                  : "text-default-300"
                } 
              />
            </button>
          ))}
        </div>

        {/* Comment Textarea - Adaptive colors */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          className="w-full rounded-xl border border-default-200 dark:border-white/10 bg-default-100/50 p-3 text-sm text-foreground focus:ring-2 focus:ring-amber-500/40 outline-none transition-all"
        />

        {/* Submit Button - Styled to match your theme */}
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2.5 font-bold text-sm shadow-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}

export default ReviewModal;