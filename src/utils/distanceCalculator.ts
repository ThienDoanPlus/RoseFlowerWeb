/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { calculateShippingFee } from './calculations';

/**
 * Tọa độ và thông tin trụ sở chính của Rose Flower Flagship Store
 * 294 Phạm Văn Bạch, Phường Tân Sơn, Quận Tân Bình, TP. Hồ Chí Minh
 */
export const ROSE_FLAGSHIP_COORDINATES = {
  lat: 10.8273,
  lng: 106.6385,
  address: '294 Phạm Văn Bạch, Phường Tân Sơn, Quận Tân Bình, TP. Hồ Chí Minh',
  name: 'Rose - Flagship Store Phạm Văn Bạch, TP.HCM',
};

/**
 * Danh sách 22 quận/huyện/thành phố thuộc TP. Hồ Chí Minh với tọa độ và cự ly đường bộ ước tính
 * tính từ 294 Phạm Văn Bạch (Quận Tân Bình)
 */
export interface DistrictGeoData {
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
  baseDistanceKm: number;
  minDistanceKm: number;
  maxDistanceKm: number;
}

export const TPHCM_DISTRICTS: DistrictGeoData[] = [
  {
    name: 'Quận Tân Bình',
    aliases: ['tan binh', 'tân bình', 'tanbinh', 'phường tân sơn', 'phuong tan son', 'p tân sơn', 'p. tân sơn'],
    lat: 10.8015,
    lng: 106.6545,
    baseDistanceKm: 2.2,
    minDistanceKm: 1.2,
    maxDistanceKm: 5.5,
  },
  {
    name: 'Quận Gò Vấp',
    aliases: ['go vap', 'gò vấp', 'govap'],
    lat: 10.8385,
    lng: 106.6653,
    baseDistanceKm: 3.2,
    minDistanceKm: 2.0,
    maxDistanceKm: 6.5,
  },
  {
    name: 'Quận 12',
    aliases: ['quan 12', 'quận 12', 'q12', 'q.12'],
    lat: 10.8672,
    lng: 106.6413,
    baseDistanceKm: 4.8,
    minDistanceKm: 3.0,
    maxDistanceKm: 8.5,
  },
  {
    name: 'Quận Tân Phú',
    aliases: ['tan phu', 'tân phú', 'tanphu'],
    lat: 10.7900,
    lng: 106.6280,
    baseDistanceKm: 4.2,
    minDistanceKm: 2.8,
    maxDistanceKm: 6.5,
  },
  {
    name: 'Quận Phú Nhuận',
    aliases: ['phu nhuan', 'phú nhuận', 'phunhuan'],
    lat: 10.7992,
    lng: 106.6803,
    baseDistanceKm: 6.5,
    minDistanceKm: 5.0,
    maxDistanceKm: 8.0,
  },
  {
    name: 'Quận Bình Thạnh',
    aliases: ['binh thanh', 'bình thạnh', 'binhthanh'],
    lat: 10.8106,
    lng: 106.7091,
    baseDistanceKm: 8.5,
    minDistanceKm: 6.5,
    maxDistanceKm: 10.5,
  },
  {
    name: 'Quận 3',
    aliases: ['quan 3', 'quận 3', 'q3', 'q.3'],
    lat: 10.7844,
    lng: 106.6843,
    baseDistanceKm: 8.2,
    minDistanceKm: 6.8,
    maxDistanceKm: 9.5,
  },
  {
    name: 'Quận 10',
    aliases: ['quan 10', 'quận 10', 'q10', 'q.10'],
    lat: 10.7746,
    lng: 106.6669,
    baseDistanceKm: 7.8,
    minDistanceKm: 6.5,
    maxDistanceKm: 9.2,
  },
  {
    name: 'Quận 11',
    aliases: ['quan 11', 'quận 11', 'q11', 'q.11'],
    lat: 10.7629,
    lng: 106.6504,
    baseDistanceKm: 7.2,
    minDistanceKm: 5.5,
    maxDistanceKm: 8.8,
  },
  {
    name: 'Quận 1',
    aliases: ['quan 1', 'quận 1', 'q1', 'q.1', 'ben nghe', 'bến nghé', 'ben thanh', 'bến thành'],
    lat: 10.7769,
    lng: 106.7009,
    baseDistanceKm: 10.5,
    minDistanceKm: 9.0,
    maxDistanceKm: 12.0,
  },
  {
    name: 'Quận 5',
    aliases: ['quan 5', 'quận 5', 'q5', 'q.5', 'chợ lớn', 'cho lon'],
    lat: 10.7554,
    lng: 106.6663,
    baseDistanceKm: 9.8,
    minDistanceKm: 8.2,
    maxDistanceKm: 11.5,
  },
  {
    name: 'Quận 6',
    aliases: ['quan 6', 'quận 6', 'q6', 'q.6'],
    lat: 10.7481,
    lng: 106.6352,
    baseDistanceKm: 10.8,
    minDistanceKm: 9.0,
    maxDistanceKm: 12.5,
  },
  {
    name: 'Quận Bình Tân',
    aliases: ['binh tan', 'bình tân', 'binhtan'],
    lat: 10.7654,
    lng: 106.6039,
    baseDistanceKm: 10.2,
    minDistanceKm: 7.5,
    maxDistanceKm: 14.5,
  },
  {
    name: 'Quận 4',
    aliases: ['quan 4', 'quận 4', 'q4', 'q.4'],
    lat: 10.7578,
    lng: 106.7013,
    baseDistanceKm: 12.8,
    minDistanceKm: 11.0,
    maxDistanceKm: 14.5,
  },
  {
    name: 'Quận 8',
    aliases: ['quan 8', 'quận 8', 'q8', 'q.8'],
    lat: 10.7241,
    lng: 106.6286,
    baseDistanceKm: 14.2,
    minDistanceKm: 11.5,
    maxDistanceKm: 17.0,
  },
  {
    name: 'Quận 7',
    aliases: ['quan 7', 'quận 7', 'q7', 'q.7', 'phu my hung', 'phú mỹ hưng'],
    lat: 10.7340,
    lng: 106.7218,
    baseDistanceKm: 16.5,
    minDistanceKm: 14.0,
    maxDistanceKm: 19.5,
  },
  {
    name: 'Thành phố Thủ Đức',
    aliases: ['thu duc', 'thủ đức', 'tp thu duc', 'tp thủ đức', 'quận 2', 'quan 2', 'q2', 'quận 9', 'quan 9', 'q9'],
    lat: 10.8494,
    lng: 106.7537,
    baseDistanceKm: 16.0,
    minDistanceKm: 12.5,
    maxDistanceKm: 22.0,
  },
  {
    name: 'Huyện Hóc Môn',
    aliases: ['hoc mon', 'hóc môn', 'hocmon'],
    lat: 10.8839,
    lng: 106.5898,
    baseDistanceKm: 9.8,
    minDistanceKm: 7.0,
    maxDistanceKm: 14.5,
  },
  {
    name: 'Huyện Bình Chánh',
    aliases: ['binh chanh', 'bình chánh', 'binhchanh'],
    lat: 10.6874,
    lng: 106.5939,
    baseDistanceKm: 18.5,
    minDistanceKm: 13.0,
    maxDistanceKm: 25.0,
  },
  {
    name: 'Huyện Nhà Bè',
    aliases: ['nha be', 'nhà bè', 'nhabe'],
    lat: 10.6953,
    lng: 106.7287,
    baseDistanceKm: 22.0,
    minDistanceKm: 18.0,
    maxDistanceKm: 26.5,
  },
  {
    name: 'Huyện Củ Chi',
    aliases: ['cu chi', 'củ chi', 'cuchi'],
    lat: 11.0067,
    lng: 106.5132,
    baseDistanceKm: 28.5,
    minDistanceKm: 22.0,
    maxDistanceKm: 42.0,
  },
  {
    name: 'Huyện Cần Giờ',
    aliases: ['can gio', 'cần giờ', 'cangio'],
    lat: 10.5132,
    lng: 106.8631,
    baseDistanceKm: 55.0,
    minDistanceKm: 45.0,
    maxDistanceKm: 68.0,
  },
];

