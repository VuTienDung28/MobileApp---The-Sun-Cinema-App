import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

export default function PaymentPinScreen({ navigation }: any) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const handleSubmit = () => {
        if (!pin || !confirmPin) {
            alert('Vui lòng nhập đầy đủ mật mã');
            return;
        }

        if (pin !== confirmPin) {
            alert('Mật mã nhập lại không khớp');
            return;
        }

        alert('Cài đặt mật mã thanh toán thành công');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Cài đặt mật mã thanh toán</Text>

                <Ionicons name="menu" size={32} color="#8B641F" />
            </View>

            <View style={styles.content}>
                <View style={styles.inputBox}>
                    <Feather name="lock" size={25} color="#9A6B00" />

                    <TextInput
                        style={styles.input}
                        placeholder="Mật mã mới"
                        placeholderTextColor="#5C5147"
                        value={pin}
                        onChangeText={setPin}
                        secureTextEntry={!showPin}
                    />

                    <TouchableOpacity onPress={() => setShowPin(!showPin)}>
                        <Ionicons
                            name={showPin ? 'eye-outline' : 'eye-off-outline'}
                            size={28}
                            color="#B9AAA2"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputBox}>
                    <Feather name="lock" size={25} color="#9A6B00" />

                    <TextInput
                        style={styles.input}
                        placeholder="Nhập lại mật mã mới"
                        placeholderTextColor="#5C5147"
                        value={confirmPin}
                        onChangeText={setConfirmPin}
                        secureTextEntry={!showConfirmPin}
                    />

                    <TouchableOpacity onPress={() => setShowConfirmPin(!showConfirmPin)}>
                        <Ionicons
                            name={showConfirmPin ? 'eye-outline' : 'eye-off-outline'}
                            size={28}
                            color="#B9AAA2"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Đồng ý</Text>
                </TouchableOpacity>
            </View>
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
        fontSize: 22,
        fontWeight: '900',
        color: '#2F211A',
    },
    content: {
        paddingHorizontal: 22,
        paddingTop: 88,
    },
    inputBox: {
        height: 62,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E3E0DC',
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    input: {
        flex: 1,
        marginLeft: 22,
        fontSize: 20,
        color: '#2F211A',
    },
    button: {
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F7BE00',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#F7BE00',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: '500',
    },
});