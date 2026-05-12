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

export default function PromotionDetailScreen({ navigation, route }: any) {
    const { promotion } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={30} color="#0c0c0cff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Chi tiết ưu đãi</Text>

                <TouchableOpacity onPress={() => navigation.navigate("Menu")}>
                    <Feather name="menu" size={30} color="#0b0b0aff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: promotion.image }} style={styles.image} />

                <View style={styles.body}>
                    <Text style={styles.title}>{promotion.title}</Text>
                    <Text style={styles.date}>{promotion.date}</Text>

                    <Text style={styles.sectionTitle}>1. Đối tượng áp dụng:</Text>

                    <Text style={styles.content}>
                        {promotion.content}
                    </Text>

                    <Text style={styles.sectionTitle}>2. Điều kiện áp dụng:</Text>

                    <Text style={styles.content}>
                        - Áp dụng cho khách hàng đặt vé trên ứng dụng The Sun Cinema.{"\n\n"}
                        - Không áp dụng đồng thời với các chương trình khuyến mãi khác.{"\n\n"}
                        - Số lượng ưu đãi có hạn tùy theo từng rạp.
                    </Text>

                    <Text style={styles.sectionTitle}>3. Danh sách rạp áp dụng:</Text>

                    <Text style={styles.content}>
                        - The Sun Hồ Gươm{"\n"}
                        - The Sun Hà Đông{"\n"}
                        - The Sun Hai Bà Trưng{"\n"}
                        - The Sun Cầu Giấy
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#E8E0D0",
    },

    header: {
        height: 76,
        backgroundColor: "#FFF",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerTitle: {
        flex: 1,
        marginLeft: 16,
        fontSize: 24,
        fontWeight: "900",
        color: "#2F211A",
    },

    image: {
        width: "100%",
        height: 290,
        backgroundColor: "#FFE6A5",
    },

    body: {
        padding: 18,
    },

    title: {
        fontSize: 26,
        fontWeight: "900",
        color: "#4A2A17",
        lineHeight: 36,
    },

    date: {
        marginTop: 12,
        fontSize: 17,
        color: "#8B7A62",
        fontWeight: "700",
    },

    sectionTitle: {
        marginTop: 30,
        fontSize: 22,
        fontWeight: "900",
        color: "#2F211A",
    },

    content: {
        marginTop: 16,
        fontSize: 20,
        lineHeight: 34,
        color: "#2F211A",
    },
});