import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";

export default function MovieCarousel() {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Image
                source={{ uri: "https://picsum.photos/220/320?1" }}
                style={styles.img}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
            />
            <Image
                source={{ uri: "https://picsum.photos/220/320?2" }}
                style={styles.img}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
            />
            <Image
                source={{ uri: "https://picsum.photos/220/320?3" }}
                style={styles.img}
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
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