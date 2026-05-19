import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";
import AppSideMenu from "../../components/AppSideMenu";

type Props = NativeStackScreenProps<RootStackParamList, "MovieBooking">;

type ShowtimeGroup = {
    format: string;
    tag?: string;
    times: string[];
};

type Cinema = {
    id: number;
    name: string;
    showtimes: ShowtimeGroup[];
};

/* MOCK DATA
const dates = [
    { day: "Hôm nay", date: "12", full: "Thứ 3, 12 Tháng 5, 2026" },
    { day: "T4", date: "13", full: "Thứ 4, 13 Tháng 5, 2026" },
    { day: "T5", date: "14", full: "Thứ 5, 14 Tháng 5, 2026" },
    { day: "T6", date: "15", full: "Thứ 6, 15 Tháng 5, 2026" },
    { day: "T7", date: "16", full: "Thứ 7, 16 Tháng 5, 2026" },
    { day: "CN", date: "17", full: "Chủ nhật, 17 Tháng 5, 2026" },
    { day: "T2", date: "18", full: "Thứ 2, 18 Tháng 5, 2026" },
];

const cinemas: Cinema[] = [
    {
        id: 1,
        name: "The Sun Hồ Gươm",
        showtimes: [
            {
                format: "2D Phụ Đề Việt",
                times: ["09:30", "13:20", "18:30", "21:15"],
            },
        ],
    },
    ...
];
*/

