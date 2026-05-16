import axiosClient from '../api/axiosClient';

export interface ShowtimeSlotDto {
  id: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  roomId: number;
  roomName: string;
  availableSeats: number;
}

export interface ShowtimesByMovieDto {
  movieId: number;
  movieTitle: string;
  movieThumbnailUrl: string;
  movieDuration: number;
  ageRestriction: string;
  showtimes: ShowtimeSlotDto[];
}

export interface ShowtimesByCinemaDto {
  cinemaId: number;
  cinemaName: string;
  cinemaAddress: string;
  showtimes: ShowtimeSlotDto[];
}

export interface CreateShowtimeDto {
  movieId: number;
  roomId: number;
  startTime: string; // ISO 8601 string
  basePrice: number;
}

export interface ShowtimeDetailDto {
  id: number;
  movieId: number;
  movieTitle: string;
  movieThumbnailUrl: string;
  movieDuration: number;
  roomId: number;
  roomName: string;
  cinemaId: number;
  cinemaName: string;
  cinemaAddress: string;
  startTime: string;
  endTime: string;
  basePrice: number;
  totalSeats: number;
  availableSeats: number;
}

const showtimeService = {
  getShowtimesByCinema: async (cinemaId: number, date?: string): Promise<ShowtimesByMovieDto[]> => {
    // date should be in format 'yyyy-MM-dd'
    const query = date ? `?date=${date}` : '';
    const response = await axiosClient.get(`/showtime/by-cinema/${cinemaId}${query}`);
    return response.data;
  },

  getShowtimesByMovie: async (movieId: number, date?: string): Promise<ShowtimesByCinemaDto[]> => {
    const query = date ? `?date=${date}` : '';
    const response = await axiosClient.get(`/showtime/by-movie/${movieId}${query}`);
    return response.data;
  },

  createShowtime: async (data: CreateShowtimeDto): Promise<ShowtimeDetailDto> => {
    const response = await axiosClient.post('/showtime', data);
    return response.data;
  },

  deleteShowtime: async (id: number): Promise<void> => {
    await axiosClient.delete(`/showtime/delete/${id}`);
  },

  getShowtimeById: async (id: number): Promise<ShowtimeDetailDto> => {
    const response = await axiosClient.get(`/showtime/detail/${id}`);
    return response.data;
  }
};

export default showtimeService;
