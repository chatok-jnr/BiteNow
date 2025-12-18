import { useState } from "react";

function Reviews({ restaurant, reviews: initialReviews }) {
  const [reviews] = useState(initialReviews);
  const [filterRating, setFilterRating] = useState("all");

  const avgRating = restaurant?.restaurant_rating?.average || 0;
  const totalReviews = restaurant?.restaurant_rating?.count || 0;

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }));

  const filteredReviews =
    filterRating === "all" ? reviews : reviews.filter((r) => r.rating === parseInt(filterRating));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const getRatingBgColor = (rating) => {
    if (rating >= 4) return "bg-green-100";
    if (rating >= 3) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>

      {/* Overall Rating Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Overall Score */}
          <div className="flex items-center justify-center md:justify-start gap-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <div className="flex justify-center text-yellow-500 mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-6 h-6 ${i < Math.floor(avgRating) ? "fill-current" : "fill-gray-300"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Based on {totalReviews} reviews</p>
            </div>
          </div>

          {/* Right: Rating Distribution */}
          <div className="space-y-2">
            {ratingCounts.map((item) => (
              <div key={item.rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                  <svg className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterRating("all")}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
            filterRating === "all"
              ? "bg-primary text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setFilterRating(rating.toString())}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all flex items-center gap-1 ${
              filterRating === rating.toString()
                ? "bg-primary text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {rating}
            <svg className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            ({ratingCounts.find((r) => r.rating === rating)?.count || 0})
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review.review_id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {review.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full ${getRatingBgColor(review.rating)}`}>
                  <div className="flex items-center gap-1">
                    <span className={`font-bold ${getRatingColor(review.rating)}`}>{review.rating}</span>
                    <svg className="w-4 h-4 fill-current text-yellow-500" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex text-yellow-500 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? "fill-current" : "fill-gray-300"}`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-500">
              {filterRating === "all"
                ? "No customer reviews yet. Start receiving reviews from your customers!"
                : `No ${filterRating}-star reviews yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reviews;
