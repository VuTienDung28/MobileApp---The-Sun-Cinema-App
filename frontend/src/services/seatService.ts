import axiosClient from '../api/axiosClient';

export interface SeatDto {
  id: number;
  rowName: string;
  seatNumber: number;
  columnIndex: number;
  type: string;
}

export interface RoomSeatLayoutDto {
  roomId: number;
  roomName: string;
  totalColumns: number;
  seats: SeatDto[];
}

export interface SeatRowConfigDto {
  rowName: string;
  type: string;
}

export interface GenerateSeatsDto {
  totalColumns: number;
  aisleAtColumns: number[];
  rows: SeatRowConfigDto[];
}

const seatService = {
  getSeatLayout: async (cinemaId: number, roomId: number): Promise<RoomSeatLayoutDto> => {
    const response = await axiosClient.get(`/cinema/${cinemaId}/room/${roomId}/seat/layout`);
    return response.data;
  },

  generateSeats: async (cinemaId: number, roomId: number, data: GenerateSeatsDto): Promise<RoomSeatLayoutDto> => {
    const response = await axiosClient.post(`/cinema/${cinemaId}/room/${roomId}/seat/generate`, data);
    return response.data;
  },

  clearSeats: async (cinemaId: number, roomId: number): Promise<void> => {
    await axiosClient.delete(`/cinema/${cinemaId}/room/${roomId}/seat/clear`);
  },
};

export default seatService;
