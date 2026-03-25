import { useBlacklist } from "@/context/BlacklistContext";
import { useCustomerCoins } from "@/context/CustomerCoinContext";
import { useRewardSettings } from "@/context/RewardSettingsContext";
import { createContext, useContext, useEffect, useRef, useState } from "react";

export type ReviewStatus = "pending" | "scheduled" | "flagged" | "published";

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
  scheduledAt?: number;
  scanReason?: string;
}

/** Tracks how many coins a user earned per product (for cap enforcement) */
export interface ReviewRewardEntry {
  userId: string;
  productId: string;
  coinsEarned: number;
}

/** Tracks how many times a user has submitted a review for a product */
export interface ReviewSubmissionEntry {
  userId: string;
  productId: string;
  count: number;
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
  editReview: (reviewId: string, newText: string) => void;
  deleteAndBlockUser: (reviewId: string, userId: string) => void;
  getApprovedReviews: (productId: string) => ProductReview[];
  getPendingReviews: () => ProductReview[];
  getScheduledReviews: () => ProductReview[];
  getFlaggedReviews: () => ProductReview[];
  getProductAverageRating: (productId: string) => {
    averageRating: number;
    reviewCount: number;
  };
  getSubmissionCount: (userId: string, productId: string) => number;
  getCoinsEarned: (userId: string, productId: string) => number;
  recordCoinsEarned: (userId: string, productId: string, coins: number) => void;
  isUserBlocked: (userId: string) => boolean;
  blockedUsers: string[];
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
    status: "published",
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
    status: "published",
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
    status: "published",
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
    status: "published",
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
    status: "scheduled",
    scheduledAt: Date.now() - 1000 * 60 * 30, // 30 min ago
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
  },
];

const ReviewContext = createContext<ReviewContextValue>({
  reviews: [],
  submitReview: () => "",
  approveReview: () => {},
  rejectReview: () => {},
  editReview: () => {},
  deleteAndBlockUser: () => {},
  getApprovedReviews: () => [],
  getPendingReviews: () => [],
  getScheduledReviews: () => [],
  getFlaggedReviews: () => [],
  getProductAverageRating: () => ({ averageRating: 0, reviewCount: 0 }),
  getSubmissionCount: () => 0,
  getCoinsEarned: () => 0,
  recordCoinsEarned: () => {},
  isUserBlocked: () => false,
  blockedUsers: [],
});

function loadReviews(): ProductReview[] {
  try {
    const stored = localStorage.getItem("aflino_reviews");
    if (stored) {
      const parsed: ProductReview[] = JSON.parse(stored);
      // Migrate old "approved" status to "published"
      return parsed.map((r) =>
        (r.status as string) === "approved"
          ? { ...r, status: "published" as ReviewStatus }
          : (r.status as string) === "rejected"
            ? { ...r, status: "flagged" as ReviewStatus }
            : r,
      );
    }
  } catch {}
  return SEED_REVIEWS;
}

