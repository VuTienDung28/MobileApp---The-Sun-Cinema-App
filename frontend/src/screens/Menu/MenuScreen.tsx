import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useAuthStore from "../../store/useAuthStore";
import { Image } from "expo-image";
import { getImageUrl } from "../../utils/imageUtils";

export default function MenuScreen() {
    const navigation = useNavigation<any>();
    const { fullName, role, avatarUrl } = useAuthStore();

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.topBar}>
                    <View style={styles.bellBox}>
                        <Ionicons name="notifications-outline" size={42} color="#5A351B" />
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>NEW</Text>
                        </View>
                    </View>

                    <TouchableOpacity>
                        <Ionicons name="settings-outline" size={48} color="#5A351B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileArea}>
                    <View style={styles.avatarCircle}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: getImageUrl(avatarUrl) }}
                                style={styles.avatarImage}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />
                        ) : (
                            <Text style={styles.avatarEmoji}>👨‍🍳</Text>
                        )}
                    </View>

                    <Text style={styles.name}>{fullName || 'Người dùng'}</Text>
                    <Text style={styles.role}>{role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}</Text>

                    <View style={styles.memberBadge}>
                        <Ionicons name="star" size={30} color="#fff" />
                        <Text style={styles.memberText}>MEMBER</Text>
                    </View>
                </View>

                <View style={styles.actionBox}>
                    <MenuAction
                        icon={
                            <MaterialCommunityIcons
                                name="movie-open-play-outline"
                                size={48}
                                color="#D29A1D"
                            />
                        }
                        title="Đặt vé theo Phim"
                        onPress={() => navigation.navigate("MovieList")}
                    />

                    <MenuAction
                        icon={
                            <MaterialCommunityIcons
                                name="office-building"
                                size={48}
                                color="#D29A1D"
                            />
                        }
                        title="Đặt vé theo Rạp"
                        onPress={() => navigation.navigate("Cinema")}
                    />
                </View>

                <View style={styles.bottomDecor}>
                    <Text style={styles.popcorn}>🍿</Text>
                    <Text style={styles.reel}>🎞️</Text>
                    <Text style={styles.ticket}>🎟️</Text>
                    <Text style={styles.clapper}>🎬</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function MenuAction({
    icon,
    title,
    onPress,
}: {
    icon: React.ReactNode;
    title: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.75} onPress={onPress}>
            <View style={styles.actionIcon}>{icon}</View>
            <Text style={styles.actionText}>{title}</Text>
            <Ionicons name="chevron-forward" size={38} color="#D29A1D" />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFDF8",
    },

    topBar: {
        paddingTop: 58,
        paddingHorizontal: 34,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    bellBox: {
        position: "relative",
    },

    newBadge: {
        position: "absolute",
        top: -10,
        right: -34,
        backgroundColor: "#D99A16",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 13,
    },

    newText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "900",
    },

    profileArea: {
        alignItems: "center",
        paddingTop: 18,
    },

    avatarCircle: {
        width: 190,
        height: 190,
        borderRadius: 95,
        backgroundColor: "#E7A91E",
        justifyContent: "center",
        alignItems: "center",
    },

    avatarEmoji: {
        fontSize: 108,
    },
    avatarImage: {
        width: 190,
        height: 190,
        borderRadius: 95,
    },

    name: {
        marginTop: 28,
        fontSize: 31,
        fontWeight: "900",
        color: "#2D160C",
    },

    role: {
        marginTop: 8,
        fontSize: 24,
        color: "#D99A16",
    },

    memberBadge: {
        position: "absolute",
        right: 42,
        top: 255,
        alignItems: "center",
    },

    memberText: {
        marginTop: 2,
        color: "#D99A16",
        fontSize: 18,
        fontWeight: "900",
    },

    actionBox: {
        marginHorizontal: 30,
        marginTop: 42,
        gap: 22,
    },

    actionItem: {
        minHeight: 118,
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 22,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#F2E7D7",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },

    actionIcon: {
        width: 72,
        alignItems: "center",
    },

    actionText: {
        flex: 1,
        marginLeft: 20,
        fontSize: 25,
        color: "#2D160C",
        fontWeight: "500",
    },

    bottomDecor: {
        height: 360,
        marginTop: 10,
        position: "relative",
        overflow: "hidden",
    },

    popcorn: {
        position: "absolute",
        left: -20,
        bottom: 20,
        fontSize: 160,
        opacity: 0.45,
    },

    reel: {
        position: "absolute",
        left: -22,
        bottom: -10,
        fontSize: 90,
        opacity: 0.45,
    },

    ticket: {
        position: "absolute",
        right: 135,
        bottom: 28,
        fontSize: 78,
        opacity: 0.55,
    },

    clapper: {
        position: "absolute",
        right: -18,
        bottom: 60,
        fontSize: 150,
        opacity: 0.35,
    },
});