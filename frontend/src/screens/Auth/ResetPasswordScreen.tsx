import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import useAlertStore from '../../store/useAlertStore';
import authService from '../../services/authService';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    if (!otp || !newPassword || !confirmPassword) {
      useAlertStore.getState().showAlert('Lỗi', 'Vui lòng nhập đầy đủ thông tin', { type: 'warning' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      useAlertStore.getState().showAlert('Lỗi', 'Mật khẩu xác nhận không khớp', { type: 'warning' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        email,
        otp,
        newPassword,
        confirmPassword
      });
      
      if (response && response.isSuccess) {
        useAlertStore.getState().showAlert('Thành công', 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.', { type: 'success' });
        navigation.navigate('Login');
      } else {
        useAlertStore.getState().showAlert('Lỗi', response.message || 'Không thể đặt lại mật khẩu', { type: 'error' });
      }
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Có lỗi xảy ra, vui lòng thử lại sau', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const Content = (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#FFCC00" />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Ionicons name="lock-closed-outline" size={80} color="#FFCC00" />
        <Text style={styles.title}>ĐẶT LẠI MẬT KHẨU</Text>
        <Text style={styles.subtitle}>Nhập mã OTP đã gửi đến {email}</Text>
      </View>
      
      <View style={styles.card}>
        <CustomInput
          iconName="key"
          placeholder="Mã OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
        />
        
        <CustomInput
          iconName="lock-closed"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          isPassword
          onTogglePassword={() => setShowNewPassword(!showNewPassword)}
        />
        
        <CustomInput
          iconName="lock-closed"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          isPassword
          onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />
        
        <CustomButton
          title="XÁC NHẬN"
          iconName="checkmark-circle-outline"
          onPress={handleResetPassword}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{Content}</View>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {Content}
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: -20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFCC00',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8A7851',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  }
});

export default ResetPasswordScreen;
