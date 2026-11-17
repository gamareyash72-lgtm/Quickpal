import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquare, ThumbsUp, Edit3, X, Sparkles } from 'lucide-react';
import { Order, OrderFeedback } from '../types';
import { triggerSparkleBlast } from './SparkleBlast';

interface OrderRatingFeedbackProps {
  order: Order;
  onSubmitFeedback: (orderId: string, feedback: { rating: number; comment?: string; tags?: string[] }) => void;
}

const POSITIVE_TAGS = [
  '⚡ Super Fast Delivery',
  '🥦 Farm Fresh Items',
  '🤝 Polite Delivery Partner',
  '📦 Spill-Proof Packaging',
  '🎯 100% Accurate Items',
  '💰 Great Value & Deals'
];

const IMPROVEMENT_TAGS = [
  '⏱️ Delayed Delivery',
  '📦 Damaged Packaging',
  '🥦 Freshness / Quality Issue',
  '📞 Rider Contact Issue',
  '❓ Item Discrepancy'
];

const RATING_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Poor Experience', emoji: '😞', color: 'text-rose-500' },
  2: { text: 'Fair Experience', emoji: '😐', color: 'text-amber-500' },
  3: { text: 'Good Delivery', emoji: '🙂', color: 'text-amber-500' },
  4: { text: 'Very Good Delivery', emoji: '😊', color: 'text-[#FF6A00]' },
  5: { text: 'Outstanding Experience!', emoji: '🌟', color: 'text-[#FF6A00]' },
};

export const OrderRatingFeedback: React.FC<OrderRatingFeedbackProps> = ({
  order,
  onSubmitFeedback,
}) => {
  const existingFeedback = order.feedback;

  const [isEditing, setIsEditing] = useState<boolean>(!existingFeedback);
  const [selectedRating, setSelectedRating] = useState<number>(existingFeedback?.rating || 5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingFeedback?.tags || []);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [submittedNotice, setSubmittedNotice] = useState<boolean>(false);

  // If order is not delivered yet, rating is not applicable
  if (order.status !== 'delivered') {
    return null;
  }

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating < 1) return;

    onSubmitFeedback(order.id, {
      rating: selectedRating,
      comment: comment.trim(),
      tags: selectedTags,
    });

    triggerSparkleBlast();
    setSubmittedNotice(true);
    setIsEditing(false);

    setTimeout(() => {
      setSubmittedNotice(false);
    }, 4000);
  };

  const handleStartEdit = () => {
    setSelectedRating(existingFeedback?.rating || 5);
    setSelectedTags(existingFeedback?.tags || []);
    setComment(existingFeedback?.comment || '');
    setIsEditing(true);
  };

  const activeRating = hoveredRating !== null ? hoveredRating : selectedRating;
  const ratingInfo = RATING_LABELS[activeRating] || RATING_LABELS[5];
  const availableTags = activeRating >= 4 ? POSITIVE_TAGS : IMPROVEMENT_TAGS;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-200 dark:border-orange-800/60 p-3.5 sm:p-4 my-2 text-xs shadow-xs space-y-2.5 transition-all">
      {/* Submitted Notice Banner */}
      {submittedNotice && (
        <div className="bg-orange-50 border border-orange-300 text-[#FF6A00] p-2.5 rounded-xl font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF6A00] animate-sparkle" />
            <span>Thank you! Your feedback has been recorded.</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmittedNotice(false)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View Mode: Already Rated */}
      {!isEditing && existingFeedback ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⭐</span>
              <span className="font-black text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                Your Delivery Experience
              </span>
              <span className="bg-orange-100 dark:bg-orange-950/60 text-[#FF6A00] text-[10px] font-black px-2 py-0.5 rounded-full">
                Rated
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartEdit}
              className="text-[#FF6A00] hover:text-orange-700 dark:hover:text-orange-300 text-xs font-bold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Edit3 className="w-3 h-3" /> Edit Rating
            </button>
          </div>

          {/* Stars & Rating Summary */}
          <div className="flex items-center gap-2 pt-0.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= existingFeedback.rating
                      ? 'text-[#FF6A00] fill-[#FF6A00]'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="font-extrabold text-[#FF6A00] text-xs">
              {existingFeedback.rating} / 5 Stars
            </span>
            <span className="text-gray-400 text-[10px]">
              • {new Date(existingFeedback.submittedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Tags */}
          {Array.isArray(existingFeedback.tags) && existingFeedback.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {existingFeedback.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#FF6A00]" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Comment */}
          {existingFeedback.comment && (
            <div className="bg-orange-50/60 dark:bg-orange-950/20 p-2.5 rounded-xl border border-orange-100 dark:border-orange-900/40 text-gray-700 dark:text-gray-300 text-xs italic">
              &ldquo;{existingFeedback.comment}&rdquo;
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode: Rate with stars, compliment tags & comment */
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">⭐</span>
              <div>
                <h4 className="font-black text-gray-900 dark:text-gray-100 text-xs sm:text-sm">
                  {existingFeedback ? 'Update Your Rating & Feedback' : 'Rate Your Delivery Experience'}
                </h4>
                <p className="text-[10px] text-gray-500 font-medium">
                  Order delivered • How did QuickPal & your rider do?
                </p>
              </div>
            </div>

            {existingFeedback && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 text-[11px] font-bold cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Interactive Star Row */}
          <div className="flex flex-col items-center justify-center p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/50 space-y-1.5">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => {
                const isFilled = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 rounded-lg transition-transform hover:scale-125 active:scale-95 cursor-pointer focus:outline-none"
                    title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isFilled
                          ? 'text-[#FF6A00] fill-[#FF6A00] drop-shadow-xs'
                          : 'text-gray-300 dark:text-gray-600 hover:text-orange-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Rating Status Pill */}
            <div className="flex items-center gap-1.5 text-xs font-black">
              <span className="text-sm">{ratingInfo.emoji}</span>
              <span className={ratingInfo.color}>{ratingInfo.text}</span>
              <span className="text-gray-400 font-normal text-[11px]">
                ({activeRating} of 5)
              </span>
            </div>
          </div>

          {/* Quick Tags Selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider block">
              {activeRating >= 4 ? 'What went well?' : 'What could be improved?'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 border active:scale-95 ${
                      isSelected
                        ? 'bg-[#FF6A00] text-white border-[#FF6A00] shadow-2xs font-black'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50/70'
                    }`}
                  >
                    <span>{tag}</span>
                    {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Comment Textarea */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <label htmlFor={`feedback-comment-${order.id}`} className="font-black uppercase text-gray-500">
                Write a short comment (optional)
              </label>
              <span className="text-gray-400 font-medium">
                {comment.length}/250
              </span>
            </div>
            <textarea
              id={`feedback-comment-${order.id}`}
              value={comment}
              onChange={e => setComment(e.target.value.slice(0, 250))}
              placeholder="e.g. Delivery partner was very courteous, groceries were crisp and packed carefully!"
              rows={2}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-all resize-none"
            />
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-end gap-2 pt-1">
            {existingFeedback && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="bg-[#FF6A00] hover:bg-orange-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{existingFeedback ? 'Update Feedback' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
