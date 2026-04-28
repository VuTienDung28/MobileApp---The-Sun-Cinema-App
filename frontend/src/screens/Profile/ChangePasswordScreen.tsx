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

export default function ChangePasswordScreen({ navigation }: any) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleChangePassword = () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            alert('Mật khẩu mới nhập lại không khớp');
            return;
        }

        alert('Đổi mật khẩu thành công');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Đổi mật khẩu</Text>

                <Ionicons name="menu" size={32} color="#8B641F" />
            </View>

            <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>MẬT KHẨU ĐĂNG NHẬP</Text>
            </View>

            <View style={styles.content}>
                <PasswordInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Mật khẩu hiện tại"
                    visible={showCurrent}
                    onToggleVisible={() => setShowCurrent(!showCurrent)}
                />

                <PasswordInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Mật khẩu mới"
                    visible={showNew}
                    onToggleVisible={() => setShowNew(!showNew)}
                />

                <PasswordInput
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    visible={showConfirm}
                    onToggleVisible={() => setShowConfirm(!showConfirm)}
                />

                <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
                    <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

type PasswordInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    visible: boolean;
    onToggleVisible: () => void;
};

function PasswordInput({
    value,
    onChangeText,
    placeholder,
    visible,
    onToggleVisible,
}: PasswordInputProps) {
    return (
        <View style={styles.inputBox}>
            <Feather name="lock" size={26} color="#9A6B00" />

            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#4A3A2A"
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={!visible}
            />

            <TouchableOpacity onPress={onToggleVisible}>
                <Ionicons
                    name={visible ? 'eye-outline' : 'eye-off-outline'}
                    size={29}
                    color="#B9AAA2"
                />
            </TouchableOpacity>
        </View>
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
    sectionTitleBox: {
        height: 110,
        justifyContent: 'flex-end',
        paddingHorizontal: 22,
        paddingBottom: 28,
        backgroundColor: '#FFF4D6',
    },
    sectionTitle: {
        fontSize: 20,
        color: '#8B641F',
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    content: {
        paddingHorizontal: 22,
        paddingTop: 28,
    },
    inputBox: {
        height: 66,
        backgroundColor: '#FFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E3E0DC',
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 26,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    input: {
        flex: 1,
        marginLeft: 24,
        fontSize: 20,
        color: '#2F211A',
    },
    button: {
        height: 70,
        borderRadius: 14,
        backgroundColor: '#F7BE00',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        shadowColor: '#F7BE00',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#3A2418',
        fontSize: 22,
        fontWeight: '800',
    },
});