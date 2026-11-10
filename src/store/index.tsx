/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';
import { BRANCHES, FLOWERS, CATEGORIES, VOUCHERS, INITIAL_REVIEWS } from '../data/mockData';
import { FlowerAPI } from '../services/api';
import {
  AdminTab,
  AppView,
  BranchLocation,
  CartItem,
  Category,
  ChatMessage,
  DeliveryInfo,
  Flower,
  GmailEmail,
  Order,
  OrderStatus,
  PushNotification,
  Review,
  Role,
  SizeVariant,
  StaffTab,
  User,
  Voucher,
  UsedVoucherRecord,
} from '../types';
import {
  calculateBulkDiscount,
  calculateCartSubtotal,
  calculateOrderFinalTotal,
  calculateShippingFee,
  validateAndCalculateVoucher,
  formatVND,
} from '../utils/calculations';

export interface AppState {
  // Navigation & Role RBAC
  currentRole: Role;
  activeView: AppView;
  staffActiveTab: StaffTab;
  adminActiveTab: AdminTab;

  // Catalog & 6-Dimensional Filters
  flowers: Flower[];
  categories: Category[];
  selectedCategory: string;
  selectedOccasion: string;
  selectedRecipient: string;
  selectedDesignStyle: string;
  selectedPriceRangeId: string;
  selectedColorTone: string;
  selectedFlowerType: string;
  searchQuery: string;
  priceRange: [number, number];
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  selectedFlower: Flower | null;
  productPageFlower: Flower | null;

  // Cart
  cart: CartItem[];
  selectedBranch: BranchLocation;
  vouchers: Voucher[];
  activeVoucher: Voucher | null;
  usedVouchers: UsedVoucherRecord[];
  greetingCardMessage: string;
  senderName: string;
  deliveryDate: string;
  deliveryTimeSlot: string;

  // Delivery
  deliveryInfo: DeliveryInfo;

  // Auth & User Management
  user: User | null;
  usersList: User[];

  // Orders
  orders: Order[];
  currentOrder: Order | null;
  trackingOrderId: string | null;
  selectedOrderForPrint: Order | null;
  selectedOrderForUpdate: Order | null;

  // Chat Consultation
  chatMessages: ChatMessage[];

  // Notifications
  notifications: PushNotification[];
  toast: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null;

  // Gmail Inbox Simulation
  gmailEmails: GmailEmail[];

  // Reviews dictionary
  reviewsMap: Record<string, Review[]>;

  // Modals / Drawers UI
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderSuccessOpen: boolean;
  isTrackingOpen: boolean;
  isGmailOpen: boolean;
  isAuthOpen: boolean;
  isZaloOpen: boolean;
  isPrintCardOpen: boolean;
  isStatusUpdaterOpen: boolean;
  isCustomerChatOpen: boolean;
  isAccountSettingsOpen: boolean;
}

export type Action =
  | { type: 'SET_CURRENT_ROLE'; payload: Role }
  | { type: 'SET_ACTIVE_VIEW'; payload: AppView }
  | { type: 'SET_STAFF_TAB'; payload: StaffTab }
  | { type: 'SET_ADMIN_TAB'; payload: AdminTab }
  | { type: 'SET_FLOWERS'; payload: Flower[] }
  | { type: 'ADD_FLOWER'; payload: Flower }
  | { type: 'UPDATE_FLOWER'; payload: Flower }
  | { type: 'DELETE_FLOWER'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_OCCASION'; payload: string }
  | { type: 'SET_RECIPIENT'; payload: string }
  | { type: 'SET_DESIGN_STYLE'; payload: string }
  | { type: 'SET_PRICE_RANGE_ID'; payload: string }
  | { type: 'SET_COLOR_TONE'; payload: string }
  | { type: 'SET_FLOWER_TYPE'; payload: string }
  | { type: 'RESET_ALL_FILTERS' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_PRICE_RANGE'; payload: [number, number] }
  | { type: 'SET_SORT'; payload: 'popular' | 'price-asc' | 'price-desc' | 'rating' }
  | { type: 'SELECT_FLOWER'; payload: Flower | null }
  | { type: 'NAVIGATE_TO_PRODUCT_PAGE'; payload: Flower }
  | { type: 'ADD_TO_CART'; payload: { flower: Flower; sizeVariant: SizeVariant; quantity: number; cardMessage?: string } }
  | { type: 'UPDATE_CART_QTY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_VOUCHER'; payload: Voucher | null }
  | { type: 'ADD_VOUCHER'; payload: Voucher }
  | { type: 'UPDATE_VOUCHER'; payload: Voucher }
  | { type: 'DELETE_VOUCHER'; payload: string }
  | { type: 'SET_BRANCH'; payload: BranchLocation }
  | { type: 'UPDATE_DELIVERY_INFO'; payload: Partial<DeliveryInfo> }
  | { type: 'SET_CARD_MESSAGE'; payload: string }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User> }
  | { type: 'UPDATE_USER_ROLE'; payload: { userId: string; role: Role } }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'RECORD_USED_VOUCHER'; payload: UsedVoucherRecord }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'APPROVE_ORDER_PAYMENT'; payload: { orderId: string; adminName?: string } }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus; floristNotes?: string; assignedStaffName?: string } }
  | { type: 'SET_PRINT_ORDER'; payload: Order | null }
  | { type: 'SET_UPDATE_ORDER'; payload: Order | null }
  | { type: 'SET_TRACKING_ORDER_ID'; payload: string | null }
  | { type: 'SEND_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_PUSH_NOTIFICATION'; payload: PushNotification }
  | { type: 'MARK_NOTIFICATIONS_READ'; payload?: string[] }
  | { type: 'ADD_GMAIL_EMAIL'; payload: GmailEmail }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'MODERATE_REVIEW'; payload: { flowerId: string; reviewId: string; action: 'approve' | 'hide' | 'delete' } }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'info' | 'error' | 'warning' } | null }
  | { type: 'SET_MODAL'; payload: { modal: keyof AppState; isOpen: boolean } };

