import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppSideMenu from "../../components/AppSideMenu";

export default function SeatSelectionScreen({ navigation, route }: any) {
    const {
        cinemaName = "The Sun Cinema",
        movieName = "Tên phim",
        age = "P",
        type = "2D Phụ Đề Việt",
        time = "20:00",
        date = "12-05-2026",
    } = route.params || {};

    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "L", "M", "N", "P"];
    const cols = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    const bookedSeats = ["A12", "A11", "B10", "C8", "D6", "E5", "F4"];
    const vipRows = ["D", "E", "F", "G", "H", "J", "L", "M"];
    const sweetBoxRows = ["N", "P"];

    const normalPrice = 75000;
    const vipPrice = 95000;
    const sweetBoxPrice = 120000;

    const getSeatPrice = (seat: string) => {
        const row = seat.charAt(0);

        if (sweetBoxRows.includes(row)) return sweetBoxPrice;
        if (vipRows.includes(row)) return vipPrice;

        return normalPrice;
    };

    const toggleSeat = (seat: string) => {
        if (bookedSeats.includes(seat)) return;

        if (selectedSeats.includes(seat)) {
            setSelectedSeats(selectedSeats.filter((s) => s !== seat));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const getSeatStyle = (seat: string) => {
        const row = seat.charAt(0);

        if (bookedSeats.includes(seat)) return styles.bookedSeat;
        if (selectedSeats.includes(seat)) return styles.selectedSeat;
        if (sweetBoxRows.includes(row)) return styles.sweetSeat;
        if (vipRows.includes(row)) return styles.vipSeat;

        return styles.normalSeat;
    };

    const isAgeRestricted = () => {
        const movieAge = String(age || "").toUpperCase();

        return (
            movieAge.includes("T13") ||
            movieAge.includes("T16") ||
            movieAge.includes("T18") ||
            movieAge.includes("C13") ||
            movieAge.includes("C16") ||
            movieAge.includes("C18") ||
            movieAge.includes("13") ||
            movieAge.includes("16") ||
            movieAge.includes("18")
        );
    };

    const totalPrice = selectedSeats.reduce((sum, seat) => {
        return sum + getSeatPrice(seat);
    }, 0);

    const handleOpenConfirm = () => {
        if (selectedSeats.length === 0) return;

        setShowConfirmModal(true);
    };

    const handleCancelConfirm = () => {
        setShowConfirmModal(false);
    };

    const handleAgreeConfirm = () => {
        setShowConfirmModal(false);

        navigation.navigate("FoodDrink", {
            cinemaName,
            movieName,
            age,
            type,
            time,
            date,
            selectedSeats,
            totalPrice,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#A3262A" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.cinemaName}>{cinemaName}</Text>
                    <Text style={styles.showtimeText}>
                        Cinema 7   {date} {time}
                    </Text>
                </View>

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <Ionicons name="menu" size={34} color="#A3262A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                maximumZoomScale={2.5}
                minimumZoomScale={1}
                bouncesZoom
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.bannerBox}>
                    <Text style={styles.bannerText}>The Sun Cinema</Text>
                    <Text style={styles.bannerSub}>
                        Đặt vé nhanh - chọn ghế dễ dàng
                    </Text>
                </View>

                <View style={styles.screenBox}>
                    <Text style={styles.screenText}>MÀN HÌNH</Text>
                </View>

                <View style={styles.seatArea}>
                    {rows.map((row) => (
                        <View key={row} style={styles.seatRow}>
                            {cols.map((col) => {
                                const seat = `${row}${col}`;

                                return (
                                    <TouchableOpacity
                                        key={seat}
                                        style={[styles.seat, getSeatStyle(seat)]}
                                        onPress={() => toggleSeat(seat)}
                                    >
                                        <Text style={styles.seatText}>{seat}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>

                <View style={styles.noteBox}>
                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.bookedSeat]} />
                        <Text style={styles.noteText}>Đã đặt</Text>
                    </View>

                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.selectedSeat]} />
                        <Text style={styles.noteText}>Đang chọn</Text>
                    </View>

                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.vipSeat]} />
                        <Text style={styles.noteText}>VIP</Text>
                    </View>

                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.normalSeat]} />
                        <Text style={styles.noteText}>Thường</Text>
                    </View>

                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.sweetSeat]} />
                        <Text style={styles.noteText}>Sweet Box</Text>
                    </View>
                </View>

                <View style={styles.movieInfoBox}>
                    <View style={styles.movieTitleRow}>
                        <Text numberOfLines={1} style={styles.movieTitle}>
                            {movieName}
                        </Text>

                        <View style={styles.ageBox}>
                            <Text style={styles.ageText}>{age}</Text>
                        </View>
                    </View>

                    <Text style={styles.typeText}>{type}</Text>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.footerLeft}>
                    <Text style={styles.priceText}>
                        {totalPrice.toLocaleString("vi-VN")} đ
                    </Text>

                    <Text style={styles.seatCountText}>
                        {selectedSeats.length > 0
                            ? `${selectedSeats.length} ghế: ${selectedSeats.join(", ")}`
                            : "Chưa chọn ghế"}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.bookingButton,
                        selectedSeats.length === 0 && styles.disabledButton,
                    ]}
                    disabled={selectedSeats.length === 0}
                    onPress={handleOpenConfirm}
                >
                    <Text style={styles.bookingButtonText}>Đặt Vé</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancelConfirm}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmTitle}>Xác nhận</Text>

                        {isAgeRestricted() ? (
                            <Text style={styles.confirmContent}>
                                Tôi xác nhận mua vé cho người xem từ đủ 18 tuổi trở lên
                                và đồng ý cung cấp giấy tờ tùy thân để xác thực độ tuổi
                                người xem. The Sun Cinema sẽ không hoàn tiền nếu người xem
                                không đáp ứng đủ điều kiện.{" "}
                                <Text
                                    style={styles.linkText}
                                    onPress={() => Linking.openURL("https://bvhttdl.gov.vn/")}
                                >
                                    Tham khảo quy định
                                </Text>{" "}
                                của Bộ Văn Hóa, Thể Thao và Du Lịch.
                            </Text>
                        ) : (
                            <Text style={styles.confirmContent}>
                                Phim dành cho mọi độ tuổi. Tôi xác nhận The Sun Cinema
                                không được phép phục vụ khách hàng dưới 13 tuổi cho các
                                suất chiếu kết thúc từ 22:00 và dưới 16 tuổi cho các suất
                                chiếu kết thúc từ 23:00. Tôi đồng ý cung cấp giấy tờ tùy
                                thân để xác thực độ tuổi người xem. The Sun Cinema sẽ không
                                hoàn tiền nếu người xem không đáp ứng đủ điều kiện. Tham khảo{" "}
                                <Text
                                    style={styles.linkText}
                                    onPress={() => Linking.openURL("https://bvhttdl.gov.vn/")}
                                >
                                    quy định
                                </Text>{" "}
                                của Bộ Văn Hóa, Thể Thao và Du Lịch.
                            </Text>
                        )}

                        <View style={styles.confirmActions}>
                            <Pressable
                                style={styles.confirmButton}
                                onPress={handleCancelConfirm}
                            >
                                <Text style={styles.cancelText}>Hủy</Text>
                            </Pressable>

                            <View style={styles.actionDivider} />

                            <Pressable
                                style={styles.confirmButton}
                                onPress={handleAgreeConfirm}
                            >
                                <Text style={styles.agreeText}>Đồng ý</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <AppSideMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                navigation={navigation}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EEE6D5",
    },

    header: {
        height: 86,
        backgroundColor: "#F2F2F2",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
    },

    headerInfo: {
        flex: 1,
        marginLeft: 16,
    },

    cinemaName: {
        fontSize: 24,
        fontWeight: "900",
        color: "#2D2825",
    },

    showtimeText: {
        marginTop: 3,
        fontSize: 17,
        color: "#6B625C",
        fontWeight: "500",
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 120,
    },

    bannerBox: {
        height: 170,
        backgroundColor: "#D8C7A1",
        justifyContent: "center",
        alignItems: "center",
    },

    bannerText: {
        fontSize: 38,
        fontWeight: "900",
        color: "#A3262A",
    },

    bannerSub: {
        marginTop: 8,
        fontSize: 18,
        color: "#4A3320",
        fontWeight: "700",
    },

    screenBox: {
        alignSelf: "center",
        marginTop: 18,
        marginBottom: 18,
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
        borderRadius: 18,
        paddingHorizontal: 45,
        paddingVertical: 8,
        backgroundColor: "rgba(255,255,255,0.25)",
    },

    screenText: {
        color: "#FFFFFF",
        fontWeight: "900",
        fontSize: 17,
    },

    seatArea: {
        alignItems: "center",
        paddingHorizontal: 8,
    },

    seatRow: {
        flexDirection: "row",
    },

    seat: {
        width: 47,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },

    normalSeat: {
        backgroundColor: "#3B2200",
    },

    vipSeat: {
        backgroundColor: "#FF9500",
    },

    sweetSeat: {
        backgroundColor: "#8B6A00",
    },

    selectedSeat: {
        backgroundColor: "#FFFBF0",
    },

    bookedSeat: {
        backgroundColor: "#F5F1E7",
    },

    seatText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },

    noteBox: {
        marginTop: 28,
        paddingHorizontal: 20,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },

    noteItem: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 10,
        marginBottom: 12,
    },

    noteColor: {
        width: 28,
        height: 28,
        marginRight: 8,
    },

    noteText: {
        fontSize: 17,
        color: "#FFFFFF",
        fontWeight: "800",
    },

    movieInfoBox: {
        backgroundColor: "#F2F2F2",
        paddingHorizontal: 20,
        paddingVertical: 14,
        marginTop: 30,
    },

    movieTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    movieTitle: {
        flex: 1,
        fontSize: 20,
        color: "#111",
        fontWeight: "900",
    },

    ageBox: {
        borderWidth: 1,
        borderColor: "#C8960C",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginLeft: 8,
    },

    ageText: {
        color: "#6C922E",
        fontSize: 14,
        fontWeight: "900",
    },

    typeText: {
        marginTop: 5,
        fontSize: 20,
        color: "#8E8580",
        fontWeight: "500",
    },

    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: 92,
        backgroundColor: "#F2F2F2",
        paddingHorizontal: 22,
        paddingTop: 12,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    footerLeft: {
        flex: 1,
        marginRight: 12,
    },

    priceText: {
        fontSize: 26,
        color: "#000",
        fontWeight: "900",
    },

    seatCountText: {
        marginTop: 3,
        fontSize: 15,
        color: "#777",
        fontWeight: "600",
    },

    bookingButton: {
        backgroundColor: "#A3262A",
        paddingHorizontal: 34,
        paddingVertical: 14,
        borderRadius: 26,
        borderWidth: 2,
        borderColor: "#6E171D",
    },

    disabledButton: {
        backgroundColor: "#C8BDB8",
        borderColor: "#A99F9A",
    },

    bookingButtonText: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "900",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },

    confirmBox: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 18,
        overflow: "hidden",
    },

    confirmTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#555",
        textAlign: "center",
        marginTop: 28,
        marginBottom: 18,
    },

    confirmContent: {
        fontSize: 21,
        lineHeight: 31,
        color: "#000",
        textAlign: "center",
        paddingHorizontal: 26,
        paddingBottom: 28,
    },

    linkText: {
        color: "#229BD8",
        textDecorationLine: "underline",
    },

    confirmActions: {
        height: 72,
        borderTopWidth: 1,
        borderTopColor: "#D6D6D6",
        flexDirection: "row",
    },

    confirmButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    actionDivider: {
        width: 1,
        backgroundColor: "#D6D6D6",
    },

    cancelText: {
        fontSize: 25,
        color: "red",
        fontWeight: "400",
    },

    agreeText: {
        fontSize: 25,
        color: "#0057FF",
        fontWeight: "500",
    },
});