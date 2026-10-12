/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useReducer } from 'react';
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
} from '../types';
import {
  calculateBulkDiscount,
  calculateCartSubtotal,
  calculateOrderFinalTotal,
  calculateShippingFee,
  validateAndCalculateVoucher,
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

  // Cart
  cart: CartItem[];
  selectedBranch: BranchLocation;
  vouchers: Voucher[];
  activeVoucher: Voucher | null;
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
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;

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
  isTestRunnerOpen: boolean;
  isZaloOpen: boolean;
  isPrintCardOpen: boolean;
  isStatusUpdaterOpen: boolean;
  isCustomerChatOpen: boolean;
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
  | { type: 'UPDATE_USER_ROLE'; payload: { userId: string; role: Role } }
  | { type: 'CREATE_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus; floristNotes?: string; assignedStaffName?: string } }
  | { type: 'SET_PRINT_ORDER'; payload: Order | null }
  | { type: 'SET_UPDATE_ORDER'; payload: Order | null }
  | { type: 'SET_TRACKING_ORDER_ID'; payload: string | null }
  | { type: 'SEND_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_PUSH_NOTIFICATION'; payload: PushNotification }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'ADD_GMAIL_EMAIL'; payload: GmailEmail }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'MODERATE_REVIEW'; payload: { flowerId: string; reviewId: string; action: 'approve' | 'hide' | 'delete' } }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'info' | 'error' } | null }
  | { type: 'SET_MODAL'; payload: { modal: keyof AppState; isOpen: boolean } };

const initialDeliveryInfo: DeliveryInfo = {
  recipientName: 'Nguyễn Thiên Đoan',
  recipientPhone: '0908123456',
  recipientEmail: 'nguyenthiendoan2@gmail.com',
  address: '294 Phạm Văn Bạch',
  district: 'Phường Tân Sơn',
  city: 'TP. Hồ Chí Minh',
  branchId: BRANCHES[0].id,
  distanceKm: 1.5,
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTimeSlot: 'Giao hỏa tốc 45-60 phút',
  cardMessage: 'Chúc em mãi luôn xinh đẹp, rạng rỡ và hạnh phúc như đóa hoa sáp vĩnh cửu này!',
  senderName: 'Người gửi ẩn danh',
};

