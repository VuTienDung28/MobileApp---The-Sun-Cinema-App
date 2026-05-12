import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/useAuthStore";

export default function SettingsScreen({ navigation }: any) {
    const { fullName } = useAuthStore();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={34} color="#030303ff" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Cài đặt</Text>

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <Ionicons name="menu" size={36} color="#020202ff" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.sectionBar} />

                <View style={styles.row}>
                    <Text style={styles.rowTitle}>Tài khoản</Text>

                    <Text style={styles.accountName}>
                        {fullName || "Người dùng"}
                    </Text>
                </View>

                <View style={styles.sectionBar}>
                    <Text style={styles.sectionTitle}>NGÔN NGỮ:</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.rowTitle}>Tiếng Việt</Text>
                    <Ionicons name="checkmark" size={34} color="#d9be26ff" />
                </View>

                <View style={styles.sectionBar}>
                    <Text style={styles.sectionTitle}>KHÁC</Text>
                </View>

                <TouchableOpacity
                    style={styles.row}
                    onPress={() => navigation.navigate("FAQ")}
                >
                    <Text style={styles.rowTitle}>Hỏi Đáp</Text>

                    <Ionicons
                        name="chevron-forward"
                        size={28}
                        color="#B8B0A5"
                    />
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={showMenu} transparent animationType="slide">
                <View style={styles.modalWrap}>
                    <TouchableOpacity
                        style={styles.leftBlank}
                        onPress={() => setShowMenu(false)}
                    />

                    <View style={styles.sideMenu}>
                        <TouchableOpacity
                            style={styles.menuClose}
                            onPress={() => setShowMenu(false)}
                        >
                            <Ionicons name="menu" size={36} color="#e3962bff" />
                        </TouchableOpacity>

                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👨‍🍳</Text>
                        </View>

                        <Text style={styles.userName}>
                            {fullName || "Người dùng"}
                        </Text>

                        <Text style={styles.memberRole}>Thành viên</Text>

                        <TouchableOpacity
                            style={styles.bigLink}
                            onPress={() => {
                                setShowMenu(false);
                                navigation.navigate("MovieList");
                            }}
                        >
                            <Text style={styles.bigLinkText}>Đặt vé theo Phim</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bigLink}
                            onPress={() => {
                                setShowMenu(false);
                                navigation.navigate("Theater");
                            }}
                        >
                            <Text style={styles.bigLinkText}>Đặt vé theo Rạp</Text>
                        </TouchableOpacity>

                        <View style={styles.grid}>
                            <MenuIcon
                                icon="home-outline"
                                text="Trang chủ"
                                onPress={() => {
                                    setShowMenu(false);
                                    navigation.navigate("UserHome");
                                }}
                            />

                            <MenuIcon
                                icon="person-outline"
                                text="Thành viên"
                                onPress={() => {
                                    setShowMenu(false);
                                    navigation.navigate("Profile");
                                }}
                            />

                            <MenuIcon
                                icon="information-circle-outline"
                                text="Rạp"
                                onPress={() => {
                                    setShowMenu(false);
                                    navigation.navigate("Theater");
                                }}
                            />

                            <MenuIcon
                                icon="gift-outline"
                                text="Tin mới & Ưu đãi"
                                onPress={() => {
                                    setShowMenu(false);
                                    navigation.navigate("Promotion");
                                }}
                            />

                            <MenuIcon
                                icon="ticket-outline"
                                text="Vé của tôi"
                                onPress={() => {
                                    setShowMenu(false);
                                    navigation.navigate("Tickets");
                                }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
        backgroundColor: "#FFFDF8",
    },

    header: {
        height: 82,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#E2DED6",
    },

    headerTitle: {
        flex: 1,
        marginLeft: 22,
        fontSize: 30,
        fontWeight: "900",
        color: "#000",
    },

    sectionBar: {
        minHeight: 72,
        backgroundColor: "#D8D4C8",
        justifyContent: "center",
        paddingHorizontal: 24,
    },

    sectionTitle: {
        fontSize: 24,
        color: "#8A7D6F",
        fontWeight: "500",
    },

    row: {
        minHeight: 76,
        backgroundColor: "#FFF",
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#D8D4C8",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    rowTitle: {
        fontSize: 26,
        color: "#5A4638",
        fontWeight: "400",
    },

    accountName: {
        flex: 1,
        textAlign: "right",
        fontSize: 24,
        color: "#8A7D6F",
        fontWeight: "500",
        marginLeft: 20,
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

    bigLink: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 14,
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
});