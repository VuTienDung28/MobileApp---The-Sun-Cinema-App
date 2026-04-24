import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import CustomDropdown from '../../components/CustomDropdown';
import authService from '../../services/authService';

const genderOptions = [
  { label: 'Nam', value: 'Male' },
  { label: 'Nữ', value: 'Female' },
];

const provinceOptions = [
  { label: 'Hà Nội', value: 'HN' },
  { label: 'TP. Hồ Chí Minh', value: 'HCM' },
  { label: 'Đà Nẵng', value: 'DN' },
];

const districtOptionsMap = {
  'HN': [
    { label: 'Quận Ba Đình', value: 'BaDinh' },
    { label: 'Quận Hoàn Kiếm', value: 'HoanKiem' },
    { label: 'Quận Cầu Giấy', value: 'CauGiay' },
  ],
  'HCM': [
    { label: 'Quận 1', value: 'Q1' },
    { label: 'Quận 3', value: 'Q3' },
    { label: 'Thành phố Thủ Đức', value: 'ThuDuc' },
  ],
  'DN': [
    { label: 'Quận Hải Châu', value: 'HaiChau' },
    { label: 'Quận Sơn Trà', value: 'SonTra' },
  ]
};

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '', 
    gender: '',
    province: '',
    district: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Date Picker State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      // Format to YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, dateOfBirth: formattedDate });
    }
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.fullName) {
      Alert.alert('Lỗi', 'Vui lòng nhập các thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      if (response && response.isSuccess) {
        Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Lỗi', response.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons name="sunny" size={80} color="#FFCC00" />
            <Text style={styles.title}>THE SUN</Text>
            <Text style={styles.subtitle}>Đặt vé xem phim</Text>
          </View>

          <View style={styles.formContainer}>
            <CustomInput
              iconName="person"
              placeholder="Họ tên *"
              value={formData.fullName}
              onChangeText={(text) => setFormData({...formData, fullName: text})}
            />
            
            <CustomInput
              iconName="call"
              placeholder="Số điện thoại"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
              keyboardType="phone-pad"
            />

            <CustomInput
              iconName="mail"
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({...formData, email: text})}
              keyboardType="email-address"
            />

            <CustomInput
              iconName="lock-closed"
              placeholder="Mật khẩu *"
              value={formData.password}
              onChangeText={(text) => setFormData({...formData, password: text})}
              secureTextEntry={!showPassword}
              isPassword
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <CustomInput
              iconName="lock-closed"
              placeholder="Xác nhận mật khẩu *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
              secureTextEntry={!showConfirmPassword}
              isPassword
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <TouchableOpacity style={styles.datePickerContainer} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={20} color="#8A7851" style={styles.dateIcon} />
              <Text style={[styles.dateText, !formData.dateOfBirth && styles.datePlaceholder]}>
                {formData.dateOfBirth ? formData.dateOfBirth : 'Ngày sinh (YYYY-MM-DD)'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <CustomDropdown
                  iconName="people"
                  placeholder="Giới tính"
                  value={formData.gender}
                  options={genderOptions}
                  onSelect={(val) => setFormData({...formData, gender: val})}
                />
              </View>
              <View style={styles.halfInput}>
                <CustomDropdown
                  iconName="location"
                  placeholder="Khu vực"
                  value={formData.province}
                  options={provinceOptions}
                  onSelect={(val) => setFormData({...formData, province: val, district: ''})}
                />
              </View>
            </View>

            <CustomDropdown
              iconName="map"
              placeholder="Quận/huyện"
              value={formData.district}
              options={formData.province ? districtOptionsMap[formData.province] : []}
              onSelect={(val) => setFormData({...formData, district: val})}
            />

            <CustomButton
              title="ĐĂNG KÝ"
              iconName="sunny"
              onPress={handleRegister}
              isLoading={isLoading}
            />

            <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>
                Đã có tài khoản? <Text style={styles.loginTextBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8A7851',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A7851',
  },
  formContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5ED',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    flex: 1,
    color: '#333',
    fontSize: 16,
  },
  datePlaceholder: {
    color: '#BDBDBD',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#8A7851',
    fontSize: 16,
  },
  loginTextBold: {
    fontWeight: 'bold',
  }
});

export default RegisterScreen;