const initialUsersList: User[] = [
  {
    id: 'usr-8899',
    name: 'Nguyễn Thiên Đoan',
    email: 'nguyenthiendoan2@gmail.com',
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

const initialOrders: Order[] = [
  {
    id: 'ROSE-9821',
    items: [
      {
        id: `${FLOWERS[0]?.id || 'rose-189k-flower1'}-standard`,
        flower: FLOWERS[0],
        sizeVariant: 'standard',
        unitPrice: FLOWERS[0]?.basePrice || 189000,
        quantity: 1,
        cardMessage: 'Chúc em sinh nhật vui vẻ, tuổi mới thật rực rỡ và luôn hạnh phúc bên anh!',
      },
    ],
    deliveryInfo: {
      recipientName: 'Trần Hoàng Quân',
      recipientPhone: '0977123456',
      recipientEmail: 'hoangquan@gmail.com',
      address: '15 Lê Văn Sỹ, Phường 13, Quận 3',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh',
      branchId: BRANCHES[0].id,
      distanceKm: 6.2,
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTimeSlot: '14:00 - 16:00',
      cardMessage: 'Chúc em sinh nhật vui vẻ, tuổi mới thật rực rỡ và luôn hạnh phúc bên anh!',
      senderName: 'Quân cute',
    },
    subtotal: FLOWERS[0]?.basePrice || 189000,
    discountAmount: Math.round((FLOWERS[0]?.basePrice || 189000) * 0.1),
    bulkDiscountAmount: 0,
    shippingFee: 25000,
    totalAmount: (FLOWERS[0]?.basePrice || 189000) - Math.round((FLOWERS[0]?.basePrice || 189000) * 0.1) + 25000,
    voucherCode: 'ROSE10',
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    orderStatus: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    transactionCode: 'MB-VQR-9821-OK',
  },
  {
    id: 'ROSE-9822',
    items: [
      {
        id: `${FLOWERS[1]?.id || 'rose-259k-flower1'}-standard`,
        flower: FLOWERS[1],
        sizeVariant: 'standard',
        unitPrice: FLOWERS[1]?.basePrice || 259000,
        quantity: 1,
        cardMessage: 'Kỷ niệm 3 năm yêu nhau! Cảm ơn em đã luôn là ánh sáng dịu dàng nhất.',
      },
    ],
    deliveryInfo: {
      recipientName: 'Lê Thị Bích Ngọc',
      recipientPhone: '0903888999',
      recipientEmail: 'bichngoc@gmail.com',
      address: '88 Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh',
      district: 'Quận Bình Thạnh',
      city: 'TP. Hồ Chí Minh',
      branchId: BRANCHES[0].id,
      distanceKm: 8.5,
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTimeSlot: 'Giao hỏa tốc 45-60 phút',
      cardMessage: 'Kỷ niệm 3 năm yêu nhau! Cảm ơn em đã luôn là ánh sáng dịu dàng nhất.',
      senderName: 'Hoàng Anh',
    },
    subtotal: FLOWERS[1]?.basePrice || 259000,
    discountAmount: Math.round((FLOWERS[1]?.basePrice || 259000) * 0.1),
    bulkDiscountAmount: 0,
    shippingFee: 25000,
    totalAmount: (FLOWERS[1]?.basePrice || 259000) - Math.round((FLOWERS[1]?.basePrice || 259000) * 0.1) + 25000,
    voucherCode: 'VALENTINE142',
    paymentMethod: 'MOMO',
    paymentStatus: 'PAID',
    orderStatus: 'ARRANGING',
    assignedStaffName: 'Trần Thị Mai (Florist)',
    floristNotes: 'Đã hoàn tất kiểm tra bó hoa sáp theo hình chụp thật, đang in thiệp và đóng gói',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    transactionCode: 'MOMO-PAY-9822',
  },
  {
    id: 'ROSE-9823',
    items: [
      {
        id: `${FLOWERS[2]?.id || 'rose-279k-flower1'}-standard`,
        flower: FLOWERS[2],
        sizeVariant: 'standard',
        unitPrice: FLOWERS[2]?.basePrice || 279000,
        quantity: 1,
        cardMessage: 'Chúc cậu một ngày lễ tốt nghiệp thật rạng ngời!',
      },
    ],
    deliveryInfo: {
      recipientName: 'Phạm Thanh Tùng',
      recipientPhone: '0918222333',
      recipientEmail: 'thanhtung@gmail.com',
      address: 'Đại học Quốc Gia, TP. Thủ Đức',
      district: 'TP. Thủ Đức',
      city: 'TP. Hồ Chí Minh',
      branchId: BRANCHES[0].id,
      distanceKm: 16.0,
      deliveryDate: new Date().toISOString().split('T')[0],
      deliveryTimeSlot: '16:00 - 18:00',
      cardMessage: 'Chúc cậu một ngày lễ tốt nghiệp thật rạng ngời!',
      senderName: 'Nhóm bạn thân cấp 3',
    },
    subtotal: FLOWERS[2]?.basePrice || 279000,
    discountAmount: 0,
    bulkDiscountAmount: 0,
    shippingFee: 45000,
    totalAmount: (FLOWERS[2]?.basePrice || 279000) + 45000,
    paymentMethod: 'VNPAY',
    paymentStatus: 'PAID',
    orderStatus: 'SHIPPING',
    assignedStaffName: 'Trần Thị Mai (Florist)',
    floristNotes: 'Đã bàn giao shipper Anh Tuấn (0938 111 222), bọc 2 lớp xốp khí chống va đập',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    transactionCode: 'VNPAY-9823-TXN',
  },
  {
    id: 'ROSE-9820',
    items: [
      {
        id: `${FLOWERS[6]?.id || 'rose-679k-flower1'}-standard`,
        flower: FLOWERS[6] || FLOWERS[0],
        sizeVariant: 'standard',
        unitPrice: FLOWERS[6]?.basePrice || 679000,
        quantity: 3,
        cardMessage: 'Kính chúc Quý Công Ty Khai Trương Hồng Phát - Vạn Sự Hanh Thông!',
      },
    ],
    deliveryInfo: {
      recipientName: 'Võ Nhật Minh',
      recipientPhone: '0966777888',
      recipientEmail: 'nhatminh@corp.vn',
      address: '294 Phạm Văn Bạch, Phường Tân Sơn',
      district: 'Phường Tân Sơn',
      city: 'TP. Hồ Chí Minh',
      branchId: BRANCHES[0].id,
      distanceKm: 1.2,
      deliveryDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      deliveryTimeSlot: '09:00 - 11:00',
      cardMessage: 'Kính chúc Quý Công Ty Khai Trương Hồng Phát - Vạn Sự Hanh Thông!',
      senderName: 'Ban Lãnh Đạo V-Group',
    },
    subtotal: (FLOWERS[6]?.basePrice || 679000) * 3,
    discountAmount: 0,
    bulkDiscountAmount: Math.round(((FLOWERS[6]?.basePrice || 679000) * 3) * 0.1),
    shippingFee: 0,
    totalAmount: ((FLOWERS[6]?.basePrice || 679000) * 3) - Math.round(((FLOWERS[6]?.basePrice || 679000) * 3) * 0.1),
    paymentMethod: 'VIETQR',
    paymentStatus: 'PAID',
    orderStatus: 'DELIVERED',
    assignedStaffName: 'Lê Quốc Hưng (Quản lý)',
    floristNotes: 'Khách hàng ký nhận hoa tại sảnh chính, rất hài lòng với độ sang trọng',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    transactionCode: 'MB-VQR-9820-SUCCESS',
  },
];

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

const initialState: AppState = {
  currentRole: 'CUSTOMER',
  activeView: 'storefront',
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

  cart: [
    {
      id: `${FLOWERS[0]?.id || 'rose-189k-flower1'}-standard`,
      flower: FLOWERS[0],
      sizeVariant: 'standard',
      unitPrice: FLOWERS[0]?.salePrice || FLOWERS[0]?.basePrice || 189000,
      quantity: 1,
      cardMessage: 'Chúc em một đời an yên và hạnh phúc bên anh!',
    },
  ],
  selectedBranch: BRANCHES[0],
  vouchers: VOUCHERS,
  activeVoucher: VOUCHERS[0], // ROSE10
  greetingCardMessage: 'Chúc em một tuổi mới ngập tràn niềm vui, luôn xinh đẹp và rạng rỡ như những đóa hoa sáp vĩnh cửu!',
  senderName: 'Nguyễn Thiên Đoan',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTimeSlot: 'Giao hỏa tốc 45-60 phút',

  deliveryInfo: initialDeliveryInfo,
  user: initialUsersList[0],
  usersList: initialUsersList,

  orders: initialOrders,
  currentOrder: initialOrders[0],
  trackingOrderId: initialOrders[0].id,
  selectedOrderForPrint: null,
  selectedOrderForUpdate: null,

  chatMessages: initialChatMessages,

  notifications: [
    {
      id: 'notif-1',
      title: "Chào mừng bạn đến với Tiệm Hoa Rose Flowers!",
      message: 'Tặng bạn mã ROSE10 giảm 10% tại cửa hàng 294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM.',
      timestamp: 'Vừa xong',
      type: 'promo',
      read: false,
    },
  ],
  toast: null,

  gmailEmails: [],
  reviewsMap: INITIAL_REVIEWS,

  isCartOpen: false,
  isCheckoutOpen: false,
  isOrderSuccessOpen: false,
  isTrackingOpen: false,
  isGmailOpen: false,
  isAuthOpen: false,
  isTestRunnerOpen: false,
  isZaloOpen: false,
  isPrintCardOpen: false,
  isStatusUpdaterOpen: false,
  isCustomerChatOpen: false,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CURRENT_ROLE': {
      const nextRole = action.payload;
      let nextView: AppView = state.activeView;
      if (nextRole === 'STAFF') nextView = 'staff';
      else if (nextRole === 'ADMIN') nextView = 'admin';
      else nextView = 'storefront';

      return {
        ...state,
        currentRole: nextRole,
        activeView: nextView,
        user: state.user ? { ...state.user, role: nextRole } : state.user,
        toast: {
          message: `Đã chuyển sang vai trò: ${
            nextRole === 'ADMIN'
              ? 'Quản lý tiệm (ADMIN)'
              : nextRole === 'STAFF'
              ? 'Nhân viên tư vấn & Florist (STAFF)'
              : 'Khách hàng mua hoa (CUSTOMER)'
          }`,
          type: 'info',
        },
      };
    }

    case 'SET_ACTIVE_VIEW':
      return { ...state, activeView: action.payload };

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

      return {
        ...state,
        cart: newCart,
        isCartOpen: true,
        toast: { message: `Đã thêm "${flower.name}" vào giỏ hàng`, type: 'success' },
      };
    }

    case 'UPDATE_CART_QTY': {
      const { itemId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== itemId),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload.itemId),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'APPLY_VOUCHER':
      return { ...state, activeVoucher: action.payload };

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

    case 'LOGIN_USER':
      return {
        ...state,
        user: action.payload,
        currentRole: action.payload.role || 'CUSTOMER',
        isAuthOpen: false,
        deliveryInfo: {
          ...state.deliveryInfo,
          recipientEmail: action.payload.email,
          recipientName: action.payload.name,
          recipientPhone: action.payload.phone || state.deliveryInfo.recipientPhone,
        },
        toast: { message: `Xin chào, ${action.payload.name} (${action.payload.role})!`, type: 'success' },
      };

    case 'LOGOUT_USER':
      return {
        ...state,
        user: null,
        currentRole: 'CUSTOMER',
        activeView: 'storefront',
        toast: { message: 'Đã đăng xuất tài khoản', type: 'info' },
      };

    case 'UPDATE_USER_ROLE': {
      const { userId, role } = action.payload;
      const updatedList = state.usersList.map((u) => (u.id === userId ? { ...u, role } : u));
      const updatedUser = state.user?.id === userId ? { ...state.user, role } : state.user;
      return {
        ...state,
        usersList: updatedList,
        user: updatedUser,
        currentRole: state.user?.id === userId ? role : state.currentRole,
        toast: { message: `Đã cập nhật vai trò thành ${role}`, type: 'success' },
      };
    }

    case 'CREATE_ORDER':
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        currentOrder: action.payload,
        trackingOrderId: action.payload.id,
        cart: [],
        isCheckoutOpen: false,
        isOrderSuccessOpen: true,
      };

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

    case 'SET_TRACKING_ORDER_ID':
      return {
        ...state,
        trackingOrderId: action.payload,
        isTrackingOpen: true,
      };

    case 'SEND_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'ADD_PUSH_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

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

  // Computed values
  const subtotal = calculateCartSubtotal(state.cart);
  const totalQuantity = state.cart.reduce((s, i) => s + i.quantity, 0);
  const bulkDiscountInfo = calculateBulkDiscount(state.cart, subtotal);
  const voucherValidation = validateAndCalculateVoucher(state.activeVoucher, subtotal, totalQuantity);
  const shippingFee = calculateShippingFee(state.deliveryInfo.distanceKm);
  const finalTotal = calculateOrderFinalTotal(
    subtotal,
    voucherValidation.discountAmount,
    bulkDiscountInfo.bulkDiscount,
    shippingFee
  );

  const unreadNotifsCount = state.notifications.filter((n) => !n.read).length;

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
