import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types';
import userService from '../../services/userService';
import useAuthStore from '../../store/useAuthStore';
import useAlertStore from '../../store/useAlertStore';
import CustomDropdown from '../../components/CustomDropdown';
import { GENDER_OPTIONS, PROVINCE_OPTIONS, DISTRICT_OPTIONS_MAP } from '../../constants/addressData';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

// ─── Format ngày sinh ──────────────────────────────────────────────────────
const toDateString = (iso?: string): string => {
    if (!iso) return '';
    return iso.split('T')[0]; // "1999-05-21"
};

export default function EditProfileScreen({ navigation, route }: Props) {
    const profile = route.params?.profile;
    const { setFullName } = useAuthStore();
    const showAlert = useAlertStore((state) => state.showAlert);

    const [fullName, setFullNameLocal] = useState(profile?.fullName ?? '');
    const [phone, setPhone] = useState(profile?.phoneNumber ?? '');
    const [email] = useState(profile?.email ?? '');
    const [dateOfBirth, setDateOfBirth] = useState(toDateString(profile?.dateOfBirth));
    const [gender, setGender] = useState(profile?.gender ?? '');
    const [province, setProvince] = useState(profile?.province ?? '');
    const [district, setDistrict] = useState(profile?.district ?? '');

    const [isSaving, setIsSaving] = useState(false);

    // ─── Lưu thông tin ────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!fullName.trim()) {
            showAlert('Lỗi', 'Họ tên không được để trống.', { type: 'error' });
            return;
        }

        setIsSaving(true);
        try {
            const updated = await userService.updateProfile({
                fullName: fullName.trim(),
                phoneNumber: phone || undefined,
                dateOfBirth: dateOfBirth || undefined,
                gender: gender || undefined,
                province: province || undefined,
                district: district || undefined,
            });

            // Cập nhật fullName trong global store
            setFullName(updated.fullName);

            showAlert('Thành công', 'Cập nhật thông tin thành công!', {
                type: 'success',
                buttons: [{ text: 'OK', onPress: () => navigation.goBack() }],
            });
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Không thể cập nhật thông tin.';
            showAlert('Lỗi', msg, { type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Thông tin Tài khoản</Text>

                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* Họ tên */}
                <InputRow
                    icon="user-alt"
                    placeholder="Họ tên *"
                    value={fullName}
                    onChangeText={setFullNameLocal}
                />

                {/* Số điện thoại */}
                <InputRow
                    icon="phone-alt"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                {/* Email (chỉ đọc) */}
                <View style={[styles.inputBox, { opacity: 0.65 }]}>
                    <FontAwesome5 name="envelope" size={19} color="#9A855E" />
                    <Text style={[styles.input, { color: '#888' }]}>{email || 'Email'}</Text>
                    <Ionicons name="lock-closed" size={16} color="#C0A870" />
                </View>

                {/* Ngày sinh */}
                <InputRow
                    icon="calendar-alt"
                    placeholder="Ngày sinh (YYYY-MM-DD)"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                />

                {/* Giới tính + Khu vực */}
                <View style={styles.rowTwo}>
                    {/* Giới tính */}
                    <View style={{ flex: 1 }}>
                        <CustomDropdown
                            iconName="people"
                            placeholder="Giới tính"
                            value={gender}
                            options={GENDER_OPTIONS}
                            onSelect={setGender}
                        />
                    </View>

                    {/* Tỉnh/thành */}
                    <View style={{ flex: 1 }}>
                        <CustomDropdown
                            iconName="location"
                            placeholder="Khu vực"
                            value={province}
                            options={PROVINCE_OPTIONS}
                            onSelect={(val) => {
                                setProvince(val);
                                setDistrict(''); // Reset district when province changes
                            }}
                        />
                    </View>
                </View>

                {/* Quận/huyện */}
                <CustomDropdown
                    iconName="map"
                    placeholder="Quận/huyện"
                    value={district}
                    options={province ? DISTRICT_OPTIONS_MAP[province] : []}
                    onSelect={setDistrict}
                />

                {/* Nút Lưu */}
                <TouchableOpacity
                    style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.saveText}>LƯU THAY ĐỔI</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Sub-component InputRow ───────────────────────────────────────────────────
type InputRowProps = {
    icon: any;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: any;
};

function InputRow({ icon, placeholder, value, onChangeText, keyboardType }: InputRowProps) {
    return (
        <View style={styles.inputBox}>
            <FontAwesome5 name={icon} size={19} color="#9A855E" />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#BDBDBD"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
            />
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9E8',
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
        fontSize: 24,
        fontWeight: '900',
        color: '#2F211A',
    },
    content: {
        paddingHorizontal: 22,
        paddingTop: 34,
        paddingBottom: 40,
    },
    inputBox: {
        height: 62,
        backgroundColor: '#F7F2EA',
        borderRadius: 15,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    input: {
        flex: 1,
        marginLeft: 18,
        fontSize: 18,
        color: '#2F211A',
    },
    rowTwo: {
        flexDirection: 'row',
        gap: 18,
        marginBottom: 4, // Dropdown component already has marginBottom: 15
    },
    saveButton: {
        height: 60,
        borderRadius: 16,
        backgroundColor: '#F5C400',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    saveText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '900',
    },
});