/**
 * Các từ khóa tuyến đường liền kề sát tiệm Rose (294 Phạm Văn Bạch, Phường Tân Sơn, Tân Bình)
 * Khách hàng ở các tuyến đường này nằm trong bán kính Freeship (< 3.0 km)
 */
const IMMEDIATE_SURROUNDING_STREETS = [
  'phạm văn bạch',
  'pham van bach',
  'cống lở',
  'cong lo',
  'tân sơn',
  'tan son',
  'huỳnh văn nghệ',
  'huynh van nghe',
  'phan huy ích',
  'phan huy ich',
  'bạch đằng',
  'bach dang',
  'trần thị trọng',
  'tran thi trong',
  'nguyễn tư giản',
  'nguyen tu gian',
  'phường 15, tân bình',
  'phường 15 tân bình',
  'p.15 tân bình',
  'phường 12, gò vấp',
  'phường 14, gò vấp',
];

/**
 * Tính khoảng cách đường chim bay theo công thức Haversine
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const flightDistance = R * c;

  // Hệ số khúc khuỷu thực tế của đường bộ đô thị Việt Nam (trung bình 1.35x đường chim bay)
  const roadDistance = flightDistance * 1.35;
  return Number(roadDistance.toFixed(1));
}

export interface DeliveryDistanceEstimate {
  distanceKm: number;
  shippingFee: number;
  estimatedDurationMinutes: number;
  isFreeship: boolean;
  tierDescription: string;
  matchedDistrict: string;
  originAddress: string;
  destinationSummary: string;
}

/**
 * Thuật toán tính toán khoảng cách và cước vận chuyển thực tế
 * Dựa trên địa chỉ chi tiết, quận/huyện, tỉnh/thành phố của người nhận
 */
