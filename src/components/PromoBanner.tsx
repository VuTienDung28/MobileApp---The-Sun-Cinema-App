import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PromoBanner() {
    return (
        <View style={styles.box}>
            <Text style={styles.small}>Ưu đãi</Text>
            <Text style={styles.big}>VÉ XEM PHIM</Text>
            <Text style={styles.today}>HÔM NAY</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        margin: 20,
        backgroundColor: "#FFD76B",
        padding: 22,
        borderRadius: 22,
    },
    small: { fontSize: 28, color: "#4A2C13", fontWeight: "700" },
    big: { fontSize: 32, color: "#fff", fontWeight: "900" },
    today: { fontSize: 26, color: "#4A2C13", fontWeight: "900" },
});