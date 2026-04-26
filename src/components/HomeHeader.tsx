import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function HomeHeader() {
    return (
        <View style={styles.header}>
            <Ionicons name="person-circle" size={42} color="#F8B400" />

            <Text style={styles.logo}>THE SUN</Text>

            <View style={styles.right}>
                <Ionicons name="ticket-outline" size={26} color="#4A2C13" />
                <Feather name="menu" size={28} color="#4A2C13" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 55,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    logo: {
        fontSize: 28,
        fontWeight: "900",
        color: "#F8B400",
    },
    right: {
        flexDirection: "row",
        gap: 14,
    },
});