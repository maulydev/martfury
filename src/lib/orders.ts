import { authFetch } from './auth-client';

/**
 * Client for the backend's order/payment endpoints, mirroring the web
 * checkout flow (~/Desktop/ecommerce-project's src/app/checkout/page.tsx +
 * src/app/checkout/success/page.tsx):
 *
 *  1. POST /api/order-payment creates the real Order (the server recomputes
 *     subtotal/discount/total itself and reserves stock — it does not trust
 *     the client's `amount` for anything but the payment session) and starts
 *     a Stripe Checkout Session or Paystack transaction, returning
 *     { authorizationUrl, reference }.
 *  2. The client opens `authorizationUrl` (a hosted payment page) and, once
 *     the browser is dismissed, calls GET /api/orders/reference/{reference}.
 *     The backend has no payment webhook — that GET call is what actually
 *     flips the order to PAID (a deliberately thin demo shortcut on the
 *     backend, not something this client can harden). Mirrors
 *     success/page.tsx exactly, just triggered by the in-app browser closing
 *     instead of a provider redirect (see checkout/success.tsx).
 *
 * Response envelope is { message, data } on success and { message } on
 * error (see the backend's lib/api-response.ts / lib/api-handler.ts) —
 * different from auth-client.ts's authFetch callers, which hit Better
 * Auth's own { success, data, error } routes instead.
 */

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export type OrderItem = {
  id: string;
  qty: number;
  lineTotal: string;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      image: string | null;
    };
  };
};

export type Order = {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discountTotal: string;
  total: string;
  createdAt: string;
  items: OrderItem[];
};

export class OrderApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'OrderApiError';
    this.status = status;
  }
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && typeof (body as any).message === 'string'
        ? (body as any).message
        : `Request failed with status ${res.status}`;
    throw new OrderApiError(message, res.status);
  }
  return body as T;
}

export type PaymentGateway = 'stripe' | 'paystack';

export type InitiateOrderPaymentInput = {
  email: string;
  amount: number;
  gateway: PaymentGateway;
  couponCode?: string;
  items: { variantId: string; quantity: number }[];
  /** Shipping/contact details — carried through as a JSON string, same as web. */
  metadata?: Record<string, string>;
};

export async function initiateOrderPayment(
  input: InitiateOrderPaymentInput,
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await authFetch('/api/order-payment', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    }),
  });
  const body = await parseOrThrow<{ data: { authorizationUrl: string; reference: string } }>(res);
  return body.data;
}

export async function getOrderByReference(reference: string): Promise<Order> {
  const res = await authFetch(`/api/orders/reference/${encodeURIComponent(reference)}`);
  const body = await parseOrThrow<{ data: Order }>(res);
  return body.data;
}

export type ValidatedCoupon = {
  id: string;
  code: string;
  type: 'PERCENT' | 'AMOUNT';
  value: number;
};

export async function validateCoupon(code: string, subtotal: number): Promise<ValidatedCoupon> {
  const res = await authFetch('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
  const body = await parseOrThrow<{ data: { coupon: ValidatedCoupon } }>(res);
  return body.data.coupon;
}

/**
 * "My Orders" (~/Desktop/ecommerce-project's src/components/account/order.tsx
 * + .../account/orders/[id]/page.tsx). Both GET /api/orders/mine and
 * GET /api/orders/mine/{id} require a signed-in session (401 without one) —
 * unlike the checkout endpoints above, which allow guest checkout.
 */

export type OrderListItem = {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discountTotal: string;
  total: string;
  currency: string;
  createdAt: string;
  items: { id: string; qty: number }[];
  _count: { items: number };
};

export type OrderDetailItem = {
  id: string;
  qty: number;
  unitPrice: string;
  lineTotal: string;
  variant: {
    id: string;
    name: string;
    product: {
      id: string;
      name: string;
      image: string | null;
      images: { id: string; url: string }[];
    };
  };
};

export type OrderPayment = {
  id: string;
  provider: 'STRIPE' | 'PAYSTACK' | 'FLUTTERWAVE' | 'CASH' | 'OTHER';
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  amount: string;
  currency: string;
  reference: string | null;
  /** JSON-encoded shipping/contact details, same shape checkout submitted. */
  metadata: string | null;
  createdAt: string;
};

export type OrderDetail = {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discountTotal: string;
  total: string;
  currency: string;
  createdAt: string;
  items: OrderDetailItem[];
  payments: OrderPayment[];
  coupon: { id: string; code: string } | null;
  user: { id: string; name: string | null; email: string } | null;
};

export type OrderShippingInfo = {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address?: string;
  suburb?: string;
  country?: string;
  state?: string;
  postcode?: string;
  phone?: string;
};

/** The most recent payment carrying shipping metadata, parsed — mirrors the
 * web order-detail page's `order.payments.find(p => p.metadata)`. */
export function getOrderShippingInfo(order: OrderDetail): OrderShippingInfo | null {
  const paymentWithMeta = order.payments.find((p) => p.metadata);
  if (!paymentWithMeta?.metadata) return null;
  try {
    return JSON.parse(paymentWithMeta.metadata) as OrderShippingInfo;
  } catch {
    return null;
  }
}

export async function getMyOrders(): Promise<OrderListItem[]> {
  const res = await authFetch('/api/orders/mine');
  const body = await parseOrThrow<{ data: OrderListItem[] }>(res);
  return body.data;
}

export async function getMyOrderDetail(id: string): Promise<OrderDetail> {
  const res = await authFetch(`/api/orders/mine/${encodeURIComponent(id)}`);
  const body = await parseOrThrow<{ data: OrderDetail }>(res);
  return body.data;
}

/** Resumes payment on a still-PENDING order — same authorizationUrl/reference
 * flow as initiateOrderPayment, just against an order that already exists. */
export async function payExistingOrder(
  id: string,
  gateway: PaymentGateway,
): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await authFetch(`/api/orders/mine/${encodeURIComponent(id)}/pay`, {
    method: 'POST',
    body: JSON.stringify({ gateway }),
  });
  const body = await parseOrThrow<{ data: { authorizationUrl: string; reference: string } }>(res);
  return body.data;
}
