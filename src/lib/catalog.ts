import { baseURL, DEFAULT_FETCH_TIMEOUT_MS } from './env';

/**
 * Client for the backend's public catalog endpoints (GET /api/products,
 * GET /api/categories). Both are unauthenticated reads, so unlike
 * auth-client.ts's authFetch this needs no cookie/Origin handling — just the
 * same base URL and the same generous timeout (this dev backend cold-compiles
 * routes on first hit).
 */

export type ApiVariant = {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  salePrice: string | null;
  options: Record<string, string> | null;
  inventory: { id: string; stock: number } | null;
};

export type ApiProductImage = {
  id: string;
  url: string;
};

export type ApiReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type ApiProduct = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  categories: { category: { id: string; name: string; slug: string } }[];
  images: ApiProductImage[];
  variants: ApiVariant[];
  vendor?: { name: string } | null;
  rating?: number;
  reviews?: ApiReview[];
};

export type ApiPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

// Mirrors the backend's listProductsSchema sort enum
// (src/server/products/products.validators.ts).
export type ProductSort =
  | 'newest'
  | 'oldest'
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc';

export type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  _count: { products: number };
};

type ApiListResponse<T> = {
  message: string;
  data: T;
};

/**
 * Thrown by fetchJSON on a non-OK response, carrying the HTTP status so
 * callers can tell "not found" apart from other failures (e.g. the product
 * detail screen showing a dedicated 404 state).
 */
export class ApiRequestError extends Error {
  status: number;
  constructor(path: string, status: number) {
    super(`Request to ${path} failed with status ${status}`);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${baseURL}${path}`, { signal: controller.signal });
    if (!res.ok) {
      throw new ApiRequestError(path, res.status);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getCategories(params?: { limit?: number }): Promise<ApiCategory[]> {
  const query = params?.limit ? `?limit=${params.limit}` : '';
  const res = await fetchJSON<ApiListResponse<{ categories: ApiCategory[] }>>(
    `/api/categories${query}`,
  );
  return res.data.categories;
}

export type GetProductsParams = {
  category?: string;
  categories?: string[];
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
};

export type GetProductsResult = {
  products: ApiProduct[];
  pagination: ApiPagination;
};

export async function getProducts(params: GetProductsParams): Promise<GetProductsResult> {
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.categories?.length) query.set('categories', params.categories.join(','));
  if (params.q) query.set('q', params.q);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.rating !== undefined) query.set('rating', String(params.rating));
  if (params.sort) query.set('sort', params.sort);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const res = await fetchJSON<ApiListResponse<GetProductsResult>>(
    `/api/products?${query.toString()}`,
  );
  return res.data;
}

/**
 * Fetches a single product for the product detail screen
 * (GET /api/products/[id] — src/app/api/products/[id]/route.ts on the
 * backend). Throws ApiRequestError with status 404 when the product doesn't
 * exist or isn't ACTIVE (the backend only returns inactive products to an
 * admin session, which this app never has).
 */
export async function getProduct(id: string): Promise<ApiProduct> {
  const res = await fetchJSON<ApiListResponse<ApiProduct>>(`/api/products/${id}`);
  return res.data;
}

/**
 * Product price lives on its variants, not the product itself. Mirrors the
 * backend's own web frontend (src/components/shop/product-grid.tsx): prefer
 * a variant that's actually on sale, otherwise the first variant.
 */
export function getProductPricing(product: ApiProduct): { price: number; oldPrice: number | null } {
  const variants = product.variants ?? [];
  if (!variants.length) return { price: 0, oldPrice: null };

  const onSale = variants.find((v) => Number(v.salePrice) > 0);
  const variant = onSale ?? variants[0];

  const price = Number(variant.salePrice || variant.price || 0);
  const oldPrice = Number(variant.salePrice) > 0 ? Number(variant.price || 0) : null;
  return { price, oldPrice };
}

/**
 * The variant a "quick add to cart" action should use — same selection as
 * getProductPricing (prefer a variant on sale, else the first one). Mirrors
 * the web frontend's pickDisplayVariant (src/components/shop/product-grid.tsx).
 */
export function getDefaultVariant(product: ApiProduct): ApiVariant | null {
  const variants = product.variants ?? [];
  if (!variants.length) return null;
  return variants.find((v) => Number(v.salePrice) > 0) ?? variants[0];
}

/**
 * The id a product is keyed by in the cart store — its default variant's id,
 * falling back to the product id for products without variants. Use this
 * anywhere the UI needs to check "is this product in the cart" (product
 * cards, product detail), so it matches whatever addItem/addItemWithQty
 * actually stored.
 */
export function getCartItemId(product: ApiProduct): string {
  return getDefaultVariant(product)?.id ?? product.id;
}

export function getProductImage(product: ApiProduct): string | undefined {
  return product.image ?? product.images?.[0]?.url;
}

export function getProductCategoryName(product: ApiProduct): string | undefined {
  return product.categories?.[0]?.category.name;
}

export function getProductInStock(product: ApiProduct): boolean {
  const variants = product.variants ?? [];
  if (!variants.length) return true;
  return variants.some((v) => (v.inventory?.stock ?? 0) > 0);
}

/**
 * The backend doesn't return a precomputed rating — average it from the
 * product's reviews (mirrors the web frontend's normalizeProduct in
 * src/lib/product-normalizer.ts).
 */
export function getProductRating(product: ApiProduct): { rating: number; reviews: number } {
  if (typeof product.rating === 'number') {
    return { rating: product.rating, reviews: product.reviews?.length ?? 0 };
  }
  const reviews = product.reviews ?? [];
  if (!reviews.length) return { rating: 0, reviews: 0 };
  const rating = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length;
  return { rating, reviews: reviews.length };
}
