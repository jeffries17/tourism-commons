import { useState } from 'react';

interface InlineReviewInputProps {
  onAdd: (review: string) => void;
  onCancel: () => void;
}

export default function InlineReviewInput({ onAdd, onCancel }: InlineReviewInputProps) {
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (review.trim()) {
      onAdd(review.trim());
      setReview('');
    }
  };

  const handleExample = () => {
    const example = "What a beautiful place, very basic but so beautiful!! Cold water and toilet are fine amenities- in hot weather (and we had hot weather) you can cool off in the river. Very nice. A minus... when the wind dies down you get eaten up by hundreds of midges. So bring anti-midge and main net! There is an honesty box and you pay 7 pounds pp.";
    setReview(example);
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Review</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="new-review" className="block text-sm font-medium text-gray-700 mb-2">
            Review Text
          </label>
          <textarea
            id="new-review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Paste your review here..."
            autoFocus
          />
          <p className="mt-2 text-sm text-gray-500">
            {review.length} characters
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!review.trim()}
            className="flex-1 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Add Review
          </button>
          <button
            type="button"
            onClick={handleExample}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Load Example
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

