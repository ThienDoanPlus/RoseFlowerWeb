/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export type AppView = 'storefront' | 'staff' | 'admin';
export type StaffTab = 'kanban' | 'chat' | 'inventory';
export type AdminTab = 'overview' | 'flowers' | 'vouchers' | 'users' | 'reviews';

export type SizeVariant = 'standard' | 'deluxe' | 'premium';

export interface Flower {
  id: string;
  name: string;
  botanicalName: string;
  categoryId: string;
  basePrice: number;
  salePrice?: number;
  imageUrl: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  meaning: string;
  careGuide: string;
  occasions: string[];
  recipients?: string[];
  designStyle?: string;
  colorTone?: string;
  flowerType?: string;
  priceRangeCategory?: string;
  ratingAvg: number;
  reviewsCount: number;
  isInStock: boolean;
  isFeatured?: boolean;
  bloomSeason?: string;
  flowerCountDescription?: {
    standard: string;
    deluxe: string;
    premium: string;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  flowerCount: number;
  icon?: string;
}

export interface CartItem {
  id: string; // unique item id based on flower.id + variant
  flower: Flower;
  sizeVariant: SizeVariant;
  unitPrice: number;
  quantity: number;
  cardMessage?: string;
  selectedAddons?: string[];
}

export interface Voucher {
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  minQuantity?: number;
  isHolidaySpecial?: boolean;
  holidayTag?: string;
  validUntil: string;
}

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  phone: string;
  operatingHours: string;
  lat: number;
  lng: number;
}

export interface DeliveryInfo {
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  address: string;
  district: string;
  city: string;
  branchId: string;
  distanceKm: number;
  deliveryDate: string;
  deliveryTimeSlot: string;
  cardMessage: string;
  senderName: string;
  isAnonymousSender?: boolean;
}

export type PaymentMethod = 'VIETQR' | 'MOMO' | 'VNPAY' | 'ZALOPAY' | 'COD';

export type OrderStatus = 'PENDING' | 'ARRANGING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  items: CartItem[];
  deliveryInfo: DeliveryInfo;
  subtotal: number;
  discountAmount: number;
  bulkDiscountAmount: number;
  shippingFee: number;
  totalAmount: number;
  voucherCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID';
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  transactionCode?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  floristNotes?: string;
}

export interface Review {
  id: string;
  flowerId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerifiedBuyer: boolean;
  isApproved?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: Role;
  phone?: string;
  savedAddress?: string;
  district?: string;
  city?: string;
  dateJoined?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order' | 'promo' | 'system';
  read: boolean;
  orderId?: string;
}

export interface GmailEmail {
  id: string;
  to: string;
  subject: string;
  date: string;
  orderId: string;
  totalAmount: number;
  recipientName: string;
  deliveryAddress: string;
  deliveryTime: string;
  greetingMessage?: string;
  senderSignature?: string;
  paymentMethod: PaymentMethod;
  itemsSummary: { name: string; variant: string; quantity: number; price: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'staff' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  orderId?: string;
}

export interface TestResult {
  name: string;
  description: string;
  passed: boolean;
  durationMs: number;
  expected: unknown;
  actual: unknown;
  error?: string;
}
