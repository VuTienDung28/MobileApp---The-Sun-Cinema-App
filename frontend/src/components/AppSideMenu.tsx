import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../store/useAuthStore";

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
    const fullName = useAuthStore((state) => state.fullName);

    const go = (screen: string) => {
        onClose();
        navigation.navigate(screen);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalWrap}>
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.leftBlank}
                    onPress={onClose}
                />

                <View style={styles.sideMenu}>
                    <TouchableOpacity style={styles.menuClose} onPress={onClose}>
                        <Ionicons name="menu" size={38} color="#FFFFFF" />
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
                            onPress={() => go("Promotion")}
                        />

                        <MenuIcon
                            icon="ticket-outline"
                            text="Vé của tôi"
                            onPress={() => go("MyTickets")}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

function MenuIcon({ icon, text, onPress }: MenuIconProps) {
    return (
        <TouchableOpacity style={styles.menuIconBox} onPress={onPress}>
            <Ionicons name={icon} size={42} color="#FFFFFF" />
            <Text style={styles.menuIconText}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    modalWrap: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.88)",
        flexDirection: "row",
    },

    leftBlank: {
        width: 70,
        height: "100%",
    },

    sideMenu: {
        flex: 1,
        backgroundColor: "#111111",
        paddingTop: 55,
        paddingHorizontal: 22,
    },

    menuClose: {
        position: "absolute",
        top: 45,
        right: 24,
        zIndex: 10,
    },

    avatar: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: "#F4F08D",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginTop: 20,
        marginBottom: 18,
    },

    avatarText: {
        fontSize: 72,
    },

    userName: {
        fontSize: 30,
        fontWeight: "900",
        color: "#FFFFFF",
        textAlign: "center",
    },

    memberRole: {
        fontSize: 22,
        color: "#FFF9C7",
        textAlign: "center",
        marginTop: 8,
        marginBottom: 28,
    },

    bigLink: {
        height: 78,
        justifyContent: "center",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#4C4C4C",
    },

    bigLinkText: {
        fontSize: 31,
        color: "#FFFFFF",
        fontWeight: "500",
    },

    grid: {
        borderTopWidth: 1,
        borderTopColor: "#4C4C4C",
        paddingTop: 28,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    menuIconBox: {
        width: "33%",
        alignItems: "center",
        marginBottom: 38,
    },

    menuIconText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 10,
    },
});