import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TransactionHistoryScreen({ navigation }: any) {
    const items = [
        {
            title: 'Lịch sử vé',
            icon: (
                <MaterialCommunityIcons
                    name="ticket-confirmation-outline"
                    size={30}
                    color="#2F211A"
                />
            ),
        },
        {
            title: 'Lịch sử Quầy trực tuyến',
            icon: <Feather name="headphones" size={30} color="#2F211A" />,
        },
        {
            title: 'Theo dõi hạng thành viên',
            icon: <Feather name="users" size={30} color="#2F211A" />,
        },
        {
            title: 'Lịch sử hoàn vé',
            icon: <Feather name="refresh-cw" size={30} color="#2F211A" />,
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Lịch sử Giao dịch</Text>

                <Ionicons name="menu" size={32} color="#8B641F" />
            </View>

            {/* TOP BANNER */}
            <View style={styles.topBanner} />

            {/* LIST */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        activeOpacity={0.8}
                        style={styles.card}
                    >
                        <View style={styles.iconCircle}>{item.icon}</View>

                        <Text style={styles.cardText}>{item.title}</Text>

                        <Ionicons
                            name="chevron-forward"
                            size={36}
                            color="#D7A726"
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9EC',
    },

    header: {
        height: 72,
        backgroundColor: '#FFF',
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 3,
    },

    headerTitle: {
        flex: 1,
        marginLeft: 18,
        fontSize: 25,
        fontWeight: '900',
        color: '#2F211A',
    },

    topBanner: {
        height: 100,
        backgroundColor: '#FFF4D6',
    },

    scroll: {
        flex: 1,
    },

    content: {
        paddingHorizontal: 26,
        paddingTop: 28,
        paddingBottom: 50,
    },

    card: {
        height: 94,
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EFE5D6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 2,
    },

    iconCircle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: '#FFF0BD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 28,
    },

    cardText: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        color: '#2F211A',
    },
});