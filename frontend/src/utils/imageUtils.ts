/**
 * Tiện ích xử lý đường dẫn ảnh từ MinIO
 */
export const getImageUrl = (url?: string | null): string => {
  if (!url) return "https://via.placeholder.com/300x450";
  if (url.startsWith("http")) return url;
  
  // Lấy IP từ biến môi trường, mặc định là localhost nếu không có
  const baseIp = process.env.EXPO_PUBLIC_BASE_IP || "localhost";
  const baseUrl = `http://${baseIp}:9000`;
  
  return `${baseUrl}${url}`;
};
