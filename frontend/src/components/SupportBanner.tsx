import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SupportBanner() {
    return (
        <View style={styles.box}>
            <Text style={styles.title}>Bạn cần hỗ trợ gì?</Text>
            <Text>The Sun luôn sẵn sàng hỗ trợ bạn!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: {
        backgroundColor: "#fff",
        margin: 20,
        padding: 20,
        borderRadius: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
    },
});