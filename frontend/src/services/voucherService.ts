// services/voucherService.ts
export interface VoucherDto {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export interface CreateVoucherDto {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
}

// Mock data ban đầu
let mockVouchers: VoucherDto[] = [
  {
    id: 1,
    code: 'WELCOME20',
    description: 'Giảm 20% cho đơn hàng đầu tiên, tối đa 50,000đ',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 100000,
    maxDiscount: 50000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    usageLimit: 100,
    usedCount: 45,
    isActive: true,
  },
  {
    id: 2,
    code: 'SUMMER50K',
    description: 'Giảm ngay 50,000đ cho đơn hàng từ 200,000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 200000,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    usageLimit: 200,
    usedCount: 89,
    isActive: true,
  },
  {
    id: 3,
    code: 'SPECIAL30',
    description: 'Giảm 30% đặc biệt cuối tuần',
    discountType: 'percentage',
    discountValue: 30,
    minOrderValue: 150000,
    maxDiscount: 100000,
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    usageLimit: 50,
    usedCount: 12,
    isActive: true,
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const voucherService = {
  // Lấy tất cả voucher
  getAllVouchers: async (): Promise<VoucherDto[]> => {
    await delay(300);
    return [...mockVouchers];
  },

  // Lấy voucher theo ID
  getVoucherById: async (id: number): Promise<VoucherDto> => {
    await delay(200);
    const voucher = mockVouchers.find(v => v.id === id);
    if (!voucher) {
      throw new Error('Không tìm thấy voucher');
    }
    return { ...voucher };
  },

  // Tạo voucher mới
  createVoucher: async (data: CreateVoucherDto): Promise<VoucherDto> => {
    await delay(500);
    
    // Kiểm tra mã voucher đã tồn tại
    const existingVoucher = mockVouchers.find(v => v.code === data.code);
    if (existingVoucher) {
      throw new Error('Mã voucher đã tồn tại');
    }
    
    const newVoucher: VoucherDto = {
      id: Math.max(...mockVouchers.map(v => v.id), 0) + 1,
      ...data,
      usedCount: 0,
      isActive: true,
    };
    
    mockVouchers.push(newVoucher);
    return newVoucher;
  },

  // Cập nhật voucher
  updateVoucher: async (id: number, data: Partial<CreateVoucherDto>): Promise<VoucherDto> => {
    await delay(500);
    
    const index = mockVouchers.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy voucher');
    }
    
    // Kiểm tra mã voucher nếu thay đổi
    if (data.code && data.code !== mockVouchers[index].code) {
      const existingVoucher = mockVouchers.find(v => v.code === data.code);
      if (existingVoucher) {
        throw new Error('Mã voucher đã tồn tại');
      }
    }
    
    mockVouchers[index] = {
      ...mockVouchers[index],
      ...data,
    };
    
    return mockVouchers[index];
  },

  // Xóa voucher
  deleteVoucher: async (id: number): Promise<void> => {
    await delay(500);
    
    const index = mockVouchers.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy voucher');
    }
    
    mockVouchers = mockVouchers.filter(v => v.id !== id);
  },

  // Bật/tắt trạng thái voucher
  toggleVoucherStatus: async (id: number): Promise<VoucherDto> => {
    await delay(300);
    
    const index = mockVouchers.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error('Không tìm thấy voucher');
    }
    
    mockVouchers[index].isActive = !mockVouchers[index].isActive;
    return mockVouchers[index];
  },
};

export default voucherService;