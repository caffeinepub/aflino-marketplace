import { createContext, useContext, useEffect, useState } from "react";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  reviewId: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  reviewText: string;
  photoUrls: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: number;
}

interface ReviewContextValue {
  reviews: ProductReview[];
  submitReview: (params: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    reviewText: string;
    photoUrls: string[];
    isVerifiedPurchase: boolean;
  }) => string;
  approveReview: (reviewId: string) => void;
  rejectReview: (reviewId: string) => void;
  getApprovedReviews: (productId: string) => ProductReview[];
  getPendingReviews: () => ProductReview[];
  getProductAverageRating: (productId: string) => {
    averageRating: number;
    reviewCount: number;
  };
}

const SEED_REVIEWS: ProductReview[] = [
  {
    reviewId: "rev-001",
    productId: "1",
    userId: "user-seed-1",
    userName: "Rahul Sharma",
    rating: 5,
    reviewText:
      "Excellent product! Quality is outstanding and delivery was super fast. Highly recommended for everyone.",
    photoUrls: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  },
  {
    reviewId: "rev-002",
    productId: "1",
    userId: "user-seed-2",
    userName: "Priya Patel",
    rating: 5,
    reviewText:
      "Loved it! The material is premium and fits perfectly. Will definitely buy again from this seller.",
    photoUrls: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
  },
  {
    reviewId: "rev-003",
    productId: "2",
    userId: "user-seed-3",
    userName: "Amit Kumar",
    rating: 4,
    reviewText:
      "Very good product. Exactly as described. Fast shipping and well packaged. Great value for money.",
    photoUrls: [],
    isVerifiedPurchase: false,
    status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    reviewId: "rev-004",
    productId: "3",
    userId: "user-seed-4",
    userName: "Sneha Verma",
    rating: 5,
    reviewText:
      "Amazing quality! I was skeptical at first but this exceeded my expectations. Perfect gift idea too!",
    photoUrls: [],
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
  },
  {
    reviewId: "rev-005",
    productId: "1",
    userId: "user-seed-5",
    userName: "Vikash Singh",
    rating: 4,
    reviewText:
      "Good product, sturdy build. Minor delay in delivery but overall very satisfied.",
    photoUrls: [],
    isVerifiedPurchase: false,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

const ReviewContext = createContext<ReviewContextValue>({
  reviews: [],
  submitReview: () => "",
  approveReview: () => {},
  rejectReview: () => {},
  getApprovedReviews: () => [],
  getPendingReviews: () => [],
  getProductAverageRating: () => ({ averageRating: 0, reviewCount: 0 }),
});

function loadReviews(): ProductReview[] {
  try {
    const stored = localStorage.getItem("aflino_reviews");
    if (stored) return JSON.parse(stored);
  } catch {}
  return SEED_REVIEWS;
}

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ProductReview[]>(loadReviews);

  useEffect(() => {
    try {
      localStorage.setItem("aflino_reviews", JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  function submitReview(params: {
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    reviewText: string;
    photoUrls: string[];
    isVerifiedPurchase: boolean;
  }): string {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newReview: ProductReview = {
      reviewId,
      productId: params.productId,
      userId: params.userId,
      userName: params.userName,
      rating: params.rating,
      reviewText: params.reviewText,
      photoUrls: params.photoUrls,
      isVerifiedPurchase: params.isVerifiedPurchase,
      status: "pending",
      createdAt: Date.now(),
    };
    setReviews((prev) => [newReview, ...prev]);
    return reviewId;
  }

  function approveReview(reviewId: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId
          ? { ...r, status: "approved" as ReviewStatus }
          : r,
      ),
    );
  }

  function rejectReview(reviewId: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId
          ? { ...r, status: "rejected" as ReviewStatus }
          : r,
      ),
    );
  }

  function getApprovedReviews(productId: string): ProductReview[] {
    return reviews.filter(
      (r) => r.productId === productId && r.status === "approved",
    );
  }

  function getPendingReviews(): ProductReview[] {
    return reviews.filter((r) => r.status === "pending");
  }

  function getProductAverageRating(productId: string): {
    averageRating: number;
    reviewCount: number;
  } {
    const approved = reviews.filter(
      (r) => r.productId === productId && r.status === "approved",
    );
    if (approved.length === 0) return { averageRating: 0, reviewCount: 0 };
    const avg =
      approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
    return { averageRating: avg, reviewCount: approved.length };
  }

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        submitReview,
        approveReview,
        rejectReview,
        getApprovedReviews,
        getPendingReviews,
        getProductAverageRating,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  return useContext(ReviewContext);
}
