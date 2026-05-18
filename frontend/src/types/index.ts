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
  fullName: string;
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
  style?: 'cancel' | 'default' | 'confirm';
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
  AdminMenu: undefined;

  AddMovie: undefined;

  EditMovie: {
    movie: any;
  };

  MovieDetail: {
    movieId: number;
  };

  MovieList: undefined;

  MovieBooking: {
    movieId?: number;
    movieTitle?: string;
    movieName?: string;
    age?: string;
    type?: string;
    date?: string;
  };

  AddTheater: undefined;

  EditTheater: {
    theater: any;
  };

  AddShowtime: {
    cinemaId: number;
    cinemaName: string;
  };

  SeatSelection: {
    cinemaName: string;
    movieId?: number;
    movieName: string;
    age: string;
    type: string;
    time: string;
    date: string;
  };

  TotalTickets: undefined;

  TheaterDetail: {
    cinemaId: number;
    cinemaName: string;
  };
  TotalTicketsUser:
  | {
    cinemaName?: string;
    movieName?: string;
    age?: string;
    type?: string;
    time?: string;
    date?: string;
    selectedSeats?: string[];
    seatTotal?: number;
    foodTotal?: number;
    finalTotal?: number;
    foods?: Record<number, number>;
  }
  | undefined;

  PaymentScreen: {
    bookingId: string;
    qrUrl: string;
    amount: number;
    ticketData: any; // Chứa toàn bộ dữ liệu vé để lưu lại sau khi thanh toán thành công
  };

  SeatLayoutManage: {
    cinemaId: number;
    roomId: number;
    roomName: string;
  };

  TheaterShowtime: {
    cinemaName: string;
  };

  Profile: undefined;

  Menu: undefined;

  Theater: undefined;

  VerifyPassword:
  | {
    fullName?: string;
    avatar?: string | null;
    onSave?: (name: string, avatar: string | null) => void;
  }
  | undefined;

  EditProfile:
  | {
    profile?: {
      fullName: string;
      email: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      gender?: string;
      province?: string;
      district?: string;
      avatarUrl?: string;
    };
  }
  | undefined;

  ChangePassword: undefined;

  PaymentPin: undefined;

  TransactionHistory: undefined;

  Promotion: undefined;

  PromotionDetail: {
    promotionId?: number;
    promotion?: any;
  };

  FAQ: undefined;
  Settings: undefined;
};