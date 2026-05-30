import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import useAlertStore from '../../store/useAlertStore';
import authService from '../../services/authService';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    if (!email) {
      useAlertStore.getState().showAlert('Lỗi', 'Vui lòng nhập email của bạn', { type: 'warning' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      if (response && response.isSuccess) {
        useAlertStore.getState().showAlert('Thành công', response.message || 'Mã OTP đã được gửi đến email của bạn.', { type: 'success' });
        navigation.navigate('ResetPassword', { email });
      } else {
        useAlertStore.getState().showAlert('Lỗi', response.message || 'Không thể gửi yêu cầu', { type: 'error' });
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
        <Ionicons name="key-outline" size={80} color="#FFCC00" />
        <Text style={styles.title}>QUÊN MẬT KHẨU</Text>
        <Text style={styles.subtitle}>Nhập email để nhận mã xác nhận OTP</Text>
      </View>
      
      <View style={styles.card}>
        <CustomInput
          iconName="mail"
          placeholder="Email của bạn"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <CustomButton
          title="GỬI MÃ OTP"
          iconName="send-outline"
          onPress={handleForgotPassword}
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
    marginTop: -50,
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

export default ForgotPasswordScreen;
