import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import userService from '../../services/userService';
import useAlertStore from '../../store/useAlertStore';

export default function ChangePasswordScreen({ navigation }: any) {
    const showAlert = useAlertStore((state) => state.showAlert);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─── Validation & API call ────────────────────────────────────────────────
    const handleChangePassword = async () => {
        Keyboard.dismiss();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showAlert('Lỗi', 'Vui lòng nhập đầy đủ thông tin.', { type: 'error' });
            return;
        }

        if (newPassword.length < 6) {
            showAlert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.', { type: 'error' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showAlert('Lỗi', 'Mật khẩu mới nhập lại không khớp.', { type: 'error' });
            return;
        }

        if (newPassword === currentPassword) {
            showAlert('Lỗi', 'Mật khẩu mới phải khác mật khẩu hiện tại.', { type: 'error' });
            return;
        }

        setIsSubmitting(true);
        try {
            await userService.changePassword({
                currentPassword,
                newPassword,
                confirmNewPassword,
            });

            showAlert('Thành công', 'Đổi mật khẩu thành công!', {
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
            });
        } catch (err: any) {
            const msg =
                err?.message ??
                err?.response?.data?.message ??
                'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
            showAlert('Lỗi', msg, { type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { Keyboard.dismiss(); navigation.goBack(); }}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Đổi mật khẩu</Text>

                <View style={{ width: 32 }} />
            </View>

            {/* Section label */}
            <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>MẬT KHẨU ĐĂNG NHẬP</Text>
            </View>

            {/*
              KeyboardAvoidingView đẩy nội dung lên khi bàn phím xuất hiện (chỉ dùng cho Native).
            */}
            {Platform.OS !== 'web' ? (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <ScrollView
                            contentContainerStyle={styles.content}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            <MainContent 
                                currentPassword={currentPassword} setCurrentPassword={setCurrentPassword}
                                newPassword={newPassword} setNewPassword={setNewPassword}
                                confirmNewPassword={confirmNewPassword} setConfirmNewPassword={setConfirmNewPassword}
                                showCurrent={showCurrent} setShowCurrent={setShowCurrent}
                                showNew={showNew} setShowNew={setShowNew}
                                showConfirm={showConfirm} setShowConfirm={setShowConfirm}
                                isSubmitting={isSubmitting}
                                handleChangePassword={handleChangePassword}
                            />
                        </ScrollView>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <MainContent 
                        currentPassword={currentPassword} setCurrentPassword={setCurrentPassword}
                        newPassword={newPassword} setNewPassword={setNewPassword}
                        confirmNewPassword={confirmNewPassword} setConfirmNewPassword={setConfirmNewPassword}
                        showCurrent={showCurrent} setShowCurrent={setShowCurrent}
                        showNew={showNew} setShowNew={setShowNew}
                        showConfirm={showConfirm} setShowConfirm={setShowConfirm}
                        isSubmitting={isSubmitting}
                        handleChangePassword={handleChangePassword}
                    />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

// ─── Sub-component MainContent ────────────────────────────────────────────────
type MainContentProps = {
    currentPassword: string; setCurrentPassword: (t: string) => void;
    newPassword: string; setNewPassword: (t: string) => void;
    confirmNewPassword: string; setConfirmNewPassword: (t: string) => void;
    showCurrent: boolean; setShowCurrent: (b: boolean) => void;
    showNew: boolean; setShowNew: (b: boolean) => void;
    showConfirm: boolean; setShowConfirm: (b: boolean) => void;
    isSubmitting: boolean;
    handleChangePassword: () => void;
};

function MainContent({
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    showCurrent, setShowCurrent,
    showNew, setShowNew,
    showConfirm, setShowConfirm,
    isSubmitting,
    handleChangePassword
}: MainContentProps) {
    return (
        <>
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
                placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
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

            <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.7 }]}
                onPress={handleChangePassword}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <ActivityIndicator color="#3A2418" size="large" />
                ) : (
                    <Text style={styles.buttonText}>Đổi mật khẩu</Text>
                )}
            </TouchableOpacity>
        </>
    );
}

// ─── Sub-component PasswordInput ──────────────────────────────────────────────
type PasswordInputProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    visible: boolean;
    onToggleVisible: () => void;
};

function PasswordInput({ value, onChangeText, placeholder, visible, onToggleVisible }: PasswordInputProps) {
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
                autoCapitalize="none"
                returnKeyType="next"
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

// ─── Styles ───────────────────────────────────────────────────────────────────
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
        // Padding cuối đủ lớn để nội dung không bị bàn phím che
        paddingBottom: 80,
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