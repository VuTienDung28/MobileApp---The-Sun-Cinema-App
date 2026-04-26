import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function FilterTabs() {
    return (
        <View style={styles.row}>
            <Text style={styles.active}>Đang chiếu</Text>
            <Text style={styles.item}>Đặc biệt</Text>
            <Text style={styles.item}>Sắp chiếu</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 10,
    },
    active: {
        backgroundColor: "#F8B400",
        padding: 10,
        borderRadius: 20,
        color: "#fff",
    },
    item: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 20,
    },
});