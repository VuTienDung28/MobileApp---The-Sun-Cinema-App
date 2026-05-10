import axiosClient from '../api/axiosClient';

export interface RoomDetailDto {
  id: number;
  cinemaId: number;
  cinemaName: string;
  name: string;
  totalSeats: number;
}

export interface CreateRoomDto {
  name: string;
}

export interface UpdateRoomDto {
  name?: string;
}

const roomService = {
  getRoomsByCinema: async (cinemaId: number): Promise<RoomDetailDto[]> => {
    const response = await axiosClient.get(`/cinema/${cinemaId}/room`);
    return response.data;
  },

  getRoomById: async (cinemaId: number, id: number): Promise<RoomDetailDto> => {
    const response = await axiosClient.get(`/cinema/${cinemaId}/room/detail/${id}`);
    return response.data;
  },

  createRoom: async (cinemaId: number, data: CreateRoomDto): Promise<RoomDetailDto> => {
    const response = await axiosClient.post(`/cinema/${cinemaId}/room`, data);
    return response.data;
  },

  updateRoom: async (cinemaId: number, id: number, data: UpdateRoomDto): Promise<RoomDetailDto> => {
    const response = await axiosClient.put(`/cinema/${cinemaId}/room/update/${id}`, data);
    return response.data;
  },

  deleteRoom: async (cinemaId: number, id: number): Promise<void> => {
    await axiosClient.delete(`/cinema/${cinemaId}/room/delete/${id}`);
  },
};

export default roomService;
