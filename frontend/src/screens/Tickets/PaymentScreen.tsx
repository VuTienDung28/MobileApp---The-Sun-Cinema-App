import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import axiosClient from '../../api/axiosClient';

export default function PaymentScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<any>();

    const { bookingId, qrUrl, amount, ticketData } = route.params || {};
    const [loading, setLoading] = useState(false);
    const showAlert = useAlertStore(state => state.showAlert);
    const [isCompleted, setIsCompleted] = useState(false);
    const isPolling = React.useRef(true);

    // Polling API để kiểm tra trạng thái an toàn bằng đệ quy setTimeout
    useEffect(() => {
        if (!bookingId || isCompleted) return;

        let isMounted = true;
        isPolling.current = true;

        const pollStatus = async () => {
            if (!isMounted || !isPolling.current || isCompleted) return;

            try {
                const response = await axiosClient.get(`/Booking/${bookingId}/status`);
                
                if (response?.status === 'Completed') {
                    isPolling.current = false; // Dừng polling ngay lập tức
                    setIsCompleted(true);
                    await saveTicket();
                    return; // Không gọi setTimeout nữa
                } else if (response?.status === 'Expired' || response?.status === 'Cancelled') {
                    isPolling.current = false;
                    showAlert('Thất bại', 'Đơn hàng đã hết hạn hoặc bị hủy.', { type: 'error' });
                    navigation.goBack();
                    return;
                }
            } catch (error) {
                console.log("Polling error:", error);
            }

            // Lên lịch gọi lại sau 3s nếu vẫn đang mount và chưa hoàn thành
            if (isMounted && isPolling.current) {
                setTimeout(pollStatus, 30000);
            }
        };

        pollStatus();

        return () => {
            isMounted = false;
            isPolling.current = false;
        };
    }, [bookingId, isCompleted]);

    const handleBack = () => {
        showAlert(
            "Xác nhận thoát",
            "Bạn có chắc chắn muốn hủy thanh toán không? Giao dịch sẽ bị hủy bỏ.",
            {
                type: 'warning',
                buttons: [
                    {
                        text: "Không",
                        style: "cancel"
                    },
                    {
                        text: "Có",
                        onPress: () => navigation.goBack()
                    }
                ]
            }
        );
    };

    const handleMockPayment = async () => {
        try {
            setLoading(true);
            
            const gatewayUrl = process.env.EXPO_PUBLIC_MOCK_GATEWAY_URL || 'http://192.168.0.106:5258/api';
            // Giả lập KH quét xong và Gateway báo về BE
            const response = await fetch(`${gatewayUrl}/MockGateway/user-pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: bookingId,
                    amount: amount
                })
            });

            if (response.ok) {
                // Không cần làm gì ở đây, polling sẽ tự động catch 'Completed' 
                // và gọi saveTicket. Chỉ show alert hoặc chờ
                console.log("Mock Payment Sent");
            } else {
                showAlert('Lỗi', 'Không thể giả lập thanh toán lúc này.', { type: 'error' });
                setLoading(false);
            }
        } catch (error) {
            console.error('Simulate payment error:', error);
            showAlert('Lỗi', 'Không thể kết nối đến Mock Gateway.', { type: 'error' });
            setLoading(false);
        }
    };

    const saveTicket = async () => {
        try {
            const newTicket = {
                id: Date.now(),
                movieName: ticketData?.movieName,
                cinemaName: ticketData?.cinemaName,
                age: ticketData?.age,
                type: ticketData?.type,
                time: ticketData?.time,
                date: ticketData?.date,
                seats: ticketData?.selectedSeats || [],
                seatTotal: ticketData?.seatTotal,
                foodTotal: ticketData?.foodTotal,
                finalTotal: ticketData?.finalTotal,
                foods: ticketData?.foods || [],
                paymentMethod: "QR Code",
                status: "Đã thanh toán",
                createdAt: new Date().toISOString(),
            };

            const oldTicketsJson = await AsyncStorage.getItem("MY_TICKETS");
            const oldTickets = oldTicketsJson ? JSON.parse(oldTicketsJson) : [];

            const updatedTickets = [newTicket, ...oldTickets];

            await AsyncStorage.setItem(
                "MY_TICKETS",
                JSON.stringify(updatedTickets)
            );

            showAlert("Thành công", "Thanh toán thành công và vé đã được lưu.", {
                type: 'success',
                buttons: [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("UserHome"),
                    }
                ]
            });
        } catch (error) {
            console.log("Lỗi lưu vé:", error);
            showAlert("Lỗi", "Không thể lưu vé. Vui lòng thử lại.", { type: 'error' });
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backText}>← Quay lại</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thanh toán</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.label}>Số tiền cần trả:</Text>
                    <Text style={styles.amount}>
                        {amount ? amount.toLocaleString('vi-VN') : '0'} đ
                    </Text>

                    {qrUrl ? (
                        <Image 
                            source={{ uri: qrUrl }} 
                            style={styles.qrCode} 
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.qrPlaceholder}>
                            <ActivityIndicator size="large" color="#F39C12" />
                        </View>
                    )}

                    <Text style={styles.italicText}>Quét mã để thanh toán</Text>
                </View>

                {/* Demo Action Section */}
                <View style={styles.demoSection}>
                    <Text style={styles.demoLabel}>Dành cho Demo:</Text>
                    <TouchableOpacity 
                        style={styles.demoButton} 
                        onPress={handleMockPayment}
                        disabled={loading || isCompleted}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.demoButtonText}>
                                {isCompleted ? "Đã thanh toán" : "Giả lập KH đã quét QR"}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE'
    },
    backButton: {
        marginRight: 16,
    },
    backText: {
        fontSize: 16,
        color: '#E67E22',
        fontWeight: 'bold'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    content: {
        flex: 1,
        padding: 20,
        alignItems: 'center'
    },
    card: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        marginBottom: 32
    },
    label: {
        fontSize: 16,
        color: '#7F8C8D',
        marginTop: 16,
        marginBottom: 4
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2C3E50',
    },
    amount: {
        fontSize: 32,
        fontWeight: '900',
        color: '#F39C12',
        marginBottom: 24
    },
    qrCode: {
        width: 220,
        height: 220,
        marginBottom: 16
    },
    qrPlaceholder: {
        width: 220,
        height: 220,
        marginBottom: 16,
        backgroundColor: '#F2F2F2',
        justifyContent: 'center',
        alignItems: 'center'
    },
    italicText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#95A5A6'
    },
    demoSection: {
        width: '100%',
        alignItems: 'center'
    },
    demoLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        marginBottom: 12
    },
    demoButton: {
        backgroundColor: '#1ABC9C',
        width: '100%',
        height: 54,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    demoButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
