import useAuthStore from "../../store/useAuthStore";
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TheaterShowtimeScreen({ navigation, route }: any) {
    const [selectedDate, setSelectedDate] = useState(0);
    const [showMenu, setShowMenu] = useState(false);

    const cinemaName =
        route.params?.cinemaName || "The Sun Hồ Gươm";

    const dates = [
        { day: "Hôm nay", date: 10, full: "Chủ nhật, 10 Tháng 5, 2026" },
        { day: "T2", date: 11, full: "Thứ hai, 11 Tháng 5, 2026" },
        { day: "T3", date: 12, full: "Thứ ba, 12 Tháng 5, 2026" },
        { day: "T4", date: 13, full: "Thứ tư, 13 Tháng 5, 2026" },
        { day: "T5", date: 14, full: "Thứ năm, 14 Tháng 5, 2026" },
        { day: "T6", date: 15, full: "Thứ sáu, 15 Tháng 5, 2026" },
        { day: "T7", date: 16, full: "Thứ bảy, 16 Tháng 5, 2026" },
    ];

    const movies = [
        {
            movieId: 1,
            name: "YÊU NỮ THÍCH HÀNG HIỆU 2",
            age: "T13",
            type: "2D Phụ Đề Việt",
            times: ["16:30", "17:10", "18:10", "19:00", "19:40", "20:30"],
        },
        {
            movieId: 2,
            name: "MORTAL KOMBAT: CUỘC CHIẾN SINH TỬ",
            age: "T18",
            type: "2D Phụ Đề Việt",
            times: ["16:50", "18:00", "19:30", "20:30", "20:50", "22:00"],
        },
        {
            movieId: 3,
            name: "PHI PHÔNG: QUỶ MÁU RỪNG THIÊNG",
            age: "T16",
            type: "2D Phụ Đề Anh",
            times: ["17:40"],
        },
        {
            movieId: 4,
            name: "THÁM TỬ KIÊN AN PHỦ",
            age: "T16",
            type: "2D Phụ Đề Anh",
            times: ["21:20", "23:30"],
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{cinemaName}</Text>

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <Ionicons name="menu" size={27} color="#8B641F" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.dateRow}>
                    {dates.map((item, index) => {
                        const isActive = selectedDate === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={styles.dateItem}
                                onPress={() => setSelectedDate(index)}
                            >
                                <Text style={styles.dayText}>{item.day}</Text>

                                <View
                                    style={
                                        isActive
                                            ? styles.activeDate
                                            : styles.normalDate
                                    }
                                >
                                    <Text
                                        style={
                                            isActive
                                                ? styles.activeDateText
                                                : styles.dateText
                                        }
                                    >
                                        {item.date}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.fullDate}>
                    {dates[selectedDate].full}
                </Text>

                {movies.map((movie) => (
                    <View key={movie.movieId} style={styles.movieCard}>
                        <TouchableOpacity
                            style={styles.movieHeader}
                            onPress={() =>
                                navigation.navigate("MovieDetail", {
                                    movieId: movie.movieId,
                                })
                            }
                        >
                            <Text style={styles.movieName}>
                                {movie.name}{" "}
                                <Text style={styles.age}>{movie.age}</Text>
                            </Text>

                            <Ionicons
                                name="chevron-forward"
                                size={22}
                                color="#D69A00"
                            />
                        </TouchableOpacity>

                        <Text style={styles.typeText}>● {movie.type}</Text>

                        <View style={styles.timeWrap}>
                            {movie.times.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    style={styles.timeBox}
                                    onPress={() =>
                                        navigation.navigate("SeatSelection", {
                                            cinemaName: cinemaName,
                                            movieId: movie.movieId,
                                            movieName: movie.name,
                                            age: movie.age,
                                            type: movie.type,
                                            time: time,
                                            date: dates[selectedDate].full,
                                        })
                                    }
                                >
                                    <Text style={styles.timeText}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={{ height: 40 }} />
            </ScrollView>

            <SideMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                navigation={navigation}
            />
        </SafeAreaView>
    );
}

function SideMenu({ visible, onClose, navigation }: any) {

    const { fullName } = useAuthStore();

    const go = (screen: string) => {
        onClose();
        navigation.navigate(screen);
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.modalWrap}>
                <TouchableOpacity style={styles.leftBlank} onPress={onClose} />

                <View style={styles.sideMenu}>
                    <TouchableOpacity style={styles.menuClose} onPress={onClose}>
                        <Ionicons name="menu" size={36} color="#e8e1e2ff" />
                    </TouchableOpacity>

                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>👨‍🍳</Text>
                    </View>

                    <Text style={styles.userName}>
                        {fullName || "Người dùng"}
                    </Text>
                    <Text style={styles.memberRole}>Thẻ thành viên</Text>


                    <TouchableOpacity
                        style={styles.bigLink}
                        onPress={() => go("MovieList")}
                    >
                        <Text style={styles.bigLinkText}>Đặt vé theo Phim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.bigLink}
                        onPress={() => go("Theater")}
                    >
                        <Text style={styles.bigLinkText}>Đặt vé theo Rạp</Text>
                    </TouchableOpacity>

                    <View style={styles.grid}>
                        <MenuIcon
                            icon="home-outline"
                            text="Trang chủ"
                            onPress={() => go("UserHome")}
                        />
                        <MenuIcon
                            icon="person-outline"
                            text="Thành viên"
                            onPress={() => go("Profile")}
                        />
                        <MenuIcon
                            icon="information-circle-outline"
                            text="Rạp"
                            onPress={() => go("Theater")}
                        />
                        <MenuIcon
                            icon="gift-outline"
                            text="Tin mới & Ưu đãi"
                            onPress={() => go("Menu")}
                        />
                        <MenuIcon
                            icon="ticket-outline"
                            text="Vé của tôi"
                            onPress={() => go("Tickets")}
                        />
                    </View>

                    <TouchableOpacity style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

function MenuIcon({ icon, text, onPress }: any) {
    return (
        <TouchableOpacity style={styles.menuIcon} onPress={onPress}>
            <Ionicons name={icon} size={34} color="#FFF" />
            <Text style={styles.menuIconText}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF9EC",
    },

    header: {
        height: 56,
        backgroundColor: "#FFF",
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        elevation: 2,
    },

    headerTitle: {
        flex: 1,
        marginLeft: 14,
        fontSize: 16,
        fontWeight: "900",
        color: "#2F211A",
    },

    dateRow: {
        backgroundColor: "#FFF1CB",
        flexDirection: "row",
        paddingVertical: 8,
        justifyContent: "space-around",
    },

    dateItem: {
        alignItems: "center",
    },

    dayText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#5A4A3B",
    },

    activeDate: {
        marginTop: 4,
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "#F6B600",
        justifyContent: "center",
        alignItems: "center",
    },

    normalDate: {
        marginTop: 4,
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
    },

    activeDateText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "900",
    },

    dateText: {
        color: "#2F211A",
        fontSize: 14,
        fontWeight: "800",
    },

    fullDate: {
        backgroundColor: "#FFF1CB",
        textAlign: "center",
        paddingBottom: 12,
        fontSize: 13,
        fontWeight: "700",
        color: "#5A4A3B",
    },

    movieCard: {
        backgroundColor: "#FFF",
        paddingHorizontal: 10,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#EFE6D8",
    },

    movieHeader: {
        flexDirection: "row",
        alignItems: "center",
    },

    movieName: {
        flex: 1,
        fontSize: 15,
        fontWeight: "900",
        color: "#4A2A17",
    },

    age: {
        fontSize: 10,
        color: "#D69A00",
    },

    typeText: {
        marginTop: 12,
        fontSize: 12,
        fontWeight: "700",
        color: "#8B641F",
    },

    timeWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
        gap: 8,
    },

    timeBox: {
        borderWidth: 1,
        borderColor: "#E8D9BA",
        borderRadius: 5,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "#FFFDF8",
    },

    timeText: {
        fontSize: 12,
        fontWeight: "800",
        color: "#4A2A17",
    },

    modalWrap: {
        flex: 1,
        flexDirection: "row",
    },

    leftBlank: {
        width: 85,
        backgroundColor: "rgba(255,255,255,0.85)",
    },

    sideMenu: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.92)",
        paddingHorizontal: 22,
        paddingTop: 35,
    },

    menuClose: {
        marginBottom: 8,
    },

    avatar: {
        alignSelf: "center",
        width: 105,
        height: 105,
        borderRadius: 55,
        backgroundColor: "#ebec95ff",
        alignItems: "center",
        justifyContent: "center",
    },

    avatarText: {
        fontSize: 58,
    },

    userName: {
        marginTop: 14,
        textAlign: "center",
        color: "#FFF",
        fontSize: 22,
        fontWeight: "700",
    },

    memberRole: {
        textAlign: "center",
        color: "#edeac9ff",
        fontSize: 16,
        marginTop: 6,
    },

    cardBox: {
        marginTop: 18,
        backgroundColor: "#FFF",
        padding: 14,
    },

    cardTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: "#111",
    },

    barcode: {
        fontSize: 28,
        letterSpacing: 2,
        textAlign: "center",
        color: "#000",
        marginTop: 10,
    },

    cardCode: {
        textAlign: "center",
        fontSize: 15,
        color: "#111",
    },

    bigLink: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        paddingVertical: 16,
        alignItems: "center",
    },

    bigLinkText: {
        color: "#FFF",
        fontSize: 22,
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 18,
    },

    menuIcon: {
        width: "33.33%",
        alignItems: "center",
        marginBottom: 24,
    },

    menuIconText: {
        color: "#FFF",
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },

    logoutBtn: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        paddingVertical: 16,
        alignItems: "center",
    },

    logoutText: {
        color: "#FFF",
        fontSize: 24,
    },
});