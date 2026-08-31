export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  category: string;
  categoryId: string;
  images: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
}
