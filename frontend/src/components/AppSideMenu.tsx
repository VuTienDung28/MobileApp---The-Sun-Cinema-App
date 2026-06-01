import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

import useAuthStore from "../store/useAuthStore";
import { getImageUrl } from "../utils/imageUtils";

type AppSideMenuProps = {
    visible: boolean;
    onClose: () => void;
    navigation: any;
};

type MenuIconProps = {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
    onPress: () => void;
};

export default function AppSideMenu({
    visible,
    onClose,
    navigation,
}: AppSideMenuProps) {
    const fullName = useAuthStore(
        (state) => state.fullName
    );

    const avatarUrl = useAuthStore(
        (state) => state.avatarUrl
    );

    const role = useAuthStore(
        (state) => state.role
    );

    const go = (screen: string) => {
        onClose();
        navigation.navigate(screen);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.modalWrap}>
                <TouchableOpacity
                    style={styles.leftBlank}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <View style={styles.sideMenu}>
                    <ScrollView
                        showsVerticalScrollIndicator={
                            false
                        }
                    >
                        {/* Nút đóng */}

                        <TouchableOpacity
                            style={
                                styles.closeBtn
                            }
                            onPress={onClose}
                        >
                            <Ionicons
                                name="close"
                                size={28}
                                color="#5A351B"
                            />
                        </TouchableOpacity>

                        {/* Mặt trời */}

                        <Text style={styles.sun}>
                            ☀️
                        </Text>

                        {/* Avatar */}

                        <View
                            style={
                                styles.avatarWrapper
                            }
                        >
                            {avatarUrl ? (
                                <Image
                                    source={{
                                        uri: getImageUrl(
                                            avatarUrl
                                        ),
                                    }}
                                    style={
                                        styles.avatarImage
                                    }
                                    contentFit="cover"
                                />
                            ) : (
                                <Ionicons
                                    name="person"
                                    size={80}
                                    color="#D29A1D"
                                />
                            )}
                        </View>

                        <Text
                            style={
                                styles.userName
                            }
                        >
                            {fullName ||
                                "Người dùng"}
                        </Text>

                        <View
                            style={
                                styles.memberBadge
                            }
                        >
                            <Ionicons
                                name="star"
                                size={16}
                                color="#B57B00"
                            />

                            <Text
                                style={
                                    styles.memberText
                                }
                            >
                                {role ===
                                    "Admin"
                                    ? "Quản trị viên"
                                    : "Thẻ thành viên"}
                            </Text>
                        </View>

                        {/* Card phim */}

                        <TouchableOpacity
                            style={
                                styles.movieCard
                            }
                            onPress={() =>
                                go(
                                    "MovieList"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.cardEmoji
                                }
                            >
                                🎬
                            </Text>

                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Đặt vé theo
                                    Phim
                                </Text>

                                <Text
                                    style={
                                        styles.cardSub
                                    }
                                >
                                    Chọn phim yêu
                                    thích
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color="#5A351B"
                            />
                        </TouchableOpacity>

                        {/* Card rạp */}

                        <TouchableOpacity
                            style={
                                styles.theaterCard
                            }
                            onPress={() =>
                                go(
                                    "Theater"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.cardEmoji
                                }
                            >
                                🎞️
                            </Text>

                            <View
                                style={{
                                    flex: 1,
                                }}
                            >
                                <Text
                                    style={
                                        styles.cardTitle
                                    }
                                >
                                    Đặt vé theo
                                    Rạp
                                </Text>

                                <Text
                                    style={
                                        styles.cardSub
                                    }
                                >
                                    Chọn rạp gần
                                    bạn
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color="#5A351B"
                            />
                        </TouchableOpacity>

                        {/* Grid */}

                        <View
                            style={
                                styles.grid
                            }
                        >
                            <MenuIcon
                                icon="home-outline"
                                text="Trang chủ"
                                onPress={() =>
                                    go(
                                        "UserHome"
                                    )
                                }
                            />

                            <MenuIcon
                                icon="person-outline"
                                text="Thành viên"
                                onPress={() =>
                                    go(
                                        "Profile"
                                    )
                                }
                            />

                            <MenuIcon
                                icon="location-outline"
                                text="Rạp"
                                onPress={() =>
                                    go(
                                        "Theater"
                                    )
                                }
                            />

                            <MenuIcon
                                icon="gift-outline"
                                text="Ưu đãi"
                                onPress={() =>
                                    go(
                                        "Promotion"
                                    )
                                }
                            />

                            <MenuIcon
                                icon="ticket-outline"
                                text="Vé của tôi"
                                onPress={() =>
                                    go(
                                        "MyTickets"
                                    )
                                }
                            />
                        </View>

                        {/* Banner */}

                        <View
                            style={
                                styles.banner
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.bannerSmall
                                    }
                                >
                                    Ưu đãi cực
                                    hot
                                </Text>

                                <Text
                                    style={
                                        styles.bannerBig
                                    }
                                >
                                    CHO BẠN
                                </Text>
                            </View>

                            <Text
                                style={{
                                    fontSize: 70,
                                }}
                            >
                                🍿
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

function MenuIcon({
    icon,
    text,
    onPress,
}: MenuIconProps) {
    return (
        <TouchableOpacity
            style={styles.menuIconBox}
            onPress={onPress}
        >
            <View
                style={
                    styles.iconCircle
                }
            >
                <Ionicons
                    name={icon}
                    size={30}
                    color="#D89A00"
                />
            </View>

            <Text
                style={
                    styles.menuIconText
                }
            >
                {text}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    modalWrap: {
        flex: 1,
        flexDirection: "row",
        backgroundColor:
            "rgba(0,0,0,0.3)",
    },

    leftBlank: {
        width: 40,
    },

    sideMenu: {
        flex: 1,
        backgroundColor: "#FFFDF7",
        paddingHorizontal: 20,
        paddingTop: 55,
    },

    closeBtn: {
        position: "absolute",
        top: 10,
        right: 10,

        width: 45,
        height: 45,

        borderRadius: 22,

        backgroundColor: "#fff",

        justifyContent: "center",
        alignItems: "center",

        zIndex: 99,
    },

    sun: {
        position: "absolute",
        top: 80,
        right: 50,
        fontSize: 50,
    },

    avatarWrapper: {
        width: 150,
        height: 150,

        borderRadius: 75,

        backgroundColor:
            "#FFD34D",

        justifyContent: "center",
        alignItems: "center",

        alignSelf: "center",

        marginTop: 40,

        borderWidth: 5,
        borderColor: "#fff",
    },

    avatarImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },

    userName: {
        textAlign: "center",
        marginTop: 18,

        fontSize: 28,
        fontWeight: "900",

        color: "#4A2B12",
    },

    memberBadge: {
        alignSelf: "center",

        marginTop: 10,

        flexDirection: "row",
        alignItems: "center",

        backgroundColor:
            "#FFE7A8",

        paddingHorizontal: 16,
        paddingVertical: 8,

        borderRadius: 30,
    },

    memberText: {
        marginLeft: 6,
        color: "#8A5B00",
        fontWeight: "700",
    },

    movieCard: {
        marginTop: 30,

        backgroundColor:
            "#FFF0B8",

        borderRadius: 22,

        flexDirection: "row",

        alignItems: "center",

        padding: 18,
    },

    theaterCard: {
        marginTop: 15,

        backgroundColor:
            "#FFF8E7",

        borderRadius: 22,

        flexDirection: "row",

        alignItems: "center",

        padding: 18,
    },

    cardEmoji: {
        fontSize: 42,
        marginRight: 15,
    },

    cardTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: "#4A2B12",
    },

    cardSub: {
        marginTop: 4,
        color: "#666",
    },

    grid: {
        marginTop: 25,

        backgroundColor: "#fff",

        borderRadius: 22,

        paddingVertical: 20,

        flexDirection: "row",
        flexWrap: "wrap",

        justifyContent:
            "space-around",
    },

    menuIconBox: {
        width: "33%",
        alignItems: "center",
        marginVertical: 12,
    },

    iconCircle: {
        width: 60,
        height: 60,

        borderRadius: 30,

        backgroundColor:
            "#FFF6DE",

        justifyContent: "center",
        alignItems: "center",
    },

    menuIconText: {
        marginTop: 8,

        textAlign: "center",

        color: "#4A2B12",

        fontSize: 14,

        fontWeight: "600",
    },

    banner: {
        marginTop: 25,
        marginBottom: 30,

        backgroundColor:
            "#FFE8A3",

        borderRadius: 22,

        padding: 20,

        flexDirection: "row",

        justifyContent:
            "space-between",

        alignItems: "center",
    },

    bannerSmall: {
        fontSize: 18,
        fontWeight: "700",
        color: "#7A4A00",
    },

    bannerBig: {
        fontSize: 32,
        fontWeight: "900",
        color: "#FF9800",
    },
});