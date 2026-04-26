import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function MyTicketsScreen() {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState<"upcoming" | "watched">(
        "watched"
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                    <Ionicons name="arrow-back" size={36} color="#B02A34" />
                </TouchableOpacity>

                <Text style={styles.title}>Vé của tôi</Text>

                <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
                    <Feather name="menu" size={36} color="#B02A34" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab("upcoming")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "upcoming" && styles.tabTextActive,
                        ]}
                    >
                        Phim sắp xem
                    </Text>

                    {activeTab === "upcoming" && <View style={styles.underline} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => setActiveTab("watched")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "watched" && styles.tabTextActive,
                        ]}
                    >
                        Phim đã xem
                    </Text>

                    {activeTab === "watched" && <View style={styles.underline} />}
                </TouchableOpacity>
            </View>

            {/* Chỉ hiện khi tab Phim đã xem */}
            {activeTab === "watched" && (
                <View style={styles.noticeBox}>
                    <Text style={styles.noticeText}>
                        Chỉ hiển thị giao dịch online trong 3 tháng gần nhất. Để kiểm tra
                        lịch sử giao dịch tại quầy vui lòng liên hệ hotline: 19006017.
                    </Text>
                </View>
            )}

            {/* Nội dung rỗng */}
            <View style={styles.emptyBox}>
                <Text style={styles.character}>👨‍🍳</Text>

                <Text style={styles.emptyText}>Không có dữ liệu</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#D8D8CC",
    },

    header: {
        height: 96,
        paddingTop: 42,
        paddingHorizontal: 22,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
    },

    title: {
        flex: 1,
        marginLeft: 22,
        fontSize: 32,
        fontWeight: "900",
        color: "#111",
    },

    tabRow: {
        height: 88,
        backgroundColor: "#fff",
        flexDirection: "row",
    },

    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    tabText: {
        fontSize: 28,
        color: "#8D8073",
        fontWeight: "500",
    },

    tabTextActive: {
        color: "#B02A34",
        fontWeight: "700",
    },

    underline: {
        position: "absolute",
        bottom: 0,
        height: 5,
        width: "100%",
        backgroundColor: "#B02A34",
    },

    noticeBox: {
        paddingHorizontal: 22,
        paddingTop: 24,
    },

    noticeText: {
        fontSize: 23,
        lineHeight: 32,
        color: "#807365",
    },

    emptyBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 120,
    },

    character: {
        fontSize: 135,
    },

    emptyText: {
        marginTop: 28,
        fontSize: 30,
        color: "#9A8B7D",
    },
});