function loadSubmissions(): ReviewSubmissionEntry[] {
  try {
    const stored = localStorage.getItem("aflino_review_submissions");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadRewardHistory(): ReviewRewardEntry[] {
  try {
    const stored = localStorage.getItem("aflino_review_reward_history");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function loadBlockedUsers(): string[] {
  try {
    const stored = localStorage.getItem("aflino_blocked_reviewers");
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<ProductReview[]>(loadReviews);
  const [submissions, setSubmissions] =
    useState<ReviewSubmissionEntry[]>(loadSubmissions);
  const [rewardHistory, setRewardHistory] =
    useState<ReviewRewardEntry[]>(loadRewardHistory);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(loadBlockedUsers);

  const { containsProfanity } = useBlacklist();
  const { addCoins } = useCustomerCoins();
  const { settings: rewardSettings } = useRewardSettings();

  // Refs to avoid stale closures in heartbeat
  const addCoinsRef = useRef(addCoins);
  addCoinsRef.current = addCoins;
  const rewardHistoryRef = useRef(rewardHistory);
  rewardHistoryRef.current = rewardHistory;
  const rewardSettingsRef = useRef(rewardSettings);
  rewardSettingsRef.current = rewardSettings;

  useEffect(() => {
    try {
      localStorage.setItem("aflino_reviews", JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "aflino_review_submissions",
        JSON.stringify(submissions),
      );
    } catch {}
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "aflino_review_reward_history",
        JSON.stringify(rewardHistory),
      );
    } catch {}
  }, [rewardHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "aflino_blocked_reviewers",
        JSON.stringify(blockedUsers),
      );
    } catch {}
  }, [blockedUsers]);

  // ── Canister Heartbeat simulation: auto-publish scheduled reviews after 1 hour ──
  useEffect(() => {
    const interval = setInterval(() => {
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
      setReviews((prev) => {
        let changed = false;
        const publishedReviews: ProductReview[] = [];
        const updated = prev.map((r) => {
          if (
            r.status === "scheduled" &&
            r.scheduledAt &&
            now - r.scheduledAt >= ONE_HOUR
          ) {
            changed = true;
            publishedReviews.push(r);
            return { ...r, status: "published" as ReviewStatus };
          }
          return r;
        });
        if (changed) {
          localStorage.setItem("aflino_reviews", JSON.stringify(updated));
          // Credit coins for auto-published reviews
          for (const review of publishedReviews) {
            internalCreditCoins(review);
          }
        }
        return changed ? updated : prev;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function internalCreditCoins(review: ProductReview) {
    const settings = rewardSettingsRef.current;
    const textPoints = settings.textPoints ?? 3;
    const photoPoints = settings.photoPoints ?? 2;
    const coinCap = textPoints + photoPoints;

    const history = rewardHistoryRef.current;
    const existing = history.find(
      (r) => r.userId === review.userId && r.productId === review.productId,
    );
    const alreadyEarned = existing?.coinsEarned ?? 0;

    if (alreadyEarned >= coinCap) return;

    const hasText = review.reviewText.trim().length >= 10;
    const hasPhotos = review.photoUrls.length > 0;
    let coinsToAward = 0;

    if (hasText && alreadyEarned < textPoints) {
      coinsToAward += textPoints - alreadyEarned;
    }
    if (hasPhotos) {
      const afterText = alreadyEarned + coinsToAward;
      if (afterText < coinCap) {
        const photoAlreadyEarned = Math.max(0, alreadyEarned - textPoints);
        if (photoAlreadyEarned < photoPoints) {
          coinsToAward += Math.min(
            photoPoints - photoAlreadyEarned,
            coinCap - afterText,
          );
        }
      }
    }

    coinsToAward = Math.max(0, Math.min(coinsToAward, coinCap - alreadyEarned));
    if (coinsToAward <= 0) return;

    const hasText_ = hasText;
    const hasPhotos_ = hasPhotos;
    const textCoins =
      hasText_ && alreadyEarned < textPoints
        ? Math.min(textPoints - alreadyEarned, coinsToAward)
        : 0;
    const photoCoins = hasPhotos_ ? coinsToAward - textCoins : 0;

    if (textCoins > 0) {
      addCoinsRef.current(
        review.userId,
        textCoins,
        `Review Reward (Text): +${textCoins} Coins`,
      );
    }
    if (photoCoins > 0) {
      addCoinsRef.current(
        review.userId,
        photoCoins,
        `Review Reward (Photo Bonus): +${photoCoins} Coins`,
      );
    }

    // Update reward history
    setRewardHistory((prev) => {
      const ex = prev.find(
        (r) => r.userId === review.userId && r.productId === review.productId,
      );
      if (ex) {
        const updated = prev.map((r) =>
          r.userId === review.userId && r.productId === review.productId
            ? { ...r, coinsEarned: r.coinsEarned + coinsToAward }
            : r,
        );
        rewardHistoryRef.current = updated;
        return updated;
      }
      const updated = [
        ...prev,
        {
          userId: review.userId,
          productId: review.productId,
          coinsEarned: coinsToAward,
        },
      ];
      rewardHistoryRef.current = updated;
      return updated;
    });
  }

  function smartScan(text: string): { isClean: boolean; reason?: string } {
    if (/https?:\/\/|www\.|\.(com|in|net|org)/.test(text)) {
      return { isClean: false, reason: "Contains URL/link" };
    }
    if (/<[^>]+>|javascript:/i.test(text)) {
      return { isClean: false, reason: "Contains HTML/script tags" };
    }
    if (containsProfanity(text)) {
      return { isClean: false, reason: "Contains prohibited words" };
    }
    return { isClean: true };
  }

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
    const scanResult = smartScan(params.reviewText);
    const newStatus: ReviewStatus = scanResult.isClean
      ? "scheduled"
      : "flagged";

    const newReview: ProductReview = {
      reviewId,
      productId: params.productId,
      userId: params.userId,
      userName: params.userName,
      rating: params.rating,
      reviewText: params.reviewText,
      photoUrls: params.photoUrls,
      isVerifiedPurchase: params.isVerifiedPurchase,
      status: newStatus,
      createdAt: Date.now(),
      scheduledAt: scanResult.isClean ? Date.now() : undefined,
      scanReason: scanResult.reason,
    };
    setReviews((prev) => [newReview, ...prev]);

    // Increment submission count
    setSubmissions((prev) => {
      const existing = prev.find(
        (s) => s.userId === params.userId && s.productId === params.productId,
      );
      if (existing) {
        return prev.map((s) =>
          s.userId === params.userId && s.productId === params.productId
            ? { ...s, count: s.count + 1 }
            : s,
        );
      }
      return [
        ...prev,
        { userId: params.userId, productId: params.productId, count: 1 },
      ];
    });

    return reviewId;
  }

  function approveReview(reviewId: string) {
    setReviews((prev) => {
      const review = prev.find((r) => r.reviewId === reviewId);
      if (!review) return prev;
      const updated = prev.map((r) =>
        r.reviewId === reviewId
          ? { ...r, status: "published" as ReviewStatus }
          : r,
      );
      // Credit coins after manual approval
      internalCreditCoins({ ...review, status: "published" });
      return updated;
    });
  }

  function rejectReview(reviewId: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId
          ? { ...r, status: "flagged" as ReviewStatus }
          : r,
      ),
    );
  }

  function editReview(reviewId: string, newText: string) {
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId ? { ...r, reviewText: newText } : r,
      ),
    );
  }

  function deleteAndBlockUser(reviewId: string, userId: string) {
    setReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
    setBlockedUsers((prev) => {
      if (prev.includes(userId)) return prev;
      return [...prev, userId];
    });
  }

  function getApprovedReviews(productId: string): ProductReview[] {
    return reviews.filter(
      (r) => r.productId === productId && r.status === "published",
    );
  }

  function getPendingReviews(): ProductReview[] {
    return reviews.filter(
      (r) => r.status === "pending" || r.status === "scheduled",
    );
  }

  function getScheduledReviews(): ProductReview[] {
    return reviews.filter((r) => r.status === "scheduled");
  }

  function getFlaggedReviews(): ProductReview[] {
    return reviews.filter((r) => r.status === "flagged");
  }

  function isUserBlocked(userId: string): boolean {
    return blockedUsers.includes(userId);
  }

  function getProductAverageRating(productId: string): {
    averageRating: number;
    reviewCount: number;
  } {
    const published = reviews.filter(
      (r) => r.productId === productId && r.status === "published",
    );
    if (published.length === 0) return { averageRating: 0, reviewCount: 0 };
    const avg =
      published.reduce((sum, r) => sum + r.rating, 0) / published.length;
    return { averageRating: avg, reviewCount: published.length };
  }

  function getSubmissionCount(userId: string, productId: string): number {
    return (
      submissions.find((s) => s.userId === userId && s.productId === productId)
        ?.count ?? 0
    );
  }

  function getCoinsEarned(userId: string, productId: string): number {
    return (
      rewardHistory.find(
        (r) => r.userId === userId && r.productId === productId,
      )?.coinsEarned ?? 0
    );
  }

  function recordCoinsEarned(userId: string, productId: string, coins: number) {
    setRewardHistory((prev) => {
      const existing = prev.find(
        (r) => r.userId === userId && r.productId === productId,
      );
      if (existing) {
        return prev.map((r) =>
          r.userId === userId && r.productId === productId
            ? { ...r, coinsEarned: r.coinsEarned + coins }
            : r,
        );
      }
      return [...prev, { userId, productId, coinsEarned: coins }];
    });
  }

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        submitReview,
        approveReview,
        rejectReview,
        editReview,
        deleteAndBlockUser,
        getApprovedReviews,
        getPendingReviews,
        getScheduledReviews,
        getFlaggedReviews,
        getProductAverageRating,
        getSubmissionCount,
        getCoinsEarned,
        recordCoinsEarned,
        isUserBlocked,
        blockedUsers,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  return useContext(ReviewContext);
}
