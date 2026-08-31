import { authFetch } from './auth-client';

/**
 * Client for the backend's review endpoint (POST /api/products/[id]/reviews
 * — src/app/api/products/[id]/reviews/route.ts), mirroring the web app's
 * useCreateReview (src/client/reviews.ts). Requires a signed-in session —
 * the backend calls requireServerSession() and 401s without one — so
 * callers should gate the review form on useSession() same as web gates
 * showing the "Write a Review" box.
 *
 * Response envelope is { message, data } on success and { message } on
 * error, same as lib/orders.ts.
 */

export class ReviewApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ReviewApiError';
    this.status = status;
  }
}

export type CreateReviewInput = {
  productId: string;
  rating: number;
  comment?: string;
};

export async function createReview(input: CreateReviewInput): Promise<void> {
  const res = await authFetch(`/api/products/${encodeURIComponent(input.productId)}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating: input.rating, comment: input.comment }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body && typeof body === 'object' && typeof (body as any).message === 'string'
        ? (body as any).message
        : `Request failed with status ${res.status}`;
    throw new ReviewApiError(message, res.status);
  }
}
