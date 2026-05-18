import axiosClient from '../api/axiosClient';
import { ApiResponse } from '../types';

export interface CheckoutRequest {
    totalAmount: number;
}

export interface CheckoutResponseData {
    orderId: string; // The BE still returns "orderId" in JSON
    amount: number;
    qrUrl: string;
}

const paymentService = {
    checkout: async (data: CheckoutRequest): Promise<ApiResponse<CheckoutResponseData>> => {
        // Gọi endpoint POST /api/Payment/checkout
        return await axiosClient.post('/Payment/checkout', data);
    }
};

export default paymentService;
