import { DropdownOption } from '../types';

export const PROVINCE_OPTIONS: DropdownOption[] = [
  { label: 'Hà Nội', value: 'HN' },
  { label: 'TP. Hồ Chí Minh', value: 'HCM' },
  { label: 'Đà Nẵng', value: 'DN' },
  { label: 'Hải Phòng', value: 'HP' },
  { label: 'Cần Thơ', value: 'CT' },
  { label: 'Bình Dương', value: 'BD' },
  { label: 'Đồng Nai', value: 'DON' },
  { label: 'Khánh Hòa', value: 'KH' },
];

export const DISTRICT_OPTIONS_MAP: Record<string, DropdownOption[]> = {
  'HN': [
    { label: 'Quận Ba Đình', value: 'BaDinh' },
    { label: 'Quận Hoàn Kiếm', value: 'HoanKiem' },
    { label: 'Quận Cầu Giấy', value: 'CauGiay' },
    { label: 'Quận Đống Đa', value: 'DongDa' },
    { label: 'Quận Hai Bà Trưng', value: 'HaiBaTrung' },
    { label: 'Quận Tây Hồ', value: 'TayHo' },
    { label: 'Quận Thanh Xuân', value: 'ThanhXuan' },
    { label: 'Quận Hoàng Mai', value: 'HoangMai' },
    { label: 'Quận Long Biên', value: 'LongBien' },
  ],
  'HCM': [
    { label: 'Quận 1', value: 'Q1' },
    { label: 'Quận 3', value: 'Q3' },
    { label: 'Quận 5', value: 'Q5' },
    { label: 'Quận 10', value: 'Q10' },
    { label: 'Thành phố Thủ Đức', value: 'ThuDuc' },
    { label: 'Quận Bình Thạnh', value: 'BinhThanh' },
    { label: 'Quận Gò Vấp', value: 'GoVap' },
    { label: 'Quận Phú Nhuận', value: 'PhuNhuan' },
    { label: 'Quận Tân Bình', value: 'TanBinh' },
  ],
  'DN': [
    { label: 'Quận Hải Châu', value: 'HaiChau' },
    { label: 'Quận Sơn Trà', value: 'SonTra' },
    { label: 'Quận Ngũ Hành Sơn', value: 'NguHanhSon' },
    { label: 'Quận Liên Chiểu', value: 'LienChieu' },
    { label: 'Quận Thanh Khê', value: 'ThanhKhe' },
  ],
  'HP': [
    { label: 'Quận Hồng Bàng', value: 'HongBang' },
    { label: 'Quận Lê Chân', value: 'LeChan' },
    { label: 'Quận Ngô Quyền', value: 'NgoQuyen' },
  ],
  'CT': [
    { label: 'Quận Ninh Kiều', value: 'NinhKieu' },
    { label: 'Quận Bình Thủy', value: 'BinhThuy' },
    { label: 'Quận Cái Răng', value: 'CaiRang' },
  ],
  'BD': [
    { label: 'Thành phố Thủ Dầu Một', value: 'ThuDauMot' },
    { label: 'Thành phố Thuận An', value: 'ThuanAn' },
    { label: 'Thành phố Dĩ An', value: 'DiAn' },
  ],
  'DON': [
    { label: 'Thành phố Biên Hòa', value: 'BienHoa' },
    { label: 'Thành phố Long Khánh', value: 'LongKhanh' },
  ],
  'KH': [
    { label: 'Thành phố Nha Trang', value: 'NhaTrang' },
    { label: 'Thành phố Cam Ranh', value: 'CamRanh' },
  ]
};

export const GENDER_OPTIONS: DropdownOption[] = [
  { label: 'Nam', value: 'Nam' },
  { label: 'Nữ', value: 'Nữ' },
  { label: 'Khác', value: 'Khác' },
];
