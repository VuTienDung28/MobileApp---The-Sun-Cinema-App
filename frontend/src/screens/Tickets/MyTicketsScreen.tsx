import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, ActivityIndicator, SafeAreaView, Dimensions, ScrollView } from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axiosClient from "../../api/axiosClient";
import { getImageUrl } from "../../utils/imageUtils";

const { width } = Dimensions.get("window");

// Type definitions
interface Ticket {
    seatName: string;
    seatType: string;
    price: number;
    ticketCode: string;
    qrCodeUrl: string;
}

interface Booking {
    id: number;
    movieTitle: string;
    moviePosterUrl: string;
    movieDuration: number;
    movieAgeRating: string;
    movieGenres: string;
    cinemaName: string;
    cinemaAddress: string;
    roomName: string;
    comboNames: string;
    showtimeStart: string;
    totalPrice: number;
    bookingTime: string;
    tickets: Ticket[];
}

export default function MyTicketsScreen() {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<"upcoming" | "watched">("upcoming");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/Booking/my-tickets");
            if (res && res.data) {
                setBookings(res.data);
            }
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const isUpcoming = (b: Booking) => {
        const startTime = new Date(b.showtimeStart).getTime();
        // Giả sử phim kéo dài 120 phút nếu không có thông tin thời lượng
        const durationMs = (b.movieDuration || 120) * 60000; 
        const endTime = startTime + durationMs;
        return endTime > new Date().getTime();
    };

    const upcomingBookings = bookings.filter(isUpcoming);
    const watchedBookings = bookings.filter(b => !isUpcoming(b));
    const displayBookings = activeTab === "upcoming" ? upcomingBookings : watchedBookings;

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };

    const formatTime = (dateString: string) => {
        const d = new Date(dateString);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN') + " VND";
    };

    const openTicketDetail = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalVisible(true);
    };

    const renderTicketItem = ({ item }: { item: Booking }) => {
        const seatNames = item.tickets.map(t => t.seatName).join(", ");
        return (
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={() => openTicketDetail(item)}>
                {/* Cinema Info */}
                <View style={styles.cinemaHeader}>
                    <View style={styles.cinemaLogoPlaceholder}>
                        <Text style={styles.cinemaLogoText}>{item.cinemaName.charAt(0)}</Text>
                    </View>
                    <View style={styles.cinemaInfo}>
                        <Text style={styles.cinemaNameText} numberOfLines={1}>{item.cinemaName}</Text>
                        <Text style={styles.cinemaAddressText} numberOfLines={2}>{item.cinemaAddress || "Đang cập nhật địa chỉ"}</Text>
                    </View>
                </View>

                {/* Movie Info */}
                <View style={styles.movieSection}>
                    <Image 
                        source={{ uri: getImageUrl(item.moviePosterUrl) }} 
                        style={styles.posterImage} 
                    />
                    <View style={styles.movieDetails}>
                        <Text style={styles.movieTitle} numberOfLines={2}>{item.movieTitle}</Text>
                        <Text style={styles.movieGenres}>{item.movieGenres || "Không có thông tin"}</Text>
                        
                        <View style={styles.tagsRow}>
                            <View style={styles.tagBox}>
                                <Text style={styles.tagText}>{item.movieDuration ? `${item.movieDuration} phút` : "N/A"}</Text>
                            </View>
                            <View style={[styles.tagBox, { backgroundColor: '#F8E6E7' }]}>
                                <Text style={[styles.tagText, { color: '#B02A34' }]}>{item.movieAgeRating || "N/A"}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.dashedLine} />

                {/* Showtime Info */}
                <View style={styles.showtimeSection}>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Ngày chiếu</Text>
                        <Text style={styles.infoValue}>{formatDate(item.showtimeStart)}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Suất chiếu</Text>
                        <Text style={styles.infoValue}>{formatTime(item.showtimeStart)}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Phòng chiếu</Text>
                        <Text style={styles.infoValue}>{item.roomName}</Text>
                    </View>
                </View>

                <View style={styles.showtimeSection}>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Số lượng vé</Text>
                        <Text style={styles.infoValue}>{item.tickets.length} vé</Text>
                    </View>
                    <View style={styles.infoCol}>
                        <Text style={styles.infoLabel}>Số ghế ({item.tickets.length})</Text>
                        <Text style={styles.infoValue}>{seatNames}</Text>
                    </View>
                    <View style={styles.infoCol}>
                        {/* Empty spacer */}
                    </View>
                </View>

                <View style={styles.dashedLine} />

                {/* Total */}
                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Tổng tiền thanh toán</Text>
                    <View style={styles.totalValueContainer}>
                        <Text style={styles.totalAmount}>{formatCurrency(item.totalPrice)}</Text>
                        <Text style={styles.vatText}>Đã bao gồm VAT</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                        <Ionicons name="chevron-back" size={32} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Vé của tôi</Text>
                    <TouchableOpacity onPress={() => {}}>
                        <Text style={styles.helpText}>Trợ giúp</Text>
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabWrapper}>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === "upcoming" && styles.tabBtnActive]}
                            onPress={() => setActiveTab("upcoming")}
                        >
                            <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>Vé chưa xem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === "watched" && styles.tabBtnActive]}
                            onPress={() => setActiveTab("watched")}
                        >
                            <Text style={[styles.tabText, activeTab === "watched" && styles.tabTextActive]}>Vé đã xem</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List */}
                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#B02A34" />
                    </View>
                ) : displayBookings.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <MaterialCommunityIcons name="ticket-confirmation-outline" size={80} color="#D8D8CC" />
                        <Text style={styles.emptyText}>Chưa có vé nào ở đây</Text>
                    </View>
                ) : (
                    <FlatList
                        data={displayBookings}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderTicketItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Modal Chi Tiết Vé */}
                <Modal
                    visible={isModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                    <Ionicons name="close" size={28} color="#111" />
                                </TouchableOpacity>
                                <Text style={styles.modalTitle}>Thông tin chi tiết</Text>
                                <View style={{ width: 28 }} />
                            </View>

                            {selectedBooking && (
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                                    <View style={styles.modalTicketCard}>
                                        <Text style={styles.modalMovieTitle}>{selectedBooking.movieTitle} <Text style={styles.modalAgeRating}> {selectedBooking.movieAgeRating} </Text></Text>
                                        <Text style={styles.modalSubInfo}>{formatDate(selectedBooking.showtimeStart)}</Text>
                                        <Text style={styles.modalSubInfo}>{formatTime(selectedBooking.showtimeStart)} / {selectedBooking.movieDuration} phút</Text>
                                        
                                        <View style={styles.modalCinemaSection}>
                                            <Text style={styles.modalCinemaName}>Rạp {selectedBooking.cinemaName}</Text>
                                            <Text style={styles.modalCinemaAddress}>{selectedBooking.cinemaAddress}</Text>
                                        </View>

                                        <View style={styles.modalSeatsRow}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalLabelText}>Ghế</Text>
                                                <Text style={styles.modalValueText}>{selectedBooking.tickets.map(t => t.seatName).join(", ")}</Text>
                                            </View>
                                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                                <Text style={styles.modalLabelText}>Phòng chiếu</Text>
                                                <Text style={styles.modalValueText}>{selectedBooking.roomName}</Text>
                                            </View>
                                        </View>

                                        {selectedBooking.comboNames ? (
                                            <View style={styles.modalComboSection}>
                                                <Text style={styles.modalLabelText}>{selectedBooking.comboNames}</Text>
                                            </View>
                                        ) : null}

                                        <View style={styles.modalQRSection}>
                                            <View style={styles.qrContainer}>
                                                {selectedBooking.tickets[0]?.qrCodeUrl ? (
                                                    <Image source={{ uri: selectedBooking.tickets[0].qrCodeUrl }} style={styles.qrImage} />
                                                ) : (
                                                    <View style={styles.noQrBox}><Text>Chưa có QR</Text></View>
                                                )}
                                            </View>
                                            <Text style={styles.qrInstruction}>
                                                Vui lòng đưa mã số này đến quầy vé {selectedBooking.cinemaName} để nhận vé của bạn.
                                            </Text>
                                        </View>

                                        <View style={styles.modalTotalSection}>
                                            <Text style={styles.modalTotalLabel}>Tổng Cộng</Text>
                                            <Text style={styles.modalTotalValue}>{formatCurrency(selectedBooking.totalPrice)}</Text>
                                            <Text style={styles.modalNote}>Lưu ý không chấp nhận hoàn tiền hoặc đổi vé đã thanh toán thành công.</Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: "#F4F4F6",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
    helpText: {
        fontSize: 16,
        color: "#B02A34",
        fontWeight: "600",
    },
    tabContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    tabWrapper: {
        flexDirection: "row",
        backgroundColor: "#fff",
    },
    tabBtn: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        marginRight: 10,
    },
    tabBtnActive: {
        borderColor: "#B02A34",
        backgroundColor: "#fff",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
    },
    tabTextActive: {
        color: "#B02A34",
    },
    listContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    centerBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#888",
    },
    cardContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cinemaHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    cinemaLogoPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    cinemaLogoText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },
    cinemaInfo: {
        flex: 1,
    },
    cinemaNameText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
        marginBottom: 2,
    },
    cinemaAddressText: {
        fontSize: 12,
        color: "#666",
    },
    movieSection: {
        flexDirection: "row",
        marginBottom: 16,
    },
    posterImage: {
        width: 80,
        height: 120,
        borderRadius: 8,
        backgroundColor: "#EFEFEF",
    },
    movieDetails: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "flex-start",
    },
    movieTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
        marginBottom: 6,
    },
    movieGenres: {
        fontSize: 13,
        color: "#666",
        marginBottom: 10,
    },
    tagsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    tagBox: {
        backgroundColor: "#F0F0F0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#555",
    },
    dashedLine: {
        height: 1,
        borderWidth: 1,
        borderColor: "#EAEAEA",
        borderStyle: "dashed",
        borderRadius: 1,
        marginVertical: 16,
    },
    showtimeSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    infoCol: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#111",
    },
    totalSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 14,
        color: "#666",
    },
    totalValueContainer: {
        alignItems: "flex-end",
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: "800",
        color: "#A5BD5A", // Greenish color like the mockup
    },
    vatText: {
        fontSize: 10,
        color: "#999",
        marginTop: 2,
    },

    /* Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#E6DFD6", // beige background similar to mockup 1
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    modalScroll: {
        padding: 20,
    },
    modalTicketCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalMovieTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#333",
        marginBottom: 8,
    },
    modalAgeRating: {
        fontSize: 14,
        color: "#B02A34",
        backgroundColor: "#F8E6E7",
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    modalSubInfo: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    modalCinemaSection: {
        marginTop: 16,
        marginBottom: 16,
    },
    modalCinemaName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },
    modalCinemaAddress: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    modalSeatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalLabelText: {
        fontSize: 12,
        color: "#888",
        marginBottom: 4,
    },
    modalValueText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },
    modalComboSection: {
        marginBottom: 24,
    },
    modalQRSection: {
        alignItems: "center",
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#EAEAEA",
        marginBottom: 20,
    },
    qrContainer: {
        padding: 10,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#EAEAEA",
        borderRadius: 8,
        marginBottom: 12,
    },
    qrImage: {
        width: 180,
        height: 180,
    },
    noQrBox: {
        width: 180,
        height: 180,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    qrInstruction: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
        paddingHorizontal: 20,
    },
    modalTotalSection: {
        alignItems: "center",
    },
    modalTotalLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    modalTotalValue: {
        fontSize: 22,
        fontWeight: "800",
        color: "#333",
        marginBottom: 12,
    },
    modalNote: {
        fontSize: 11,
        color: "#999",
        textAlign: "center",
    },
});