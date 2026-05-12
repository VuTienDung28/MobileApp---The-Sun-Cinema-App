import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

const promotions = [
    {
        id: 1,
        title: "Đồng giá 79.000đ cho thành viên",
        date: "06/04/2026",
        image: "https://via.placeholder.com/700x350/FBE6A2/3B210F?text=DONG+GIA+79.000D",
        content:
            "Khách hàng là thành viên The Sun Cinema mua vé xem phim 2D rạp tiêu chuẩn chỉ còn 79.000đ. Áp dụng từ thứ 2 đến thứ 6 tại một số cụm rạp.",
    },
    {
        id: 2,
        title: "Combo bắp nước ưu đãi",
        date: "10/05/2026",
        image: "https://via.placeholder.com/700x350/FFD66B/3B210F?text=COMBO+BAP+NUOC",
        content:
            "Mua combo bắp nước chỉ từ 59.000đ khi đặt vé online trên ứng dụng The Sun Cinema.",
    },
    {
        id: 3,
        title: "Thứ tư vui vẻ - giảm 20%",
        date: "12/05/2026",
        image: "https://via.placeholder.com/700x350/FFF0C2/3B210F?text=GIAM+20%25",
        content:
            "Giảm 20% giá vé cho tất cả khách hàng vào thứ tư hằng tuần. Không áp dụng đồng thời với ưu đãi khác.",
    },
];

export default function PromotionScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="#131312ff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Ưu đãi</Text>

                <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
                    <Feather name="menu" size={30} color="#121211ff" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {promotions.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.navigate("PromotionDetail", {
                                promotion: item,
                            })
                        }
                    >
                        <Image source={{ uri: item.image }} style={styles.image} />

                        <View style={styles.info}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.date}>{item.date}</Text>
                            <Text numberOfLines={2} style={styles.desc}>
                                {item.content}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF8E8",
    },

    header: {
        height: 76,
        backgroundColor: "#FFF",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#E8D9BA",
    },

    headerTitle: {
        flex: 1,
        marginLeft: 16,
        fontSize: 24,
        fontWeight: "900",
        color: "#2F211A",
    },

    content: {
        padding: 18,
        paddingBottom: 40,
    },

    card: {
        backgroundColor: "#FFF",
        borderRadius: 18,
        marginBottom: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E8D9BA",
        elevation: 3,
    },

    image: {
        width: "100%",
        height: 170,
        backgroundColor: "#FFE6A5",
    },

    info: {
        padding: 14,
    },

    title: {
        fontSize: 20,
        fontWeight: "900",
        color: "#3B210F",
    },

    date: {
        marginTop: 6,
        fontSize: 14,
        color: "#9B7A45",
        fontWeight: "700",
    },

    desc: {
        marginTop: 8,
        fontSize: 15,
        color: "#5A3A1D",
        lineHeight: 22,
    },
});