const initialDeliveryInfo: DeliveryInfo = {
  recipientName: '',
  recipientPhone: '',
  recipientEmail: '',
  address: '294 Phạm Văn Bạch',
  district: 'Quận Tân Bình',
  city: 'TP. Hồ Chí Minh',
  branchId: BRANCHES[0].id,
  distanceKm: 1.2,
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTimeSlot: 'Giao hỏa tốc 45-60 phút',
  cardMessage: 'Chúc em mãi luôn xinh đẹp, rạng rỡ và hạnh phúc như đóa hoa sáp vĩnh cửu này!',
  senderName: '',
};

const initialUsersList: User[] = [
  {
    id: 'usr-8899',
    name: 'Nguyễn Văn Nam',
    email: 'customer@gmail.com',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '0908123456',
    savedAddress: '294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM',
    district: 'Phường Tân Sơn',
    city: 'TP. Hồ Chí Minh',
    dateJoined: '2026-01-10',
  },
  {
    id: 'usr-staff-01',
    name: 'Trần Thị Mai (Florist)',
    email: 'florist.mai@roseflowers.vn',
    role: 'STAFF',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    phone: '0912345678',
    savedAddress: 'Chi nhánh 294 Phạm Văn Bạch, Tân Sơn, TP.HCM',
    district: 'Phường Tân Sơn',
    city: 'TP. Hồ Chí Minh',
    dateJoined: '2026-02-15',
  },
  {
    id: 'usr-admin-01',
    name: 'Lê Quốc Hưng (Quản lý)',
    email: 'admin@roseflowers.vn',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    phone: '0988208306',
    savedAddress: 'Văn phòng Điều hành Rose Flowers, TP.HCM',
    district: 'Phường Tân Sơn',
    city: 'TP. Hồ Chí Minh',
    dateJoined: '2025-11-01',
  },
];

const initialOrders: Order[] = [];

const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'customer',
    senderName: 'Khách hàng',
    text: 'Chào shop Rose Flowers, mình muốn đặt bó 99 bông hồng sáp nhũ đỏ giao hỏa tốc đến Quận 3 trong chiều nay kịp không ạ?',
    timestamp: '14:15',
  },
  {
    id: 'msg-2',
    sender: 'staff',
    senderName: 'Trần Thị Mai (Florist)',
    text: 'Dạ chào bạn! Dạ xưởng hoa tại 294 Phạm Văn Bạch luôn có sẵn các bó 99 bông hồng sáp đã tuyển chọn kỹ càng. Shop có thể cắm hoa, in thiệp và điều shipper giao hỏa tốc đến Quận 3 chỉ trong 45-60 phút thôi ạ!',
    timestamp: '14:17',
  },
  {
    id: 'msg-3',
    sender: 'customer',
    senderName: 'Khách hàng',
    text: 'Dạ tuyệt quá, shop in giúp mình thiệp chúc mừng sinh nhật kèm chữ ký luôn nhé!',
    timestamp: '14:19',
  },
];

const loadStoredUser = (): User | null => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('rose_auth_user');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
};

const loadStoredCart = (): CartItem[] => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('rose_cart');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

