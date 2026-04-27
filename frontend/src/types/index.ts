// ─── Auth ──────────────────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'User';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  province: string;
  district: string;
}

export interface AuthResponseData {
  token: string;
  refreshToken: string;
  roles: string[];
}

export interface TokenRequest {
  accessToken: string;
  refreshToken: string;
}


export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// ─── Alert ─────────────────────────────────────────────────────────────────
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertButton {
  text: string;
  style?: 'cancel' | 'default';
  onPress?: () => void;
}

export interface AlertOptions {
  type?: AlertType;
  buttons?: AlertButton[];
}

// ─── Dropdown ──────────────────────────────────────────────────────────────
export interface DropdownOption {
  label: string;
  value: string;
}

// ─── Navigation ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserHome: undefined;
  AdminHome: undefined;
  AddMovie: undefined;
  EditMovie: { movie: any };
  MovieDetail: { movieId: number };
  MovieList: undefined;
  AddTheater: undefined;
  Profile: undefined;
};
