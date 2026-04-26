import React from "react";
import { ScrollView, Image, StyleSheet } from "react-native";

export default function MovieCarousel() {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Image
                source={{ uri: "https://picsum.photos/220/320?1" }}
                style={styles.img}
            />
            <Image
                source={{ uri: "https://picsum.photos/220/320?2" }}
                style={styles.img}
            />
            <Image
                source={{ uri: "https://picsum.photos/220/320?3" }}
                style={styles.img}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    img: {
        width: 220,
        height: 320,
        borderRadius: 24,
        marginHorizontal: 10,
        marginTop: 20,
    },
});