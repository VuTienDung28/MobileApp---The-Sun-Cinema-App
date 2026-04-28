import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export default function EditProfileScreen({ navigation, route }: Props) {
    const [fullName, setFullName] = useState(route.params?.fullName || '');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState('');
    const [province, setProvince] = useState('');
    const [district, setDistrict] = useState('');

    const handleSave = () => {
        route.params?.onSave?.(fullName, route.params?.avatar || null);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={30} color="#8B641F" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Thông tin Tài khoản</Text>

                <Ionicons name="menu" size={32} color="#8B641F" />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <InputRow
                    icon="user-alt"
                    placeholder="Họ tên *"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <InputRow
                    icon="phone-alt"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <InputRow
                    icon="envelope"
                    placeholder="Email *"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />

                <InputRow
                    icon="calendar-alt"
                    placeholder="Ngày sinh (YYYY-MM-DD)"
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                />

                <View style={styles.rowTwo}>
                    <TouchableOpacity style={styles.selectBox}>
                        <FontAwesome5 name="users" size={18} color="#9A855E" />
                        <Text style={styles.selectText}>
                            {gender || 'Giới tính'}
                        </Text>
                        <Ionicons name="chevron-down" size={22} color="#8B641F" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.selectBox}>
                        <Ionicons name="location-sharp" size={21} color="#9A855E" />
                        <Text style={styles.selectText}>
                            {province || 'Khu vực'}
                        </Text>
                        <Ionicons name="chevron-down" size={22} color="#8B641F" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.selectFull}>
                    <FontAwesome5 name="map" size={20} color="#9A855E" />
                    <Text style={styles.selectText}>
                        {district || 'Quận/huyện'}
                    </Text>
                    <Ionicons name="chevron-down" size={22} color="#8B641F" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveText}>LƯU THAY ĐỔI</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

type InputRowProps = {
    icon: any;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: any;
};

function InputRow({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
}: InputRowProps) {
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
        marginBottom: 18,
    },
    selectBox: {
        flex: 1,
        height: 62,
        backgroundColor: '#F7F2EA',
        borderRadius: 15,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectFull: {
        height: 62,
        backgroundColor: '#F7F2EA',
        borderRadius: 15,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    selectText: {
        flex: 1,
        marginLeft: 18,
        fontSize: 18,
        color: '#BDBDBD',
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