export function estimateDeliveryDistance(params: {
  address: string;
  district?: string;
  city?: string;
  branchId?: string;
}): DeliveryDistanceEstimate {
  const rawAddress = (params.address || '').toLowerCase().trim();
  const rawDistrict = (params.district || '').toLowerCase().trim();
  const rawCity = (params.city || '').toLowerCase().trim();
  const fullText = `${rawAddress} ${rawDistrict} ${rawCity}`;

  // 1. Kiểm tra nếu giao hàng ngoài TP. Hồ Chí Minh (ví dụ: Hà Nội, Đà Nẵng, Bình Dương, Long An...)
  const isOutsideHcm =
    (rawCity && !rawCity.includes('hồ chí minh') && !rawCity.includes('hcm') && !rawCity.includes('tp.hcm')) ||
    fullText.includes('hà nội') ||
    fullText.includes('ha noi') ||
    fullText.includes('đà nẵng') ||
    fullText.includes('bình dương') ||
    fullText.includes('đồng nai') ||
    fullText.includes('long an') ||
    fullText.includes('hải phòng') ||
    fullText.includes('cần thơ');

  if (isOutsideHcm) {
    const isHaNoi = fullText.includes('hà nội') || fullText.includes('ha noi');
    const distanceKm = isHaNoi ? 1150.0 : 38.0;
    const shippingFee = calculateShippingFee(distanceKm); // 70.000 ₫
    return {
      distanceKm,
      shippingFee,
      estimatedDurationMinutes: isHaNoi ? 1440 : 180,
      isFreeship: false,
      tierDescription: 'Giao liên tỉnh hỏa tốc có đóng thùng chuyên dụng bảo vệ hoa sáp',
      matchedDistrict: isHaNoi ? 'Hà Nội' : 'Tỉnh ngoài TP.HCM',
      originAddress: ROSE_FLAGSHIP_COORDINATES.address,
      destinationSummary: params.address ? `${params.address}, ${params.city || 'Tỉnh khác'}` : 'Ngoại tỉnh',
    };
  }

  // 2. Kiểm tra nếu địa chỉ nằm ở tuyến đường liền kề sát tiệm (< 3.0 km -> FREESHIP)
  const isImmediateSurrounding = IMMEDIATE_SURROUNDING_STREETS.some((st) => fullText.includes(st));
  if (isImmediateSurrounding) {
    // Khoảng cách thực tế quanh bán kính 1.2 - 2.4 km
    let distanceKm = 1.8;
    if (fullText.includes('phạm văn bạch') || fullText.includes('pham van bach')) {
      distanceKm = 1.2;
    } else if (fullText.includes('cống lở') || fullText.includes('cong lo')) {
      distanceKm = 1.5;
    } else if (fullText.includes('huỳnh văn nghệ') || fullText.includes('tân sơn')) {
      distanceKm = 1.9;
    }

    const shippingFee = calculateShippingFee(distanceKm); // 0 ₫
    return {
      distanceKm,
      shippingFee,
      estimatedDurationMinutes: 30,
      isFreeship: true,
      tierDescription: 'Miễn phí giao hoa hỏa tốc (Bán kính < 3 km quanh chi nhánh Phạm Văn Bạch)',
      matchedDistrict: 'Quận Tân Bình (Khu vực lân cận tiệm)',
      originAddress: ROSE_FLAGSHIP_COORDINATES.address,
      destinationSummary: params.address || 'Quận Tân Bình',
    };
  }

  // 3. Khớp quận/huyện trong TP.HCM
  let matchedDistrictData: DistrictGeoData | null = null;

  for (const d of TPHCM_DISTRICTS) {
    const isMatch = d.aliases.some((alias) => fullText.includes(alias));
    if (isMatch) {
      matchedDistrictData = d;
      break;
    }
  }

  // Nếu không khớp rõ ràng, mặc định theo địa chỉ nội thành hoặc quận 1
  if (!matchedDistrictData) {
    if (rawDistrict) {
      // Thử tìm theo tên quận nhập tay
      matchedDistrictData =
        TPHCM_DISTRICTS.find((d) => d.name.toLowerCase().includes(rawDistrict)) || null;
    }
  }

  if (!matchedDistrictData) {
    // Mặc định khoảng cách nội thành tiêu chuẩn ~6.5 km
    const defaultDistance = 6.5;
    const shippingFee = calculateShippingFee(defaultDistance);
    return {
      distanceKm: defaultDistance,
      shippingFee,
      estimatedDurationMinutes: 45,
      isFreeship: false,
      tierDescription: 'Nội thành TP.HCM (3 - 10 km)',
      matchedDistrict: 'Nội thành TP.HCM',
      originAddress: ROSE_FLAGSHIP_COORDINATES.address,
      destinationSummary: params.address || 'TP. Hồ Chí Minh',
    };
  }

  // 4. Tính toán khoảng cách chi tiết theo quận khớp được
  let calculatedDistance = matchedDistrictData.baseDistanceKm;

  // Điều chỉnh tinh chỉnh nếu có thông tin số nhà hoặc phường
  if (matchedDistrictData.name === 'Quận Tân Bình') {
    // Nếu ở Tân Bình nhưng xa (như Lăng Cha Cả, Lê Văn Sỹ, Phường 1, Phường 2)
    if (fullText.includes('lê văn sỹ') || fullText.includes('hoàng văn thụ') || fullText.includes('phường 1') || fullText.includes('phường 2')) {
      calculatedDistance = 4.8;
    } else {
      calculatedDistance = 2.4;
    }
  } else if (matchedDistrictData.name === 'Quận Gò Vấp') {
    if (fullText.includes('phường 12') || fullText.includes('phường 14') || fullText.includes('quang trung')) {
      calculatedDistance = 2.7;
    } else {
      calculatedDistance = 4.2;
    }
  }

  const roundedDistance = Number(calculatedDistance.toFixed(1));
  const shippingFee = calculateShippingFee(roundedDistance);
  const isFreeship = shippingFee === 0;

  let tierDescription = '';
  if (roundedDistance <= 3.0) {
    tierDescription = 'Miễn phí giao hoa hỏa tốc (Bán kính < 3 km quanh tiệm)';
  } else if (roundedDistance <= 10.0) {
    tierDescription = 'Giao tiêu chuẩn nội thành TP.HCM (3 - 10 km)';
  } else if (roundedDistance <= 20.0) {
    tierDescription = 'Giao các quận ngoại thành TP.HCM (10 - 20 km)';
  } else {
    tierDescription = 'Giao huyện vùng ven TP.HCM (> 20 km)';
  }

  const estimatedMinutes = Math.min(90, Math.max(30, Math.round(roundedDistance * 4.5 + 15)));

  return {
    distanceKm: roundedDistance,
    shippingFee,
    estimatedDurationMinutes: estimatedMinutes,
    isFreeship,
    tierDescription,
    matchedDistrict: matchedDistrictData.name,
    originAddress: ROSE_FLAGSHIP_COORDINATES.address,
    destinationSummary: `${params.address ? params.address + ', ' : ''}${matchedDistrictData.name}, TP.HCM`,
  };
}

