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
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import * as signalR from "@microsoft/signalr";
import AppSideMenu from "../../components/AppSideMenu";
import showtimeService from "../../services/showtimeService";
import useAlertStore from "../../store/useAlertStore";

export default function SeatSelectionScreen({ navigation, route }: any) {
    const cinemaName = route.params?.cinemaName || "The Sun Cinema";
    const cinemaId = route.params?.cinemaId;
    const roomId = route.params?.roomId;
    const roomName = route.params?.roomName || "Cinema";
    const movieName = route.params?.movieName || "Tên phim";
    const age = route.params?.age || "P";
    const type = route.params?.type || "2D Phụ Đề Việt";
    const time = route.params?.time || "20:00";
    const date = route.params?.date || "12-05-2026";
    const showtimeId = route.params?.showtimeId;

    const [selectedSeats, setSelectedSeats] = useState<any[]>([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    
    const [layout, setLayout] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [bookedSeatIds, setBookedSeatIds] = useState<number[]>([]);
    const [basePrice, setBasePrice] = useState<number>(75000);

    const showAlert = useAlertStore(state => state.showAlert);

    React.useEffect(() => {
        if (!cinemaId || !roomId || !showtimeId) return;
        
        let connection: signalR.HubConnection | null = null;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const seatService = (await import('../../services/seatService')).default;
                const layoutData = await seatService.getSeatLayout(cinemaId, roomId);
                setLayout(layoutData);

                const statusData = await showtimeService.getSeatStatus(showtimeId);
                setBookedSeatIds(statusData);

                const showtimeData = await showtimeService.getShowtimeById(showtimeId);
                setBasePrice(showtimeData.basePrice);

                const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5126';
                connection = new signalR.HubConnectionBuilder()
                    .withUrl(`${baseUrl}/seathub`)
                    .withAutomaticReconnect()
                    .build();

                await connection.start();
                await connection.invoke("JoinShowtimeGroup", showtimeId.toString());

                connection.on("SeatLocked", async () => {
                    const updatedStatus = await showtimeService.getSeatStatus(showtimeId);
                    setBookedSeatIds(updatedStatus);
                    setSelectedSeats(prev => prev.filter(s => !updatedStatus.includes(s.id)));
                });
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        return () => {
            if (connection) {
                connection.invoke("LeaveShowtimeGroup", showtimeId.toString()).then(() => {
                    connection?.stop();
                }).catch(err => console.log(err));
            }
        };
    }, [cinemaId, roomId, showtimeId]);

    const normalPrice = basePrice;
    const vipPrice = basePrice + 20000;
    const sweetBoxPrice = vipPrice * 2 + 20000;

    const getSeatPrice = (seatType: string) => {
        if (seatType === 'Couple') return sweetBoxPrice;
        if (seatType === 'VIP') return vipPrice;
        return normalPrice;
    };

    const checkOrphans = (seats: any[], occupiedIds: number[]) => {
        let orphanCount = 0;
        for (let i = 0; i < seats.length; i++) {
            const s = seats[i];
            if (occupiedIds.includes(s.id)) continue;
            
            const prevS = seats[i-1];
            const nextS = seats[i+1];
            
            const leftBlocked = !prevS || occupiedIds.includes(prevS.id) || (s.columnIndex - prevS.columnIndex > 1);
            const rightBlocked = !nextS || occupiedIds.includes(nextS.id) || (nextS.columnIndex - s.columnIndex > 1);
            
            if (leftBlocked && rightBlocked) {
                orphanCount++;
            }
        }
        return orphanCount;
    }

    const toggleSeat = (seat: any) => {
        if (bookedSeatIds.includes(seat.id)) return;

        const isSelecting = !selectedSeats.find(s => s.id === seat.id);

        if (isSelecting && selectedSeats.length >= 8) {
            showAlert("Thông báo", "Bạn chỉ được chọn tối đa 8 vé cho mỗi giao dịch.", { type: "warning" });
            return;
        }

        const newSelectedSeats = isSelecting 
            ? [...selectedSeats, seat]
            : selectedSeats.filter((s) => s.id !== seat.id);
        
        setSelectedSeats(newSelectedSeats);
    };

    const getSeatStyle = (seat: any) => {
        if (bookedSeatIds.includes(seat.id)) return styles.bookedSeat;
        if (selectedSeats.find(s => s.id === seat.id)) return styles.selectedSeat;
        
        if (seat.type === 'Couple') return styles.sweetSeat;
        if (seat.type === 'VIP') return styles.vipSeat;

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
        return sum + getSeatPrice(seat.type);
    }, 0);

    const handleOpenConfirm = () => {
        if (selectedSeats.length === 0) return;

        // Check Orphan Seat Rule across the whole layout before allowing to proceed
        if (layout && layout.seats) {
            const rows = Array.from(new Set(layout.seats.map((s: any) => s.rowName)));
            
            for (const rowName of rows) {
                const seatsInRow = layout.seats
                    .filter((s: any) => s.rowName === rowName)
                    .sort((a: any, b: any) => a.columnIndex - b.columnIndex);
                    
                const baselineOccupied = [...bookedSeatIds];
                const currentOccupied = [...bookedSeatIds, ...selectedSeats.map(s => s.id)];
                
                const baselineOrphans = checkOrphans(seatsInRow, baselineOccupied);
                const currentOrphans = checkOrphans(seatsInRow, currentOccupied);
                
                if (currentOrphans > baselineOrphans) {
                    showAlert("Thông báo", "Vui lòng không để trống 1 ghế ở đầu hàng hoặc giữa các ghế đã chọn.", { type: "warning" });
                    return;
                }
            }
        }

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
            selectedSeats: selectedSeats.map(s => `${s.rowName}${s.seatNumber}`),
            selectedSeatIds: selectedSeats.map(s => s.id),
            totalPrice,
            cinemaId,
            roomId,
            showtimeId
        });
    };

    const numRows = layout ? Array.from(new Set(layout.seats.map((s: any) => s.rowName))).length : 10;
    const numCols = layout?.totalColumns || 10;
    const contentWidth = numCols * 36 + 60;
    const contentHeight = numRows * 38 + 150; // ScreenBox + Banner + Seats

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#A3262A" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.cinemaName}>{cinemaName}</Text>
                    <Text style={styles.showtimeText}>
                        {roomName}   {date} {time}
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

                <View style={styles.seatAreaContainer}>
                    {layout ? (
                        <ReactNativeZoomableView
                            maxZoom={2.5}
                            minZoom={Math.min(1, Dimensions.get('window').width / contentWidth)}
                            zoomStep={0.5}
                            initialZoom={Math.min(1, Dimensions.get('window').width / contentWidth)}
                            bindToBorders={true}
                            contentWidth={contentWidth}
                            contentHeight={contentHeight}
                            style={styles.zoomableView}
                        >
                            <View style={{ width: contentWidth, height: contentHeight, alignItems: 'center' }}>
                                <View style={styles.screenBox}>
                                <Text style={styles.screenText}>MÀN HÌNH</Text>
                            </View>

                            <View style={styles.seatArea}>
                                {Array.from(new Set(layout.seats.map((s: any) => s.rowName))).map((rowName: any) => (
                                    <View key={rowName} style={styles.seatRow}>
                                        <Text style={styles.rowLabel}>{rowName}</Text>
                                        <View style={styles.rowSeats}>
                                            {(() => {
                                                const renderedRow = [];
                                                let skipNext = false;
                                                for (let colIdx = 0; colIdx < layout.totalColumns; colIdx++) {
                                                    if (skipNext) {
                                                        skipNext = false;
                                                        continue;
                                                    }
                                                    const seat = layout.seats.find((s: any) => s.rowName === rowName && s.columnIndex === colIdx + 1);
                                                    if (!seat) {
                                                        renderedRow.push(<View key={colIdx} style={styles.emptySeat} />);
                                                    } else {
                                                        const isBooked = bookedSeatIds.includes(seat.id);

                                                        if (seat.type === 'Couple') skipNext = true;
                                                        renderedRow.push(
                                                            <TouchableOpacity
                                                                key={colIdx}
                                                                style={[
                                                                    styles.seat, 
                                                                    getSeatStyle(seat),
                                                                    seat.type === 'Couple' ? styles.seatCouple : null
                                                                ]}
                                                                onPress={() => toggleSeat(seat)}
                                                                activeOpacity={isBooked ? 1 : 0.2}
                                                            >
                                                                {isBooked && (
                                                                    <>
                                                                        <View style={styles.crossLine1} />
                                                                        <View style={styles.crossLine2} />
                                                                    </>
                                                                )}
                                                                <Text style={styles.seatText}>{seat.seatNumber}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    }
                                                }
                                                return renderedRow;
                                            })()}
                                        </View>
                                        <Text style={styles.rowLabel}>{rowName}</Text>
                                    </View>
                                ))}
                            </View>
                            </View>
                        </ReactNativeZoomableView>
                    ) : (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>{isLoading ? "Đang tải..." : "Chưa có sơ đồ ghế"}</Text>
                    )}
                </View>

                <View style={styles.noteBox}>
                    <View style={styles.noteItem}>
                        <View style={[styles.noteColor, styles.bookedSeat, { justifyContent: 'center', alignItems: 'center' }]}>
                            <View style={styles.crossLine1} />
                            <View style={styles.crossLine2} />
                        </View>
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
                            ? `${selectedSeats.length} ghế: ${selectedSeats.map(s => `${s.rowName}${s.seatNumber}`).join(", ")}`
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

    seatAreaContainer: {
        height: 400, // Cấp đủ không gian dọc để có thể zoom và pan
        width: "100%",
    },

    zoomableView: {
        alignItems: "center",
        justifyContent: "center",
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
        alignItems: "center",
        marginBottom: 8,
    },

    rowLabel: {
        width: 20,
        textAlign: "center",
        fontWeight: "bold",
        color: "#8A7851",
    },

    rowSeats: {
        flexDirection: "row",
        marginHorizontal: 10,
    },

    seat: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 3,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        overflow: "hidden",
    },

    seatCouple: {
        width: 66,
    },

    emptySeat: {
        width: 30,
        height: 30,
        marginHorizontal: 3,
    },

    normalSeat: {
        backgroundColor: "#BDBDBD",
    },

    vipSeat: {
        backgroundColor: "#FFCC00",
    },

    sweetSeat: {
        backgroundColor: "#9B59B6",
    },

    selectedSeat: {
        backgroundColor: "#E74C3C",
        borderColor: "#C0392B",
    },

    bookedSeat: {
        backgroundColor: "#7F8C8D",
    },

    crossLine1: {
        position: "absolute",
        width: "150%",
        height: 1.5,
        backgroundColor: "#333",
        transform: [{ rotate: "45deg" }],
    },

    crossLine2: {
        position: "absolute",
        width: "150%",
        height: 1.5,
        backgroundColor: "#333",
        transform: [{ rotate: "-45deg" }],
    },

    seatText: {
        color: "#111",
        fontSize: 10,
        fontWeight: "bold",
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
        borderRadius: 4,
        overflow: "hidden",
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