const loadStoredNotifications = (): PushNotification[] => {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('rose_notifications');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

/**
 * Lọc thông báo đẩy chính xác theo vai trò và danh tính người dùng (Role-Based Notification Filtering)
 * Đảm bảo tính riêng tư và bảo mật tuyệt đối:
 * - Khách hàng chỉ thấy thông báo đơn hàng của chính mình và ưu đãi chung.
 * - Khách vãng lai không thấy đơn hàng của người khác hay thông báo nội bộ.
 * - Staff thấy thông báo phân công cắm hoa và điều phối giao hàng.
 * - Admin thấy thông báo đối soát nhận tiền VietQR, đơn hàng mới và cảnh báo hệ thống.
 */
export const filterRelevantNotifications = (
  notifications: PushNotification[],
  currentRole: Role,
  currentUser: User | null,
  currentOrderId: string | null,
  trackingOrderId: string | null,
  userOrders: Order[]
): PushNotification[] => {
  return notifications.filter((notif) => {
    // 1. Phân quyền cho ADMIN (Chủ tiệm):
    if (currentRole === 'ADMIN') {
      if (notif.targetRole === 'ADMIN' || notif.targetRole === 'ALL') return true;
      if (notif.type === 'order' && notif.targetRole !== 'CUSTOMER') return true;
      return false;
    }

    // 2. Phân quyền cho STAFF (Florist & Shipper):
    if (currentRole === 'STAFF') {
      if (notif.targetRole === 'STAFF' || notif.targetRole === 'ALL') return true;
      if (notif.type === 'order' && notif.targetRole !== 'ADMIN') return true;
      return false;
    }

    // 3. Phân quyền cho CUSTOMER (Khách hàng đã đăng nhập tài khoản):
    if (currentUser) {
      if (notif.targetUserId && notif.targetUserId === currentUser.id) return true;
      if (notif.targetUserEmail && notif.targetUserEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (notif.targetUserPhone && currentUser.phone && notif.targetUserPhone === currentUser.phone) return true;

      // Đơn hàng thuộc về chính khách này
      if (notif.orderId) {
        const isMyOrder = userOrders.some(
          (o) =>
            o.id === notif.orderId &&
            (o.userId === currentUser.id ||
              o.deliveryInfo.recipientEmail.toLowerCase() === currentUser.email.toLowerCase() ||
              (currentUser.phone && o.deliveryInfo.recipientPhone === currentUser.phone))
        );
        if (isMyOrder || notif.orderId === currentOrderId || notif.orderId === trackingOrderId) {
          return notif.targetRole === 'CUSTOMER' || notif.targetRole === 'ALL' || !notif.targetRole;
        }
        return false;
      }

      if (notif.type === 'promo') {
        return notif.targetRole === 'CUSTOMER' || notif.targetRole === 'ALL' || !notif.targetRole;
      }

      return notif.targetRole === 'CUSTOMER' || notif.targetRole === 'ALL';
    }

    // 4. Phân quyền cho GUEST (Khách vãng lai xem web, chưa đăng nhập):
    if (notif.orderId) {
      if ((currentOrderId && notif.orderId === currentOrderId) || (trackingOrderId && notif.orderId === trackingOrderId)) {
        return notif.targetRole === 'CUSTOMER' || notif.targetRole === 'ALL' || !notif.targetRole;
      }
      return false;
    }

    if (notif.type === 'promo' && (!notif.targetUserId || notif.targetRole === 'ALL' || notif.targetRole === 'CUSTOMER')) {
      return true;
    }

    return false;
  });
};

const loadStoredVoucher = (): Voucher | null => {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const voucherCode = params.get('voucher') || params.get('magiamgia') || params.get('code') || params.get('coupon');
      if (voucherCode) {
        const found = VOUCHERS.find((v) => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
        if (found) {
          localStorage.setItem('rose_active_voucher', JSON.stringify(found));
          return found;
        }
      }
      const raw = localStorage.getItem('rose_active_voucher');
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
};

const loadStoredUsedVouchers = (): UsedVoucherRecord[] => {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rose_used_vouchers');
      if (saved) return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return [];
};

export const getFlowerIdFromCurrentUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  // 1. Path format: /san-pham/:id or /san-pham/:id/
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/san-pham\/([^/?#]+)/i);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }
  // 2. Hash fallback: #/san-pham/:id
  const hash = window.location.hash;
  const hashMatch = hash.match(/#\/san-pham\/([^/?#]+)/i);
  if (hashMatch && hashMatch[1]) {
    return decodeURIComponent(hashMatch[1]);
  }
  // 3. Query param fallback: ?flower=:id or ?sp=:id
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get('flower') || params.get('sp') || params.get('san-pham');
  if (paramId) {
    return decodeURIComponent(paramId);
  }
  return null;
};

const initialFlowerId = getFlowerIdFromCurrentUrl();
const initialFlower = initialFlowerId ? FLOWERS.find((f) => f.id === initialFlowerId) || null : null;

const storedUser = loadStoredUser();

const initialState: AppState = {
  currentRole: storedUser ? storedUser.role : 'CUSTOMER',
  activeView: initialFlower ? 'product-detail' : 'storefront',
  staffActiveTab: 'kanban',
  adminActiveTab: 'overview',

  flowers: FLOWERS,
  categories: CATEGORIES,
  selectedCategory: 'tat-ca',
  selectedOccasion: 'tat-ca',
  selectedRecipient: 'tat-ca',
  selectedDesignStyle: 'tat-ca',
  selectedPriceRangeId: 'tat-ca',
  selectedColorTone: 'tat-ca',
  selectedFlowerType: 'tat-ca',
  searchQuery: '',
  priceRange: [0, 5000000],
  sortBy: 'popular',
  selectedFlower: null,
  productPageFlower: initialFlower,

  cart: loadStoredCart(),
  selectedBranch: BRANCHES[0],
  vouchers: VOUCHERS,
  activeVoucher: loadStoredVoucher(),
  usedVouchers: loadStoredUsedVouchers(),
  greetingCardMessage: 'Chúc em một tuổi mới ngập tràn niềm vui, luôn xinh đẹp và rạng rỡ như những đóa hoa sáp vĩnh cửu!',
  senderName: storedUser?.name || '',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTimeSlot: 'Giao hỏa tốc 45-60 phút',

  deliveryInfo: storedUser
    ? {
        ...initialDeliveryInfo,
        recipientEmail: storedUser.email,
        recipientName: storedUser.name,
        recipientPhone: storedUser.phone || '',
      }
    : initialDeliveryInfo,
  user: storedUser,
  usersList: initialUsersList,

  orders: [],
  currentOrder: null,
  trackingOrderId: null,
  selectedOrderForPrint: null,
  selectedOrderForUpdate: null,

  chatMessages: initialChatMessages,

  notifications: loadStoredNotifications(),
  toast: null,

  gmailEmails: [],
  reviewsMap: INITIAL_REVIEWS,

  isCartOpen: false,
  isCheckoutOpen: false,
  isOrderSuccessOpen: false,
  isTrackingOpen: false,
  isGmailOpen: false,
  isAuthOpen: false,
  isZaloOpen: false,
  isPrintCardOpen: false,
  isStatusUpdaterOpen: false,
  isCustomerChatOpen: false,
  isAccountSettingsOpen: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CURRENT_ROLE': {
      // Role is now strictly determined by the logged-in user account.
      return state;
    }

    case 'SET_ACTIVE_VIEW': {
      const targetView = action.payload;
      if (targetView === 'admin' && state.currentRole !== 'ADMIN') {
        return {
          ...state,
          activeView: 'storefront',
          selectedFlower: null,
          isAuthOpen: true,
          toast: {
            message: 'Khu vực quản trị chỉ dành cho Quản lý (ADMIN). Vui lòng đăng nhập tài khoản Quản trị!',
            type: 'error',
          },
        };
      }
      if (targetView === 'staff' && state.currentRole !== 'STAFF' && state.currentRole !== 'ADMIN') {
        return {
          ...state,
          activeView: 'storefront',
          selectedFlower: null,
          isAuthOpen: true,
          toast: {
            message: 'Bảng Florist chỉ dành cho Nhân viên hoặc Quản lý. Vui lòng đăng nhập tài khoản!',
            type: 'error',
          },
        };
      }
      return {
        ...state,
        activeView: targetView,
        productPageFlower: targetView === 'product-detail' ? state.productPageFlower : null,
      };
    }

    case 'SET_STAFF_TAB':
      return { ...state, staffActiveTab: action.payload };

    case 'SET_ADMIN_TAB':
      return { ...state, adminActiveTab: action.payload };

    case 'SET_FLOWERS':
      return { ...state, flowers: action.payload };

    case 'ADD_FLOWER':
      return {
        ...state,
        flowers: [action.payload, ...state.flowers],
        toast: { message: `Đã thêm sản phẩm "${action.payload.name}" thành công`, type: 'success' },
      };

    case 'UPDATE_FLOWER':
      return {
        ...state,
        flowers: state.flowers.map((f) => (f.id === action.payload.id ? action.payload : f)),
        toast: { message: `Đã cập nhật sản phẩm "${action.payload.name}"`, type: 'success' },
      };

    case 'DELETE_FLOWER':
      return {
        ...state,
        flowers: state.flowers.filter((f) => f.id !== action.payload),
        toast: { message: 'Đã xóa sản phẩm hoa khỏi hệ thống', type: 'info' },
      };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_OCCASION':
      return { ...state, selectedOccasion: action.payload };

    case 'SET_RECIPIENT':
      return { ...state, selectedRecipient: action.payload };

    case 'SET_DESIGN_STYLE':
      return { ...state, selectedDesignStyle: action.payload };

    case 'SET_PRICE_RANGE_ID':
      return { ...state, selectedPriceRangeId: action.payload };

    case 'SET_COLOR_TONE':
      return { ...state, selectedColorTone: action.payload };

    case 'SET_FLOWER_TYPE':
      return { ...state, selectedFlowerType: action.payload };

    case 'RESET_ALL_FILTERS':
      return {
        ...state,
        selectedCategory: 'tat-ca',
        selectedOccasion: 'tat-ca',
        selectedRecipient: 'tat-ca',
        selectedDesignStyle: 'tat-ca',
        selectedPriceRangeId: 'tat-ca',
        selectedColorTone: 'tat-ca',
        selectedFlowerType: 'tat-ca',
        searchQuery: '',
      };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };

    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };

    case 'SET_SORT':
      return { ...state, sortBy: action.payload };

    case 'SELECT_FLOWER':
      return { ...state, selectedFlower: action.payload };

    case 'NAVIGATE_TO_PRODUCT_PAGE':
      return {
        ...state,
        activeView: 'product-detail',
        productPageFlower: action.payload,
        selectedFlower: null,
      };

    case 'ADD_TO_CART': {
      const { flower, sizeVariant, quantity, cardMessage } = action.payload;
      const itemId = `${flower.id}-${sizeVariant}`;

      let multiplier = 1;
      if (sizeVariant === 'deluxe') multiplier = 1.35;
      if (sizeVariant === 'premium') multiplier = 1.75;

      const base = flower.salePrice || flower.basePrice;
      const unitPrice = Math.round(base * multiplier);

      const existingIndex = state.cart.findIndex((item) => item.id === itemId);
      let newCart = [...state.cart];

      if (existingIndex > -1) {
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
        };
      } else {
        newCart.push({
          id: itemId,
          flower,
          sizeVariant,
          unitPrice,
          quantity,
          cardMessage: cardMessage || state.greetingCardMessage,
        });
      }

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_cart', JSON.stringify(newCart));
        }
      } catch {
        // ignore
      }

      return {
        ...state,
        cart: newCart,
        isCartOpen: true,
        toast: { message: `Đã thêm "${flower.name}" vào giỏ hàng`, type: 'success' },
      };
    }

    case 'UPDATE_CART_QTY': {
      const { itemId, quantity } = action.payload;
      const newCart =
        quantity <= 0
          ? state.cart.filter((item) => item.id !== itemId)
          : state.cart.map((item) => (item.id === itemId ? { ...item, quantity } : item));
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_cart', JSON.stringify(newCart));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        cart: newCart,
      };
    }

    case 'REMOVE_FROM_CART': {
      const newCart = state.cart.filter((item) => item.id !== action.payload.itemId);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_cart', JSON.stringify(newCart));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        cart: newCart,
      };
    }

    case 'CLEAR_CART': {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rose_cart');
        }
      } catch {
        // ignore
      }
      return { ...state, cart: [] };
    }

    case 'APPLY_VOUCHER': {
      try {
        if (typeof window !== 'undefined') {
          if (action.payload) {
            localStorage.setItem('rose_active_voucher', JSON.stringify(action.payload));
          } else {
            localStorage.removeItem('rose_active_voucher');
          }
        }
      } catch {
        // ignore
      }
      return { ...state, activeVoucher: action.payload };
    }

    case 'ADD_VOUCHER':
      return {
        ...state,
        vouchers: [action.payload, ...state.vouchers],
        toast: { message: `Đã tạo mã giảm giá ${action.payload.code}`, type: 'success' },
      };

    case 'UPDATE_VOUCHER':
      return {
        ...state,
        vouchers: state.vouchers.map((v) => (v.code === action.payload.code ? action.payload : v)),
        toast: { message: `Đã cập nhật mã giảm giá ${action.payload.code}`, type: 'success' },
      };

    case 'DELETE_VOUCHER':
      return {
        ...state,
        vouchers: state.vouchers.filter((v) => v.code !== action.payload),
        toast: { message: 'Đã xóa mã voucher', type: 'info' },
      };

    case 'SET_BRANCH':
      return {
        ...state,
        selectedBranch: action.payload,
        deliveryInfo: { ...state.deliveryInfo, branchId: action.payload.id },
      };

    case 'UPDATE_DELIVERY_INFO':
      return {
        ...state,
        deliveryInfo: { ...state.deliveryInfo, ...action.payload },
      };

    case 'SET_CARD_MESSAGE':
      return { ...state, greetingCardMessage: action.payload };

    case 'LOGIN_USER': {
      const userRole = action.payload.role || 'CUSTOMER';
      const targetView = userRole === 'ADMIN' ? 'admin' : userRole === 'STAFF' ? 'staff' : 'storefront';
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_auth_user', JSON.stringify(action.payload));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        user: action.payload,
        currentRole: userRole,
        activeView: targetView,
        isAuthOpen: false,
        deliveryInfo: {
          ...state.deliveryInfo,
          recipientEmail: action.payload.email,
          recipientName: action.payload.name,
          recipientPhone: action.payload.phone || state.deliveryInfo.recipientPhone,
        },
        toast: {
          message: `Xin chào, ${action.payload.name}! Bạn đang ở giao diện ${
            userRole === 'ADMIN' ? 'Quản lý tiệm (Admin)' : userRole === 'STAFF' ? 'Bảng Florist (Staff)' : 'Cửa hàng'
          }`,
          type: 'success',
        },
      };
    }

    case 'LOGOUT_USER': {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rose_auth_user');
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        user: null,
        currentRole: 'CUSTOMER',
        activeView: 'storefront',
        deliveryInfo: {
          ...state.deliveryInfo,
          recipientEmail: '',
          recipientName: '',
          recipientPhone: '',
        },
        toast: { message: 'Đã đăng xuất tài khoản thành công', type: 'info' },
      };
    }

    case 'UPDATE_USER_PROFILE': {
      if (!state.user) return state;
      const updatedUser: User = { ...state.user, ...action.payload };
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_auth_user', JSON.stringify(updatedUser));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        user: updatedUser,
        deliveryInfo: {
          ...state.deliveryInfo,
          recipientName: updatedUser.name || state.deliveryInfo.recipientName,
          recipientPhone: updatedUser.phone || state.deliveryInfo.recipientPhone,
          recipientEmail: updatedUser.email || state.deliveryInfo.recipientEmail,
        },
        toast: { message: 'Đã cập nhật thông tin tài khoản thành công!', type: 'success' },
      };
    }

    case 'UPDATE_USER_ROLE': {
      const { userId, role } = action.payload;
      const updatedList = state.usersList.map((u) => (u.id === userId ? { ...u, role } : u));
      const updatedUser = state.user?.id === userId ? { ...state.user, role } : state.user;
      if (updatedUser && state.user?.id === userId) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('rose_auth_user', JSON.stringify(updatedUser));
          }
        } catch {
          // ignore
        }
      }
      return {
        ...state,
        usersList: updatedList,
        user: updatedUser,
        currentRole: state.user?.id === userId ? role : state.currentRole,
        toast: { message: `Đã cập nhật vai trò thành ${role}`, type: 'success' },
      };
    }

    case 'ADD_USER': {
      const newUser = action.payload;
      return {
        ...state,
        usersList: [newUser, ...state.usersList],
        toast: { message: `Đã thêm nhân sự "${newUser.name}" với vai trò ${newUser.role}`, type: 'success' },
      };
    }

    case 'RECORD_USED_VOUCHER': {
      const updatedUsedVouchers = [action.payload, ...state.usedVouchers];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_used_vouchers', JSON.stringify(updatedUsedVouchers));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        usedVouchers: updatedUsedVouchers,
      };
    }

    case 'CREATE_ORDER': {
      const newOrder = action.payload;
      let updatedUsedVouchers = state.usedVouchers;

      if (newOrder.voucherCode) {
        const orderYear = new Date(newOrder.createdAt || Date.now()).getFullYear();
        const usedRecord: UsedVoucherRecord = {
          code: newOrder.voucherCode.trim().toUpperCase(),
          usedAt: newOrder.createdAt || new Date().toISOString(),
          year: orderYear,
          orderId: newOrder.id,
          userId: newOrder.userId || state.user?.id,
          customerEmail: (newOrder.deliveryInfo?.recipientEmail || state.user?.email || '').trim().toLowerCase(),
          customerPhone: (newOrder.deliveryInfo?.recipientPhone || state.user?.phone || '').trim(),
        };
        updatedUsedVouchers = [usedRecord, ...state.usedVouchers];
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('rose_used_vouchers', JSON.stringify(updatedUsedVouchers));
            localStorage.removeItem('rose_active_voucher');
          }
        } catch {
          // ignore
        }
      }

      return {
        ...state,
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
        trackingOrderId: newOrder.id,
        cart: [],
        activeVoucher: null,
        usedVouchers: updatedUsedVouchers,
        isCheckoutOpen: false,
        isOrderSuccessOpen: true,
      };
    }

    case 'APPROVE_ORDER_PAYMENT': {
      const { orderId, adminName } = action.payload;
      const targetOrder = state.orders.find((o) => o.id === orderId);
      if (!targetOrder) return state;

      const timestampStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const adminNote = `[Admin ${adminName || 'Quản lý'} đã xác nhận nhận chuyển khoản vào STK Vietcombank (1027210627) lúc ${timestampStr} - Bắt đầu lên đơn cắm hoa]`;

      const updatedOrders = state.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            paymentStatus: 'PAID' as const,
            orderStatus: 'ARRANGING' as const,
            floristNotes: o.floristNotes ? `${o.floristNotes} | ${adminNote}` : adminNote,
            assignedStaffName: o.assignedStaffName || 'Trần Thị Mai (Florist)',
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });

      const updatedCurrent =
        state.currentOrder?.id === orderId
          ? {
              ...state.currentOrder,
              paymentStatus: 'PAID' as const,
              orderStatus: 'ARRANGING' as const,
              floristNotes: state.currentOrder.floristNotes
                ? `${state.currentOrder.floristNotes} | ${adminNote}`
                : adminNote,
              assignedStaffName: state.currentOrder.assignedStaffName || 'Trần Thị Mai (Florist)',
              updatedAt: new Date().toISOString(),
            }
          : state.currentOrder;

      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: `🎉 Đơn hàng #${orderId} đã được Admin phê duyệt thanh toán!`,
        message: `Admin đã xác nhận nhận chuyển khoản qua Vietcombank (1027210627 - NGUYEN THIEN DOAN). Tiệm hoa sáp Rose đang tiến hành lên đơn cắm hoa cho bạn!`,
        timestamp: 'Vừa xong',
        type: 'order',
        read: false,
        orderId,
      };

      const newGmail: GmailEmail = {
        id: `mail-approved-${Date.now()}`,
        to: targetOrder.deliveryInfo.recipientEmail || state.user?.email || 'customer@example.com',
        subject: `[Rose Flowers] ĐÃ NHẬN TIỀN CHUYỂN KHOẢN - Đơn hàng #${orderId} đang được cắm hoa!`,
        date: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        orderId,
        totalAmount: targetOrder.totalAmount,
        recipientName: targetOrder.deliveryInfo.recipientName,
        deliveryAddress: `${targetOrder.deliveryInfo.address}, ${targetOrder.deliveryInfo.district}, ${targetOrder.deliveryInfo.city}`,
        deliveryTime: `${targetOrder.deliveryInfo.deliveryTimeSlot} · Ngày ${targetOrder.deliveryInfo.deliveryDate}`,
        greetingMessage: targetOrder.deliveryInfo.cardMessage,
        paymentMethod: 'VIETQR',
        itemsSummary: targetOrder.items.map((item) => ({
          name: item.flower.name,
          variant: item.sizeVariant === 'standard' ? 'Tiêu chuẩn' : item.sizeVariant === 'deluxe' ? 'Thịnh soạn' : 'Vương giả',
          quantity: item.quantity,
          price: item.unitPrice * item.quantity,
        })),
      };

      const newNotifsList = [newNotif, ...state.notifications];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_notifications', JSON.stringify(newNotifsList));
        }
      } catch {
        // ignore
      }

      return {
        ...state,
        orders: updatedOrders,
        currentOrder: updatedCurrent,
        notifications: newNotifsList,
        gmailEmails: [newGmail, ...state.gmailEmails],
        toast: {
          message: `Đã phê duyệt thanh toán đơn #${orderId}! Trạng thái chuyển sang "Đang cắm hoa" & đã gửi thông báo đến khách hàng.`,
          type: 'success',
        },
      };
    }

    case 'UPDATE_ORDER_STATUS': {
      const { orderId, status, floristNotes, assignedStaffName } = action.payload;
      const updatedOrders = state.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            orderStatus: status,
            floristNotes: floristNotes !== undefined ? floristNotes : o.floristNotes,
            assignedStaffName: assignedStaffName !== undefined ? assignedStaffName : o.assignedStaffName,
            updatedAt: new Date().toISOString(),
          };
        }
        return o;
      });
      const current = state.currentOrder?.id === orderId ? { ...state.currentOrder, orderStatus: status } : state.currentOrder;

      return {
        ...state,
        orders: updatedOrders,
        currentOrder: current,
        toast: { message: `Đơn #${orderId} chuyển sang: ${status}`, type: 'success' },
      };
    }

    case 'SET_PRINT_ORDER':
      return {
        ...state,
        selectedOrderForPrint: action.payload,
        isPrintCardOpen: !!action.payload,
      };

    case 'SET_UPDATE_ORDER':
      return {
        ...state,
        selectedOrderForUpdate: action.payload,
        isStatusUpdaterOpen: !!action.payload,
      };

    case 'SET_TRACKING_ORDER_ID': {
      return {
        ...state,
        trackingOrderId: action.payload,
        isTrackingOpen: true,
      };
    }

    case 'SEND_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'ADD_PUSH_NOTIFICATION': {
      const newNotifs = [action.payload, ...state.notifications];
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_notifications', JSON.stringify(newNotifs));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        notifications: newNotifs,
      };
    }

    case 'MARK_NOTIFICATIONS_READ': {
      const idsToMark = action.payload;
      const newNotifs = state.notifications.map((n) =>
        !idsToMark || idsToMark.includes(n.id) ? { ...n, read: true } : n
      );
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('rose_notifications', JSON.stringify(newNotifs));
        }
      } catch {
        // ignore
      }
      return {
        ...state,
        notifications: newNotifs,
      };
    }

    case 'ADD_GMAIL_EMAIL':
      return {
        ...state,
        gmailEmails: [action.payload, ...state.gmailEmails],
      };

    case 'ADD_REVIEW': {
      const rev = action.payload;
      const currentList = state.reviewsMap[rev.flowerId] || [];
      return {
        ...state,
        reviewsMap: {
          ...state.reviewsMap,
          [rev.flowerId]: [{ ...rev, isApproved: true }, ...currentList],
        },
        toast: { message: 'Cảm ơn bạn đã để lại đánh giá cho sản phẩm!', type: 'success' },
      };
    }

    case 'MODERATE_REVIEW': {
      const { flowerId, reviewId, action: modAction } = action.payload;
      const currentList = state.reviewsMap[flowerId] || [];
      let updatedList = [...currentList];

      if (modAction === 'delete') {
        updatedList = updatedList.filter((r) => r.id !== reviewId);
      } else if (modAction === 'hide') {
        updatedList = updatedList.map((r) => (r.id === reviewId ? { ...r, isApproved: false } : r));
      } else if (modAction === 'approve') {
        updatedList = updatedList.map((r) => (r.id === reviewId ? { ...r, isApproved: true } : r));
      }

      return {
        ...state,
        reviewsMap: {
          ...state.reviewsMap,
          [flowerId]: updatedList,
        },
        toast: {
          message:
            modAction === 'delete'
              ? 'Đã xóa bình luận'
              : modAction === 'hide'
              ? 'Đã ẩn bình luận'
              : 'Đã duyệt bình luận hiển thị công khai',
          type: 'info',
        },
      };
    }

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    case 'SET_MODAL':
      return { ...state, [action.payload.modal]: action.payload.isOpen };

    default:
      return state;
  }
}

interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Computed values
  subtotal: number;
  totalQuantity: number;
  bulkDiscountInfo: ReturnType<typeof calculateBulkDiscount>;
  voucherValidation: ReturnType<typeof validateAndCalculateVoucher>;
  shippingFee: number;
  finalTotal: number;
  unreadNotifsCount: number;
  relevantNotifications: PushNotification[];
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto clear toast after 4s
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SHOW_TOAST', payload: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  // Nạp dữ liệu thật từ Django REST Framework Backend API khi ứng dụng khởi chạy
  useEffect(() => {
    let isMounted = true;
    async function loadRealBackendData() {
      try {
        const [flowersRes, catsRes] = await Promise.all([
          FlowerAPI.getFlowers(),
          FlowerAPI.getCategories(),
        ]);
        if (isMounted) {
          if (flowersRes.data && flowersRes.data.length > 0) {
            dispatch({ type: 'SET_FLOWERS', payload: flowersRes.data });
          }
        }
      } catch (err) {
        console.warn('Backend offline, using real cached products:', err);
      }
    }
    loadRealBackendData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Đồng bộ URL và Document Title theo Dedicated Product Page (/san-pham/:id)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      if (state.activeView === 'product-detail' && state.productPageFlower) {
        const targetPath = `/san-pham/${state.productPageFlower.id}`;
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ flowerId: state.productPageFlower.id }, '', targetPath);
        }
        document.title = `${state.productPageFlower.name} | Tiệm Hoa Sáp Rose - 294 Phạm Văn Bạch`;
      } else if (state.activeView === 'storefront') {
        if (window.location.pathname.startsWith('/san-pham/')) {
          window.history.pushState({}, '', '/');
        }
        document.title = 'Rose Flowers - Tiệm Hoa Sáp Nghệ Thuật & Thiết Kế Hoa Tinh Xảo 294 Phạm Văn Bạch';
      }
    } catch {
      // ignore
    }
  }, [state.activeView, state.productPageFlower]);

  // 2. Tự động chuyển tới trang chi tiết khi vào qua link /san-pham/:id hoặc bấm Back/Forward trình duyệt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncStateFromUrl = () => {
      try {
        const targetFlowerId = getFlowerIdFromCurrentUrl();
        if (targetFlowerId) {
          const matched = state.flowers.find((f) => f.id === targetFlowerId);
          if (matched) {
            if (!state.productPageFlower || state.productPageFlower.id !== matched.id || state.activeView !== 'product-detail') {
              dispatch({ type: 'NAVIGATE_TO_PRODUCT_PAGE', payload: matched });
            }
          }
        } else {
          // Nếu URL là trang chủ và đang ở product-detail thì quay về storefront
          if (window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.endsWith('/index.html')) {
            if (state.activeView === 'product-detail') {
              dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
            }
          }
        }
      } catch {
        // ignore
      }
    };

    // Kiểm tra ngay khi mount hoặc khi danh sách hoa được nạp
    syncStateFromUrl();

    // Lắng nghe sự kiện người dùng bấm Back / Forward trên trình duyệt
    window.addEventListener('popstate', syncStateFromUrl);
    return () => {
      window.removeEventListener('popstate', syncStateFromUrl);
    };
  }, [state.flowers]);

  // 3. Tự động nhận diện và thông báo mã ưu đãi từ Link chia sẻ (?voucher=... hoặc ?magiamgia=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const voucherCode = params.get('voucher') || params.get('magiamgia') || params.get('code') || params.get('coupon');
      if (voucherCode) {
        const matched = state.vouchers.find((v) => v.code.toUpperCase() === voucherCode.trim().toUpperCase());
        if (matched) {
          // 1. Đảm bảo hiển thị storefront để mục ưu đãi được mount
          if (state.activeView !== 'storefront') {
            dispatch({ type: 'SET_ACTIVE_VIEW', payload: 'storefront' });
          }
          if (state.selectedFlower) {
            dispatch({ type: 'SELECT_FLOWER', payload: null });
          }

          dispatch({ type: 'APPLY_VOUCHER', payload: matched });
          const discountStr = matched.discountType === 'PERCENT' ? `${matched.discountValue}%` : formatVND(matched.discountValue);
          dispatch({
            type: 'SHOW_TOAST',
            payload: {
              message: `🎉 Bạn đã nhận được mã ưu đãi ${matched.code} (Giảm ${discountStr}) từ link chia sẻ! (Áp dụng khi đơn đạt từ ${formatVND(matched.minOrderValue)})`,
              type: 'info',
            },
          });

          // 2. Cuộn mượt màn hình trực tiếp đến thẻ mã ưu đãi đó
          const scrollToVoucher = () => {
            const cardEl = document.getElementById(`voucher-${matched.code.toUpperCase()}`) || document.getElementById('vouchers');
            if (cardEl) {
              const navHeight = 96; // Trừ chiều cao thanh Header sticky (80px + 16px khoảng thở)
              const y = cardEl.getBoundingClientRect().top + window.pageYOffset - navHeight;
              window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
            }
          };

          requestAnimationFrame(scrollToVoucher);
          setTimeout(scrollToVoucher, 200);
          setTimeout(scrollToVoucher, 650);
        }
      }
    } catch {
      // ignore
    }
  }, [state.vouchers]);

  // Computed values
  const subtotal = calculateCartSubtotal(state.cart);
  const totalQuantity = state.cart.reduce((s, i) => s + i.quantity, 0);
  const bulkDiscountInfo = calculateBulkDiscount(state.cart, subtotal);
  const voucherValidation = validateAndCalculateVoucher(state.activeVoucher, subtotal, totalQuantity, {
    userId: state.user?.id,
    email: state.user?.email || state.deliveryInfo.recipientEmail,
    phone: state.user?.phone || state.deliveryInfo.recipientPhone,
    usedVouchersHistory: state.usedVouchers,
    currentYear: new Date().getFullYear(),
  });
  const shippingFee = calculateShippingFee(state.deliveryInfo.distanceKm);
  const finalTotal = calculateOrderFinalTotal(
    subtotal,
    voucherValidation.discountAmount,
    bulkDiscountInfo.bulkDiscount,
    shippingFee
  );

  const relevantNotifications = useMemo(() => {
    return filterRelevantNotifications(
      state.notifications,
      state.currentRole,
      state.user,
      state.currentOrder ? state.currentOrder.id : null,
      state.trackingOrderId,
      state.orders
    );
  }, [
    state.notifications,
    state.currentRole,
    state.user,
    state.currentOrder,
    state.trackingOrderId,
    state.orders,
  ]);

  const unreadNotifsCount = useMemo(() => {
    return relevantNotifications.filter((n) => !n.read).length;
  }, [relevantNotifications]);

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        subtotal,
        totalQuantity,
        bulkDiscountInfo,
        voucherValidation,
        shippingFee,
        finalTotal,
        unreadNotifsCount,
        relevantNotifications,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
