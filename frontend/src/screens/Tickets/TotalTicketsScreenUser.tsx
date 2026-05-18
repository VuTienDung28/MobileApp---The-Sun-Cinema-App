import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import paymentService from "../../services/paymentService";
import axiosClient from "../../api/axiosClient";
import useAlertStore from "../../store/useAlertStore";

const foodsData = [
    {
        id: 1,
        name: "P MY COMBO",
        desc: "1 bắp rang + 1 nước ngọt",
        price: 115000,
    },
    {
        id: 2,
        name: "COMBO BẮP NƯỚC 2",
        desc: "1 bắp rang + 2 nước ngọt",
        price: 99000,
    },
    {
        id: 3,
        name: "BẮP RANG BƠ",
        desc: "Bắp rang vị bơ truyền thống",
        price: 55000,
    },
    {
        id: 4,
        name: "NƯỚC NGỌT",
        desc: "Pepsi / 7Up / Mirinda",
        price: 35000,
    },
];

export default function TotalTicketsScreenUser({ navigation, route }: any) {
    const {
        cinemaName = "The Sun Cinema",
        movieName = "Tên phim",
        age = "P",
        type = "2D Phụ Đề Việt",
        time = "15:20",
        date = "Thứ 3, 12 Tháng 5, 2026",
        selectedSeats = [],
        selectedSeatIds = [],
        showtimeId,
        cinemaId,
        roomId,
        seatTotal = 0,
        foodTotal = 0,
        finalTotal = 0,
        foods = {},
    } = route.params || {};

    const [checked, setChecked] = useState(true);
    const [showExitModal, setShowExitModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const showAlert = useAlertStore(state => state.showAlert);

    const selectedFoodList = useMemo(() => {
        return foodsData
            .map((item) => {
                const quantity = foods[item.id] || 0;

                return {
                    ...item,
                    quantity,
                    total: item.price * quantity,
                };
            })
            .filter((item) => item.quantity > 0);
    }, [foods]);

    const realFoodTotal =
        foodTotal ||
        selectedFoodList.reduce((sum, item) => sum + item.total, 0);

    const realSeatTotal =
        seatTotal || Number(finalTotal || 0) - Number(realFoodTotal || 0);

    const realFinalTotal =
        finalTotal || Number(realSeatTotal || 0) + Number(realFoodTotal || 0);

    const handleBack = () => {
        setShowExitModal(true);
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    const handleExitConfirm = () => {
        setShowExitModal(false);

        if (navigation.canGoBack()) {
            navigation.pop(2);
        } else {
            navigation.navigate("SeatSelection", {
                cinemaName,
                movieName,
                age,
                type,
                time,
                date,
            });
        }
    };

    const getAgeDescription = () => {
        const movieAge = String(age || "").toUpperCase();

        if (
            movieAge.includes("T18") ||
            movieAge.includes("C18") ||
            movieAge.includes("18")
        ) {
            return "Phim được phổ biến đến người xem từ đủ 18 tuổi trở lên (18+)";
        }

        if (
            movieAge.includes("T16") ||
            movieAge.includes("C16") ||
            movieAge.includes("16")
        ) {
            return "Phim được phổ biến đến người xem từ đủ 16 tuổi trở lên (16+)";
        }

        if (
            movieAge.includes("T13") ||
            movieAge.includes("C13") ||
            movieAge.includes("13")
        ) {
            return "Phim được phổ biến đến người xem từ đủ 13 tuổi trở lên (13+)";
        }

        return "Phim dành cho mọi độ tuổi";
    };

    const handleCheckout = async () => {
        if (!checked) {
            showAlert(
                "Thông báo",
                "Bạn cần đồng ý với điều khoản sử dụng trước khi thanh toán.",
                { type: 'warning' }
            );
            return;
        }

        if (!showtimeId || !selectedSeatIds || selectedSeatIds.length === 0) {
             showAlert("Lỗi", "Thông tin suất chiếu hoặc ghế không hợp lệ.", { type: 'error' });
             return;
        }

        try {
            setLoading(true);
            
            // Gọi API giữ ghế thật thay vì mock checkout
            const response: any = await axiosClient.post('/Booking/hold', {
                showtimeId: showtimeId,
                seatIds: selectedSeatIds
            });

            if (response && response.qrUrl) {
                navigation.navigate("PaymentScreen", {
                    bookingId: response.bookingId,
                    amount: response.totalPrice + realFoodTotal, // Tiền ghế + Tiền bắp nước
                    qrUrl: response.qrUrl,
                    ticketData: {
                        cinemaName, movieName, age, type, time, date, selectedSeats,
                        seatTotal: response.totalPrice, foodTotal: realFoodTotal, finalTotal: response.totalPrice + realFoodTotal, foods: selectedFoodList
                    }
                });
            } else {
                showAlert("Lỗi", "Không thể lấy thông tin thanh toán từ Gateway.", { type: 'error' });
            }
        } catch (error: any) {
            console.error("Checkout error:", error);
            
            if (error?.ConflictSeats || error?.conflictSeats || (error?.Message && String(error.Message).includes("Ghế đã bị bán"))) {
                showAlert(
                    "Rất tiếc",
                    "Người khác đang giao dịch thanh toán với ghế này. Vui lòng chọn ghế khác.",
                    {
                        type: 'warning',
                        buttons: [
                            {
                                text: "Đồng ý",
                                style: 'confirm',
                                onPress: () => navigation.navigate("SeatSelection", {
                                    cinemaName, movieName, age, type, time, date, showtimeId, cinemaId, roomId
                                })
                            }
                        ]
                    }
                );
            } else {
                showAlert("Lỗi", error?.Message || error?.message || "Đã có lỗi xảy ra khi kết nối thanh toán.", { type: 'error' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={34} color="#A3262A" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.movieBox}>
                    <View style={styles.posterBox}>
                        <View style={styles.posterPlaceholder}>
                            <Text style={styles.posterText}>POSTER</Text>
                        </View>
                    </View>

                    <View style={styles.movieInfo}>
                        <View style={styles.titleRow}>
                            <Text numberOfLines={1} style={styles.movieName}>
                                {movieName}
                            </Text>

                            <View style={styles.ageBox}>
                                <Text style={styles.ageText}>{age}</Text>
                            </View>
                        </View>

                        <Text style={styles.ageDesc}>{getAgeDescription()}</Text>

                        <Text style={styles.infoText}>{date}</Text>
                        <Text style={styles.infoText}>{time}</Text>

                        <Text style={styles.cinemaText}>{cinemaName}</Text>
                        <Text style={styles.cinemaText}>Cinema 2</Text>

                        <Text style={styles.seatText}>
                            Seat:{" "}
                            {selectedSeats.length > 0
                                ? selectedSeats.join(", ")
                                : "Chưa chọn"}
                        </Text>

                        {selectedFoodList.length > 0 && (
                            <Text style={styles.foodSummary}>
                                {selectedFoodList
                                    .map((item) => `${item.name}x${item.quantity}`)
                                    .join(", ")}
                            </Text>
                        )}

                        <Text style={styles.totalMain}>
                            Tổng Thanh Toán:{" "}
                            {realFinalTotal.toLocaleString("vi-VN")} đ
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>THÔNG TIN VÉ</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.rowLabel}>Số lượng</Text>
                    <Text style={styles.rowValue}>{selectedSeats.length}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.rowLabel}>Đơn giá</Text>
                    <Text style={styles.rowValue}>
                        {realSeatTotal.toLocaleString("vi-VN")} đ
                    </Text>
                </View>

                {selectedFoodList.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionHeaderText}>
                                BẮP NƯỚC TÙY CHỌN
                            </Text>
                        </View>

                        {selectedFoodList.map((item) => (
                            <View key={item.id} style={styles.foodRow}>
                                <View style={styles.foodIcon}>
                                    <Ionicons
                                        name="fast-food"
                                        size={24}
                                        color="#D69A00"
                                    />
                                </View>

                                <Text style={styles.foodName}>{item.name}</Text>

                                <Text style={styles.foodQuantity}>
                                    {item.quantity}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.infoRow}>
                            <Text style={styles.rowLabel}>Đơn giá</Text>
                            <Text style={styles.rowValue}>
                                {realFoodTotal.toLocaleString("vi-VN")} đ
                            </Text>
                        </View>
                    </>
                )}

                <View style={styles.remainBox}>
                    <Text style={styles.remainLabel}>Tổng</Text>
                    <Text style={styles.remainValue}>
                        {realFinalTotal.toLocaleString("vi-VN")} đ
                    </Text>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>THANH TOÁN</Text>
                </View>

                <View style={styles.paymentSection}>
                    <TouchableOpacity style={styles.paymentRow}>
                        <View style={styles.bankIcon}>
                            <Text style={styles.bankIconText}>ATM</Text>
                        </View>

                        <Text style={styles.paymentText}>ATM card Thẻ nội địa</Text>

                        <Ionicons name="checkmark" size={34} color="#B4262C" />
                    </TouchableOpacity>
                </View>

                <View style={styles.termBox}>
                    <TouchableOpacity
                        style={styles.checkBox}
                        onPress={() => setChecked(!checked)}
                    >
                        {checked && (
                            <Ionicons
                                name="checkmark"
                                size={28}
                                color="#FFFFFF"
                            />
                        )}
                    </TouchableOpacity>

                    <Text style={styles.termText}>
                        Tôi đồng ý với{" "}
                        <Text style={styles.linkText}>điều khoản sử dụng</Text>{" "}
                        và đang mua vé cho người có độ tuổi phù hợp với từng loại
                        vé.{"\n"}
                        <Text style={styles.linkText}>Chi tiết xem tại đây!</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        (!checked || loading) && styles.disabledButton,
                    ]}
                    onPress={handleCheckout}
                    disabled={loading}
                >
                    <Text style={styles.continueButtonText}>
                        {loading ? "Đang xử lý..." : "Tôi đồng ý và Thanh toán"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={showExitModal}
                transparent
                animationType="fade"
                onRequestClose={handleExitCancel}
            >
                <View style={styles.exitOverlay}>
                    <View style={styles.exitBox}>
                        <Text style={styles.exitTitle}>Thông báo</Text>

                        <Text style={styles.exitMessage}>
                            Bạn có muốn thoát khỏi thanh toán không?
                        </Text>

                        <View style={styles.exitActions}>
                            <TouchableOpacity
                                style={styles.exitButton}
                                onPress={handleExitCancel}
                            >
                                <Text style={styles.exitCancelText}>Hủy</Text>
                            </TouchableOpacity>

                            <View style={styles.exitDivider} />

                            <TouchableOpacity
                                style={styles.exitButton}
                                onPress={handleExitConfirm}
                            >
                                <Text style={styles.exitAgreeText}>Đồng ý</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 105,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 20,
        paddingBottom: 18,
    },

    backButton: {
        marginRight: 18,
    },

    headerTitle: {
        flex: 1,
        fontSize: 31,
        fontWeight: "900",
        color: "#000000",
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 40,
    },

    movieBox: {
        flexDirection: "row",
        paddingBottom: 18,
        backgroundColor: "#FFFFFF",
    },

    posterBox: {
        width: 150,
        paddingRight: 14,
    },

    posterPlaceholder: {
        width: 135,
        height: 185,
        borderRadius: 8,
        backgroundColor: "#24110D",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    posterText: {
        color: "#F6D36B",
        fontSize: 22,
        fontWeight: "900",
    },

    movieInfo: {
        flex: 1,
        paddingRight: 16,
    },

    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    movieName: {
        flex: 1,
        fontSize: 29,
        fontWeight: "900",
        color: "#000",
    },

    ageBox: {
        borderWidth: 1.5,
        borderColor: "#DB6A63",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 1,
        marginLeft: 8,
    },

    ageText: {
        color: "#D14438",
        fontSize: 15,
        fontWeight: "900",
    },

    ageDesc: {
        fontSize: 16,
        color: "#A3262A",
        marginBottom: 8,
        lineHeight: 22,
    },

    infoText: {
        fontSize: 22,
        color: "#3A332F",
        lineHeight: 29,
    },

    cinemaText: {
        fontSize: 22,
        color: "#746B62",
        fontWeight: "900",
        lineHeight: 29,
    },

    seatText: {
        fontSize: 22,
        color: "#746B62",
        fontWeight: "900",
        lineHeight: 29,
    },

    foodSummary: {
        fontSize: 21,
        color: "#746B62",
        fontWeight: "900",
        lineHeight: 28,
    },

    totalMain: {
        marginTop: 12,
        fontSize: 26,
        color: "#FF1C0F",
        fontWeight: "900",
        lineHeight: 34,
    },

    sectionHeader: {
        height: 82,
        backgroundColor: "#DDD9CE",
        justifyContent: "center",
        paddingHorizontal: 18,
    },

    sectionHeaderText: {
        fontSize: 28,
        color: "#8D8178",
        fontWeight: "500",
    },

    infoRow: {
        minHeight: 75,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },

    rowLabel: {
        fontSize: 25,
        color: "#3A332F",
    },

    rowValue: {
        fontSize: 25,
        color: "#3A332F",
    },

    foodRow: {
        minHeight: 78,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },

    foodIcon: {
        width: 46,
        height: 46,
        borderRadius: 6,
        backgroundColor: "#FFF2CC",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 18,
    },

    foodName: {
        flex: 1,
        fontSize: 25,
        color: "#3A332F",
    },

    foodQuantity: {
        fontSize: 25,
        color: "#3A332F",
    },

    remainBox: {
        height: 70,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#EEEEEE",
    },

    remainLabel: {
        fontSize: 25,
        color: "#3A332F",
    },

    remainValue: {
        fontSize: 25,
        color: "#3A332F",
    },

    paymentSection: {
        backgroundColor: "#FFFFFF",
    },

    paymentRow: {
        height: 76,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },

    bankIcon: {
        width: 72,
        height: 38,
        borderRadius: 4,
        backgroundColor: "#0878C9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },

    bankIconText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "900",
    },

    paymentText: {
        flex: 1,
        fontSize: 24,
        color: "#A79C95",
    },

    termBox: {
        backgroundColor: "#DDD9CE",
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 18,
    },

    checkBox: {
        width: 34,
        height: 34,
        backgroundColor: "#ddb627ff",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 4,
    },

    termText: {
        flex: 1,
        fontSize: 23,
        lineHeight: 32,
        color: "#7A6F66",
    },

    linkText: {
        color: "#1597D3",
        textDecorationLine: "underline",
    },

    continueButton: {
        marginHorizontal: 34,
        marginTop: 24,
        height: 68,
        borderRadius: 36,
        backgroundColor: "#dcc426ff",
        justifyContent: "center",
        alignItems: "center",
    },

    disabledButton: {
        backgroundColor: "#B8AEA8",
    },

    continueButtonText: {
        color: "#FFFFFF",
        fontSize: 26,
        fontWeight: "700",
    },

    exitOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    exitBox: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        overflow: "hidden",
    },

    exitTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#333333",
        textAlign: "center",
        marginTop: 26,
        marginBottom: 10,
    },

    exitMessage: {
        fontSize: 21,
        lineHeight: 30,
        color: "#333333",
        textAlign: "center",
        paddingHorizontal: 24,
        paddingBottom: 24,
    },

    exitActions: {
        height: 68,
        borderTopWidth: 1,
        borderTopColor: "#D6D6D6",
        flexDirection: "row",
    },

    exitButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    exitDivider: {
        width: 1,
        backgroundColor: "#D6D6D6",
    },

    exitCancelText: {
        fontSize: 24,
        color: "red",
        fontWeight: "500",
    },

    exitAgreeText: {
        fontSize: 24,
        color: "#0057FF",
        fontWeight: "600",
    },
});