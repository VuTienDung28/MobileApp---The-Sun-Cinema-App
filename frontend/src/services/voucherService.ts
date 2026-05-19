import axiosClient from '../api/axiosClient';

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

const voucherService = {
  // Lấy tất cả voucher
  getAllVouchers: async (): Promise<VoucherDto[]> => {
    const response: any = await axiosClient.get('/voucher');
    return response;
  },

  // Lấy voucher theo ID
  getVoucherById: async (id: number): Promise<VoucherDto> => {
    const response: any = await axiosClient.get(`/voucher/${id}`);
    return response;
  },

  // Tạo voucher mới
  createVoucher: async (data: CreateVoucherDto): Promise<VoucherDto> => {
    const response: any = await axiosClient.post('/voucher', data);
    return response;
  },

  // Cập nhật voucher
  updateVoucher: async (id: number, data: Partial<CreateVoucherDto>): Promise<VoucherDto> => {
    const response: any = await axiosClient.put(`/voucher/${id}`, data);
    return response;
  },

  // Xóa voucher
  deleteVoucher: async (id: number): Promise<void> => {
    await axiosClient.delete(`/voucher/${id}`);
  },

  // Bật/tắt trạng thái voucher
  toggleVoucherStatus: async (id: number): Promise<VoucherDto> => {
    const response: any = await axiosClient.patch(`/voucher/${id}/toggle-status`);
    return response;
  },
};

export default voucherService;