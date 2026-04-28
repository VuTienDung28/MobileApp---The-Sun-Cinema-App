import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyPasswordScreen({ navigation }: any) {
    const [password, setPassword] = useState('');

    const handleConfirm = () => {
        if (password === '123456') {
            navigation.navigate('EditProfile');
        } else {
            alert('Sai mật khẩu');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#8B4A12" />
                </TouchableOpacity>

                <Text style={styles.title}>Thông tin Tài khoản</Text>

                <Ionicons name="menu" size={30} color="#8B4A12" />
            </View>

            <View style={styles.content}>
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <Text style={styles.desc}>
                    Vì lý do bảo mật, vui lòng nhập mật khẩu
                </Text>

                <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                    <Text style={styles.buttonText}>XÁC NHẬN</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F5ED' },
    header: {
        height: 70,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2F211A'
    },
    content: {
        padding: 20
    },
    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 15,
        paddingHorizontal: 20,
        fontSize: 20,
        marginTop: 20
    },
    desc: {
        fontSize: 16,
        marginTop: 20,
        color: '#333'
    },
    button: {
        marginTop: 30,
        height: 58,
        borderRadius: 16,
        backgroundColor: '#F5C400',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800'
    }
});