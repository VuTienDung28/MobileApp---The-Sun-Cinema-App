import axiosClient from '../api/axiosClient';

export interface CinemaListItemDto {
  id: number;
  name: string;
  address: string;
}

export interface RoomInCinemaDto {
  id: number;
  name: string;
  totalSeats: number;
}

export interface CinemaDetailDto {
  id: number;
  name: string;
  address: string;
  rooms: RoomInCinemaDto[];
}

export interface CreateCinemaDto {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateCinemaDto {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

const theaterService = {
  getAllTheaters: async (): Promise<CinemaListItemDto[]> => {
    const response = await axiosClient.get('/cinema');
    return response.data;
  },

  getTheaterById: async (id: number): Promise<CinemaDetailDto> => {
    const response = await axiosClient.get(`/cinema/detail/${id}`);
    return response.data;
  },

  createTheater: async (data: CreateCinemaDto): Promise<CinemaDetailDto> => {
    const response = await axiosClient.post('/cinema', data);
    return response.data;
  },

  updateTheater: async (id: number, data: UpdateCinemaDto): Promise<CinemaDetailDto> => {
    const response = await axiosClient.put(`/cinema/update/${id}`, data);
    return response.data;
  },

  deleteTheater: async (id: number): Promise<void> => {
    await axiosClient.delete(`/cinema/delete/${id}`);
  },
};

export default theaterService;
