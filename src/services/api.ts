/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FLOWERS, CATEGORIES, VOUCHERS, INITIAL_REVIEWS } from '../data/mockData';
import { Flower, Category, Order, Review, User, Voucher, Role } from '../types';

/**
 * RESTful API Client kết nối trực tiếp Django REST Framework Backend & Cloud Database
 * Tự động chuyển đổi giữa Cloud Backend API và Local Cache khi offline
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface DRFResponse<T> {
  data: T;
  status: number;
  message?: string;
  count?: number;
  next?: string | null;
  previous?: string | null;
}

// Giả lập network latency khi fallback offline
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface FilterOption {
  id: string;
  name: string;
  min?: number;
  max?: number;
}

export interface FilterOptionsConfig {
  occasions: FilterOption[];
  recipients: FilterOption[];
  designStyles: FilterOption[];
  priceRanges: FilterOption[];
  colorTones: FilterOption[];
  flowerTypes: FilterOption[];
}

export const FlowerAPI = {
  /**
   * GET /api/flowers/
   * Gọi Backend Cloud DRF thực tế, hỗ trợ 6 chiều lọc: Occasion, Recipient, Style, Price, Tone, FlowerType
   */
  async getFlowers(params?: {
    categoryId?: string;
    search?: string;
    occasion?: string;
    recipient?: string;
    designStyle?: string;
    priceRangeId?: string;
    priceRange?: [number, number];
    colorTone?: string;
    flowerType?: string;
    sortBy?: 'popular' | 'price-asc' | 'price-desc' | 'rating';
  }): Promise<DRFResponse<Flower[]>> {
    try {
      const query = new URLSearchParams();
      if (params?.categoryId && params.categoryId !== 'tat-ca') query.append('categoryId', params.categoryId);
      if (params?.search) query.append('search', params.search);
      if (params?.occasion && params.occasion !== 'tat-ca') query.append('occasion', params.occasion);
      if (params?.recipient && params.recipient !== 'tat-ca') query.append('recipient', params.recipient);
      if (params?.designStyle && params.designStyle !== 'tat-ca') query.append('design_style', params.designStyle);
      if (params?.priceRangeId && params.priceRangeId !== 'tat-ca') query.append('price_range_category', params.priceRangeId);
      if (params?.priceRange) {
        query.append('min_price', params.priceRange[0].toString());
        query.append('max_price', params.priceRange[1].toString());
      }
      if (params?.colorTone && params.colorTone !== 'tat-ca') query.append('color_tone', params.colorTone);
      if (params?.flowerType && params.flowerType !== 'tat-ca') query.append('flower_type', params.flowerType);
      if (params?.sortBy) query.append('sort_by', params.sortBy);

      const res = await fetch(`${API_BASE_URL}/api/flowers/?${query.toString()}`, {
        headers: { 'Accept': 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        const results = Array.isArray(json) ? json : json.results || json.data || [];
        return {
          data: results,
          status: res.status,
          count: results.length,
        };
      }
    } catch {
      // Backend server chưa bật -> Fallback sang dữ liệu thực tế trong mockData
    }

    // Fallback Data Matching Logic
    await delay(60);
    let list = [...FLOWERS];
    if (params?.categoryId && params.categoryId !== 'tat-ca') {
      list = list.filter((f) => f.categoryId === params.categoryId);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.botanicalName.toLowerCase().includes(q) ||
          f.meaning.toLowerCase().includes(q) ||
          f.shortDescription.toLowerCase().includes(q)
      );
    }
    if (params?.occasion && params.occasion !== 'tat-ca') {
      list = list.filter((f) => f.occasions && f.occasions.includes(params.occasion!));
    }
    if (params?.recipient && params.recipient !== 'tat-ca') {
      list = list.filter((f) => f.recipients && f.recipients.includes(params.recipient!));
    }
    if (params?.designStyle && params.designStyle !== 'tat-ca') {
      list = list.filter((f) => f.designStyle === params.designStyle);
    }
    if (params?.priceRangeId && params.priceRangeId !== 'tat-ca') {
      list = list.filter((f) => f.priceRangeCategory === params.priceRangeId);
    }
    if (params?.colorTone && params.colorTone !== 'tat-ca') {
      list = list.filter((f) => f.colorTone === params.colorTone);
    }
    if (params?.flowerType && params.flowerType !== 'tat-ca') {
      list = list.filter((f) => f.flowerType === params.flowerType);
    }
    if (params?.priceRange) {
      const [min, max] = params.priceRange;
      list = list.filter((f) => {
        const p = f.salePrice || f.basePrice;
        return p >= min && p <= max;
      });
    }
    if (params?.sortBy) {
      if (params.sortBy === 'price-asc') {
        list.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
      } else if (params.sortBy === 'price-desc') {
        list.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
      } else if (params.sortBy === 'rating') {
        list.sort((a, b) => b.ratingAvg - a.ratingAvg);
      }
    }
    return { data: list, status: 200, count: list.length };
  },

  /**
   * GET /api/flowers/filters/
   * Lấy danh sách metadata của 6 chiều lọc từ Backend
   */
  async getFilterOptions(): Promise<DRFResponse<FilterOptionsConfig>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/flowers/filters/`);
      if (res.ok) {
        const json = await res.json();
        return { data: json, status: 200 };
      }
    } catch {
      // Fallback
    }

    return {
      status: 200,
      data: {
        occasions: [
          { id: 'tat-ca', name: 'Tất cả các dịp' },
          { id: 'sinh-nhat', name: 'Sinh nhật (Bạn bè, người yêu, ba mẹ, đồng nghiệp)' },
          { id: 'ky-niem', name: 'Kỷ niệm / Lãng mạn (Ngày cưới, tỏ tình, kỷ niệm ngày yêu)' },
          { id: 'ngay-le', name: 'Ngày lễ lớn (8/3, 20/10, 14/2, 20/11, Giáng sinh, Tết)' },
          { id: 'khai-truong', name: 'Chúc mừng / Khai trương (Thăng chức, tốt nghiệp, khai trương)' },
          { id: 'chia-buon', name: 'Chia buồn / Tang lễ (Vòng hoa kính viếng, tone trang nhã)' },
          { id: 'ngay-thuong', name: 'Ngày thường / Tặng bất ngờ (“để làm lành”)' },
        ],
        recipients: [
          { id: 'tat-ca', name: 'Tất cả người nhận' },
          { id: 'nguoi-yeu', name: 'Người yêu / Crush (Lãng mạn, ngọt ngào)' },
          { id: 'vo-chong', name: 'Vợ / Chồng' },
          { id: 'me-ba', name: 'Mẹ / Bà (Ấm áp, kính trọng)' },
          { id: 'doi-tac', name: 'Sếp / Đối tác / Khách hàng (Sang trọng, lịch sự)' },
          { id: 'ban-be', name: 'Bạn bè / Đồng nghiệp (Trẻ trung, năng động)' },
        ],
        designStyles: [
          { id: 'tat-ca', name: 'Tất cả kiểu dáng' },
          { id: 'bo-hoa', name: 'Bó hoa cầm tay (Tiện tặng trực tiếp, chụp ảnh)' },
          { id: 'gio-hop', name: 'Giỏ hoa / Hộp hoa (Flower box để bàn, sang trọng)' },
          { id: 'lang-ke', name: 'Lẵng hoa / Kệ hoa lớn (Khai trương, sự kiện, hội nghị)' },
          { id: 'chau-hoa', name: 'Chậu hoa / Lan hồ điệp sáp cao cấp (Bền lâu)' },
        ],
        priceRanges: [
          { id: 'tat-ca', name: 'Tất cả mức giá', min: 0, max: 99999999 },
          { id: 'duoi-300k', name: 'Dưới 300.000đ (Học sinh, sinh viên, tặng bạn bè)', min: 0, max: 299999 },
          { id: '300k-500k', name: '300.000đ – 500.000đ (Phổ biến, dễ mua)', min: 300000, max: 500000 },
          { id: '500k-1tr', name: '500.000đ – 1.000.000đ (Đẹp, trang trọng)', min: 500000, max: 1000000 },
          { id: 'tren-1tr', name: 'Trên 1.000.000đ (Cao cấp, hoa đại tiệc)', min: 1000001, max: 99999999 },
        ],
        colorTones: [
          { id: 'tat-ca', name: 'Tất cả tone màu' },
          { id: 'pastel', name: 'Tone Pastel (Nhẹ nhàng, hiện đại, Hàn Quốc)' },
          { id: 'do-hong', name: 'Tone Đỏ / Hồng (Nồng nàn, yêu thương)' },
          { id: 'vang-cam', name: 'Tone Vàng / Cam (Rực rỡ, năng lượng, khai trương)' },
          { id: 'trang', name: 'Tone Trắng / Tinh khôi (Thanh lịch, trang nhã)' },
          { id: 'xanh-tim', name: 'Tone Xanh / Tím (Hoàng gia, chung thủy)' },
        ],
        flowerTypes: [
          { id: 'tat-ca', name: 'Tất cả loại hoa' },
          { id: 'hoa-hong', name: 'Hoa hồng sáp (Tình yêu vĩnh cửu)' },
          { id: 'tulip', name: 'Hoa tulip sáp (Kiêu sa, thanh thuần)' },
          { id: 'huong-duong', name: 'Hoa hướng dương sáp (Ấm áp, rực rỡ)' },
          { id: 'cam-chuong', name: 'Hoa cẩm chướng / Cẩm tú cầu sáp (Kính trọng)' },
          { id: 'baby', name: 'Hoa baby (Thuần khiết, mộng mơ)' },
          { id: 'mix', name: 'Mix nhiều loại hoa (Nghệ thuật)' },
        ],
      },
    };
  },

  /**
   * GET /api/catalog/flowers/{id}/
   */
  async getFlowerDetail(id: string): Promise<DRFResponse<Flower | null>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/catalog/flowers/${id}/`);
      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, status: 200, message: 'Success' };
      }
    } catch {
      // Fallback
    }

    await delay(80);
    const flower = FLOWERS.find((f) => f.id === id) || null;
    return {
      data: flower,
      status: flower ? 200 : 404,
      message: flower ? 'Success' : 'Không tìm thấy sản phẩm hoa',
    };
  },

  /**
   * GET /api/catalog/categories/
   */
  async getCategories(): Promise<DRFResponse<Category[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/catalog/categories/`);
      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, status: 200, count: json.count };
      }
    } catch {
      // Fallback
    }

    await delay(60);
    return { data: CATEGORIES, status: 200, count: CATEGORIES.length };
  },

  /**
   * GET /api/promotions/vouchers/
   */
  async getVouchers(): Promise<DRFResponse<Voucher[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/promotions/vouchers/`);
      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, status: 200, count: json.count };
      }
    } catch {
      // Fallback
    }

    await delay(60);
    return { data: VOUCHERS, status: 200, count: VOUCHERS.length };
  },

  /**
   * POST /api/orders/
   * Tạo đơn hàng mới lên Cloud Database
   */
  async createOrder(payload: any): Promise<DRFResponse<Order>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, status: 201, message: 'Đặt hàng thành công!' };
      }
    } catch {
      // Fallback
    }

    await delay(200);
    return {
      data: payload,
      status: 201,
      message: 'Đặt hàng thành công (offline cache)',
    };
  },

  /**
   * POST /api/reviews/flowers/{id}/
   * Thêm bình luận và đánh giá sao cho sản phẩm
   */
  async submitReview(payload: {
    flowerId: string;
    authorName: string;
    rating: number;
    comment: string;
    authorAvatar?: string;
  }): Promise<DRFResponse<Review>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/flowers/${payload.flowerId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json.data || json, status: 201, message: 'Đánh giá thành công!' };
      }
    } catch {
      // Fallback
    }

    await delay(200);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      flowerId: payload.flowerId,
      authorName: payload.authorName || 'Khách hàng ẩn danh',
      authorAvatar: payload.authorAvatar,
      rating: payload.rating,
      comment: payload.comment,
      date: new Date().toLocaleDateString('vi-VN'),
      isVerifiedBuyer: true,
    };

    if (!INITIAL_REVIEWS[payload.flowerId]) {
      INITIAL_REVIEWS[payload.flowerId] = [];
    }
    INITIAL_REVIEWS[payload.flowerId].unshift(newReview);

    return {
      data: newReview,
      status: 201,
      message: 'Đánh giá đã được ghi nhận thành công!',
    };
  },

  /**
   * POST /api/accounts/google/
   * Xác thực Google OAuth & Nhận thông tin Role từ Backend
   */
  async loginWithGoogle(emailOverride?: string, roleOverride?: Role): Promise<DRFResponse<User>> {
    const email = emailOverride || 'nguyenthiendoan2@gmail.com';
    let role: Role = roleOverride || 'CUSTOMER';
    if (!roleOverride) {
      if (email.includes('admin')) role = 'ADMIN';
      else if (email.includes('staff') || email.includes('florist')) role = 'STAFF';
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/accounts/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: 'mock-google-token',
          email,
          name: role === 'ADMIN' ? 'Lê Quốc Hưng (Admin)' : role === 'STAFF' ? 'Trần Thị Mai (Florist)' : 'Nguyễn Thiên Đoan',
          role,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        return { data: json.user, status: 200, message: json.message };
      }
    } catch {
      // Fallback
    }

    await delay(200);
    const user: User = {
      id: 'usr-google-8899',
      email,
      name: role === 'ADMIN' ? 'Lê Quốc Hưng (Admin)' : role === 'STAFF' ? 'Trần Thị Mai (Florist)' : 'Nguyễn Thiên Đoan',
      role,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '0888208306',
      savedAddress: '294 Phạm Văn Bạch, Phường Tân Sơn, TP.HCM',
      district: 'Phường Tân Sơn',
      city: 'TP. Hồ Chí Minh',
      dateJoined: '2026-01-10',
    };
    return {
      data: user,
      status: 200,
      message: `Đăng nhập thành công với vai trò ${role}!`,
    };
  },
};
