/**
 * Chuyển đổi độ sang radian
 */
const toRad = (value: number) => {
    return (value * Math.PI) / 180;
};

/**
 * Tính khoảng cách giữa 2 điểm tọa độ (Latitude, Longitude) bằng công thức Haversine
 * @param lat1 Vĩ độ điểm 1
 * @param lon1 Kinh độ điểm 1
 * @param lat2 Vĩ độ điểm 2
 * @param lon2 Kinh độ điểm 2
 * @returns Khoảng cách theo km
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Bán kính trái đất tính bằng km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Khoảng cách bằng km
    return d;
};