const MovieBookingScreen: React.FC<Props> = ({ navigation, route }) => {
    const movieTitle =
        route.params?.movieTitle ||
        route.params?.movieName ||
        "YÊU NỮ THÍCH HÀNG HIỆU 2";

    const [selectedDateIndex, setSelectedDateIndex] = useState(0);
    const [openedCinemaId, setOpenedCinemaId] = useState<number | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const [realDates, setRealDates] = useState<any[]>([]);
    const [realCinemas, setRealCinemas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        const today = new Date();
        const dArr = [];
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        for(let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dArr.push({
                day: i === 0 ? "Hôm nay" : days[d.getDay()],
                date: d.getDate(),
                full: `${days[d.getDay()]}, ${d.getDate()} Tháng ${d.getMonth() + 1}, ${d.getFullYear()}`,
                value: d.toISOString().split('T')[0]
            });
        }
        setRealDates(dArr);
    }, []);

    React.useEffect(() => {
        const movieId = route.params?.movieId;
        if (!movieId || realDates.length === 0) return;
        
        setIsLoading(true);
        import('../../services/showtimeService').then(module => {
            module.default.getShowtimesByMovie(movieId, realDates[selectedDateIndex].value).then(data => {
                setRealCinemas(data);
                if (data.length > 0) setOpenedCinemaId(data[0].cinemaId);
                setIsLoading(false);
            }).catch(e => {
                console.log(e);
                setIsLoading(false);
            });
        });
    }, [route.params?.movieId, selectedDateIndex, realDates]);

    const handlePressShowtime = (
        cinemaName: string,
        cinemaId: number,
        time: string,
        format: string,
        showtimeId: number,
        roomId: number,
        roomName: string
    ) => {
        navigation.navigate("SeatSelection", {
            cinemaName,
            cinemaId,
            movieId: route.params?.movieId,
            movieName: movieTitle,
            age: route.params?.age || "P",
            type: format,
            time,
            date: realDates[selectedDateIndex].full,
            showtimeId,
            roomId,
            roomName
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.headerIcon}
                >
                    <Ionicons name="arrow-back" size={32} color="#111111" />
                </TouchableOpacity>

                <Text numberOfLines={1} style={styles.headerTitle}>
                    {movieTitle.toUpperCase()}
                </Text>

                <TouchableOpacity style={styles.locationIcon}>
                    <Ionicons
                        name="navigate-outline"
                        size={30}
                        color="#C9C3BD"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setShowMenu(true)}
                    style={styles.headerIcon}
                >
                    <Ionicons name="menu" size={36} color="#111111" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formatRow}>
                    <Text style={styles.formatTitle}>Định dạng phim</Text>

                    <TouchableOpacity style={styles.allRow}>
                        <Text style={styles.allText}>TẤT CẢ</Text>
                        <Ionicons
                            name="chevron-forward"
                            size={28}
                            color="#C9C3BD"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.dateSection}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.dateList}
                    >
                        {realDates.map((item, index) => {
                            const isActive = selectedDateIndex === index;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.dateItem}
                                    onPress={() => setSelectedDateIndex(index)}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isActive && styles.activeDayText,
                                        ]}
                                    >
                                        {item.day}
                                    </Text>

                                    <View
                                        style={[
                                            styles.dateCircle,
                                            isActive && styles.activeDateCircle,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dateNumber,
                                                isActive && styles.activeDateNumber,
                                            ]}
                                        >
                                            {item.date}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {realDates.length > 0 && (
                        <Text style={styles.fullDateText}>{realDates[selectedDateIndex].full}</Text>
                    )}
                </View>

                <View style={styles.cinemaList}>
                    {isLoading && (
                        <Text style={{ textAlign: 'center', marginTop: 20 }}>Đang tải...</Text>
                    )}
                    
                    {!isLoading && realCinemas.map((cinema) => {
                        const isOpen = openedCinemaId === cinema.cinemaId;

                        return (
                            <View key={cinema.cinemaId} style={styles.cinemaItem}>
                                <TouchableOpacity
                                    style={styles.theaterRow}
                                    onPress={() =>
                                        setOpenedCinemaId(isOpen ? null : cinema.cinemaId)
                                    }
                                >
                                    <Ionicons
                                        name="sunny"
                                        size={26}
                                        color="#FFD000"
                                    />

                                    <Text style={styles.theaterName}>
                                        {cinema.cinemaName}
                                    </Text>

                                    <Ionicons
                                        name={
                                            isOpen
                                                ? "chevron-up"
                                                : "chevron-down"
                                        }
                                        size={26}
                                        color="#777777"
                                    />
                                </TouchableOpacity>

                                {isOpen && (
                                    <View style={styles.showtimeContent}>
                                        <View style={styles.showtimeGroup}>
                                            <View style={styles.formatLine}>
                                                <View style={styles.orangeCircle} />
                                                <Text style={styles.showtimeFormat}>
                                                    2D Phụ Đề Việt
                                                </Text>
                                            </View>

                                            <View style={styles.timeList}>
                                                {cinema.showtimes.map((st: any) => {
                                                    const d = new Date(st.startTime);
                                                    const timeStr = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
                                                    
                                                    return (
                                                        <TouchableOpacity
                                                            key={st.id}
                                                            style={styles.timeButton}
                                                            onPress={() =>
                                                                handlePressShowtime(
                                                                    cinema.cinemaName,
                                                                    cinema.cinemaId,
                                                                    timeStr,
                                                                    "2D Phụ Đề Việt",
                                                                    st.id,
                                                                    st.roomId,
                                                                    st.roomName
                                                                )
                                                            }
                                                        >
                                                            <Text style={styles.timeText}>
                                                                {timeStr}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.bottomItem}>
                    {/* <Text style={styles.bottomNumber}>22</Text> */}
                    <Text style={styles.bottomLabel}>Gợi Ý Cho Bạn</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.bottomItem}>
                    {/* <Text style={styles.bottomNumber}>64</Text> */}
                    <Text style={styles.bottomLabel}>Tất Cả Rạp</Text>
                </TouchableOpacity>
            </View>

            <AppSideMenu
                visible={showMenu}
                onClose={() => setShowMenu(false)}
                navigation={navigation}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    header: {
        height: 86,
        backgroundColor: "#FFFFFF",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EFEFEF",
    },

    headerIcon: {
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "900",
        color: "#111111",
        textAlign: "center",
        marginHorizontal: 6,
    },

    locationIcon: {
        width: 42,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
    },

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    scrollContent: {
        paddingBottom: 120,
    },

    formatRow: {
        height: 76,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EEEEEE",
    },

    formatTitle: {
        fontSize: 23,
        color: "#222222",
        fontWeight: "500",
    },

    allRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    allText: {
        fontSize: 22,
        color: "#C9C3BD",
        fontWeight: "700",
        marginRight: 2,
    },

    dateSection: {
        backgroundColor: "#F4F0EA",
        paddingTop: 16,
        paddingBottom: 14,
    },

    dateList: {
        paddingHorizontal: 12,
    },

    dateItem: {
        width: 70,
        alignItems: "center",
        marginRight: 4,
    },

    dayText: {
        fontSize: 18,
        color: "#8F8A84",
        fontWeight: "600",
        marginBottom: 8,
    },

    activeDayText: {
        color: "#111111",
        fontWeight: "900",
    },

    dateCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },

    activeDateCircle: {
        backgroundColor: "#D8A300",
    },

    dateNumber: {
        fontSize: 22,
        color: "#7D7770",
        fontWeight: "700",
    },

    activeDateNumber: {
        color: "#FFFFFF",
        fontWeight: "900",
    },

    fullDateText: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 17,
        color: "#7D7770",
        fontWeight: "600",
    },

    cinemaList: {
        backgroundColor: "#FFFFFF",
    },

    cinemaItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#E7E7E7",
        backgroundColor: "#FFFFFF",
    },

    theaterRow: {
        minHeight: 76,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
    },

    theaterName: {
        flex: 1,
        marginLeft: 12,
        fontSize: 23,
        color: "#222222",
        fontWeight: "700",
    },

    showtimeContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
    },

    showtimeGroup: {
        marginTop: 4,
    },

    formatLine: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 14,
    },

    orangeCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#E69A00",
        marginRight: 10,
    },

    showtimeFormat: {
        fontSize: 19,
        color: "#5E5650",
        fontWeight: "700",
    },

    timeList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    timeButton: {
        minWidth: 88,
        height: 44,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#D6D1CA",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        marginBottom: 10,
    },

    timeText: {
        fontSize: 19,
        color: "#333333",
        fontWeight: "700",
    },

    bottomBar: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 82,
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#E4E4E4",
    },

    bottomItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    bottomNumber: {
        fontSize: 22,
        color: "#333333",
        fontWeight: "900",
    },

    bottomLabel: {
        marginTop: 2,
        fontSize: 16,
        color: "#777777",
        fontWeight: "600",
    },
});

export default MovieBookingScreen;