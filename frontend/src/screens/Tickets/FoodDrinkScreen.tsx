import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppSideMenu from "../../components/AppSideMenu";

const foods = [
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

export default function FoodDrinkScreen({ navigation, route }: any) {
    const {
        cinemaName = "The Sun Cinema",
        movieName = "Tên phim",
        age = "P",
        type = "2D Phụ Đề Việt",
        time = "20:00",
        date = "Thứ 3, 12 Tháng 5, 2026",
        selectedSeats = [],
        totalPrice = 0,
    } = route.params || {};

    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const [showMenu, setShowMenu] = useState(false);

    const increase = (id: number) => {
        setQuantities({
            ...quantities,
            [id]: (quantities[id] || 0) + 1,
        });
    };

    const decrease = (id: number) => {
        const current = quantities[id] || 0;

        if (current <= 0) return;

        setQuantities({
            ...quantities,
            [id]: current - 1,
        });
    };

    const foodTotal = foods.reduce((sum, item) => {
        const quantity = quantities[item.id] || 0;
        return sum + item.price * quantity;
    }, 0);

    const finalTotal = totalPrice + foodTotal;

    const handleNext = () => {
        navigation.navigate("TotalTicketsUser", {
            cinemaName,
            movieName,
            age,
            type,
            time,
            date,
            selectedSeats,
            seatTotal: totalPrice,
            foodTotal,
            finalTotal,
            foods: quantities,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={32} color="#A3262A" />
                </TouchableOpacity>

                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Bắp nước</Text>
                    <Text style={styles.headerSub}>
                        Chọn thêm đồ ăn và thức uống
                    </Text>
                </View>

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <Ionicons name="menu" size={34} color="#A3262A" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.ticketBox}>
                    <View style={styles.ticketHeader}>
                        <Text numberOfLines={1} style={styles.movieName}>
                            {movieName}
                        </Text>

                        <View style={styles.ageBox}>
                            <Text style={styles.ageText}>{age}</Text>
                        </View>
                    </View>

                    <Text style={styles.ticketText}>{cinemaName}</Text>

                    <Text style={styles.ticketText}>
                        {date} • {time}
                    </Text>

                    <Text style={styles.ticketText}>
                        Ghế:{" "}
                        {selectedSeats.length > 0
                            ? selectedSeats.join(", ")
                            : "Chưa chọn"}
                    </Text>

                    <Text style={styles.ticketText}>{type}</Text>

                    <View style={styles.seatTotalRow}>
                        <Text style={styles.seatTotalLabel}>Tiền vé</Text>
                        <Text style={styles.seatTotalValue}>
                            {totalPrice.toLocaleString("vi-VN")} đ
                        </Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Chọn bắp nước</Text>

                {foods.map((item) => {
                    const quantity = quantities[item.id] || 0;

                    return (
                        <View key={item.id} style={styles.foodCard}>
                            <View style={styles.foodImage}>
                                <Ionicons
                                    name="fast-food"
                                    size={42}
                                    color="#D69A00"
                                />
                            </View>

                            <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>{item.name}</Text>

                                <Text style={styles.foodDesc}>{item.desc}</Text>

                                <Text style={styles.foodPrice}>
                                    {item.price.toLocaleString("vi-VN")} đ
                                </Text>
                            </View>

                            <View style={styles.quantityBox}>
                                <TouchableOpacity
                                    style={[
                                        styles.quantityButton,
                                        quantity === 0 && styles.minusDisabled,
                                    ]}
                                    onPress={() => decrease(item.id)}
                                >
                                    <Text style={styles.quantityText}>-</Text>
                                </TouchableOpacity>

                                <Text style={styles.quantityNumber}>
                                    {quantity}
                                </Text>

                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => increase(item.id)}
                                >
                                    <Text style={styles.quantityText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}

                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tiền vé</Text>
                        <Text style={styles.summaryValue}>
                            {totalPrice.toLocaleString("vi-VN")} đ
                        </Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Bắp nước</Text>
                        <Text style={styles.summaryValue}>
                            {foodTotal.toLocaleString("vi-VN")} đ
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.finalLabel}>Tổng thanh toán</Text>
                        <Text style={styles.finalValue}>
                            {finalTotal.toLocaleString("vi-VN")} đ
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalPrice}>
                        {finalTotal.toLocaleString("vi-VN")} đ
                    </Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                    <Text style={styles.nextButtonText}>Tiếp tục</Text>
                </TouchableOpacity>
            </View>

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
        backgroundColor: "#FFF8E8",
    },

    header: {
        height: 86,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E7D7B4",
    },

    headerInfo: {
        flex: 1,
        marginLeft: 14,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "900",
        color: "#4A2A17",
    },

    headerSub: {
        marginTop: 3,
        fontSize: 14,
        color: "#8B641F",
        fontWeight: "600",
    },

    content: {
        flex: 1,
    },

    scrollContent: {
        paddingBottom: 150,
    },

    ticketBox: {
        backgroundColor: "#FFFFFF",
        margin: 16,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E7D7B4",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },

    ticketHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },

    movieName: {
        flex: 1,
        fontSize: 21,
        fontWeight: "900",
        color: "#2F211A",
    },

    ageBox: {
        borderWidth: 1,
        borderColor: "#C8960C",
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },

    ageText: {
        color: "#FF9500",
        fontSize: 14,
        fontWeight: "900",
    },

    ticketText: {
        fontSize: 15,
        color: "#7A5A25",
        marginTop: 5,
        fontWeight: "600",
    },

    seatTotalRow: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#EFE1C3",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    seatTotalLabel: {
        fontSize: 15,
        color: "#6D4D1D",
        fontWeight: "700",
    },

    seatTotalValue: {
        fontSize: 17,
        color: "#8B2D1C",
        fontWeight: "900",
    },

    sectionTitle: {
        fontSize: 23,
        fontWeight: "900",
        color: "#4A2A17",
        marginHorizontal: 16,
        marginBottom: 12,
    },

    foodCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E7D7B4",
    },

    foodImage: {
        width: 70,
        height: 70,
        borderRadius: 16,
        backgroundColor: "#FFF1C6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    foodInfo: {
        flex: 1,
    },

    foodName: {
        fontSize: 17,
        fontWeight: "900",
        color: "#2F211A",
    },

    foodDesc: {
        fontSize: 13,
        color: "#8B7A68",
        marginTop: 4,
        lineHeight: 18,
    },

    foodPrice: {
        fontSize: 16,
        fontWeight: "900",
        color: "#8B2D1C",
        marginTop: 6,
    },

    quantityBox: {
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 8,
    },

    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#8B2D1C",
        justifyContent: "center",
        alignItems: "center",
    },

    minusDisabled: {
        backgroundColor: "#C9BDAE",
    },

    quantityText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "900",
        marginTop: -2,
    },

    quantityNumber: {
        width: 34,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "900",
        color: "#2F211A",
    },

    summaryBox: {
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E7D7B4",
    },

    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    summaryLabel: {
        fontSize: 16,
        color: "#6D4D1D",
        fontWeight: "700",
    },

    summaryValue: {
        fontSize: 16,
        color: "#2F211A",
        fontWeight: "800",
    },

    divider: {
        height: 1,
        backgroundColor: "#EFE1C3",
        marginVertical: 6,
    },

    finalLabel: {
        fontSize: 18,
        color: "#2F211A",
        fontWeight: "900",
    },

    finalValue: {
        fontSize: 20,
        color: "#A3262A",
        fontWeight: "900",
    },

    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: "#E7D7B4",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    totalLabel: {
        fontSize: 13,
        color: "#8B641F",
        fontWeight: "700",
    },

    totalPrice: {
        fontSize: 23,
        color: "#4A2A17",
        fontWeight: "900",
        marginTop: 3,
    },

    nextButton: {
        backgroundColor: "#8B2D1C",
        paddingHorizontal: 34,
        paddingVertical: 14,
        borderRadius: 28,
    },

    nextButtonText: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "900",
    },
});