import { Platform } from 'react-native';
import axiosClient from '../api/axiosClient';

export interface MovieListItem {
  id: number;
  title: string;
  duration: number;
  releaseDate: string;
  thumbnailPosterUrl: string;
  ageRestriction: string;
  movieGenre: string;
  language: string;
  rating: number;
  totalReactions: number;
}

export interface MovieDetail extends MovieListItem {
  description: string;
  backdropPosterUrl: string;
  movieActors: string;
  director: string;
}

export interface CreateMovieDto {
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  ageRestriction?: string;
  movieGenre?: string;
  language?: string;
  movieActors?: string;
  director?: string;
}

const movieService = {
  getAllMovies: async (): Promise<MovieListItem[]> => {
    const response = await axiosClient.get('/movie');
    return response.data;
  },

  getNowShowing: async (): Promise<MovieListItem[]> => {
    const response = await axiosClient.get('/movie/now-showing');
    return response.data;
  },

  getComingSoon: async (): Promise<MovieListItem[]> => {
    const response = await axiosClient.get('/movie/coming-soon');
    return response.data;
  },

  getMovieById: async (id: number): Promise<MovieDetail> => {
    const response = await axiosClient.get(`/movie/detail/${id}`);
    return response.data;
  },

  createMovie: async (movieData: CreateMovieDto): Promise<MovieDetail> => {
    const response = await axiosClient.post('/movie', movieData);
    return response.data;
  },

  uploadThumbnail: async (id: number, fileUri: string): Promise<{ relativePath: string }> => {
    const formData = new FormData();
    let fileName = fileUri.split('/').pop() || 'poster.jpg';
    // Đảm bảo có đuôi file trên Web (thường blob không có đuôi)
    if (Platform.OS === 'web' && !fileName.includes('.')) {
      fileName += '.jpg';
    }
    const type = 'image/jpeg';

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('File', blob, fileName);
    } else {
      // @ts-ignore
      formData.append('File', {
        uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
        name: fileName,
        type: type,
      });
    }

    const response = await axiosClient.put(`/movie/${id}/thumbnail`, formData, {
      headers: {
        'Accept': 'application/json',
      },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  uploadBackdrop: async (id: number, fileUri: string): Promise<{ relativePath: string }> => {
    const formData = new FormData();
    let fileName = fileUri.split('/').pop() || 'backdrop.jpg';
    if (Platform.OS === 'web' && !fileName.includes('.')) {
      fileName += '.jpg';
    }
    const type = 'image/jpeg';

    if (Platform.OS === 'web') {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      formData.append('File', blob, fileName);
    } else {
      // @ts-ignore
      formData.append('File', {
        uri: Platform.OS === 'android' ? fileUri : fileUri.replace('file://', ''),
        name: fileName,
        type: type,
      });
    }

    const response = await axiosClient.put(`/movie/${id}/backdrop`, formData, {
      headers: {
        'Accept': 'application/json',
      },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  updateMovie: async (id: number, movieData: Partial<CreateMovieDto>): Promise<MovieDetail> => {
    const response = await axiosClient.put(`/movie/update/${id}`, movieData);
    return response.data;
  },

  deleteMovie: async (id: number): Promise<void> => {
    await axiosClient.delete(`/movie/delete/${id}`);
  },
};

export default movieService;
