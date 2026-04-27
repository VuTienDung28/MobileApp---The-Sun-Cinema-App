import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import useAuthStore from '../../store/useAuthStore';
import useAlertStore from '../../store/useAlertStore';
import authService from '../../services/authService';
import { RootStackParamList, UserRole } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useAuthStore(state => state.signIn);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      useAlertStore.getState().showAlert('Lỗi', 'Vui lòng nhập đầy đủ email và mật khẩu', { type: 'warning' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response && response.isSuccess) {
        const { token, refreshToken, roles } = response.data;
        const role: UserRole = roles.includes('Admin') ? 'Admin' : 'User';
        await signIn(token, refreshToken, role);
      } else {

        useAlertStore.getState().showAlert('Đăng nhập thất bại', response.message || 'Lỗi không xác định', { type: 'error' });
      }
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Sai tài khoản hoặc mật khẩu', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const Content = (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sunny" size={80} color="#FFCC00" />
        <Text style={styles.title}>THE SUN</Text>
        <Text style={styles.subtitle}>✨ Đặt vé xem phim ✨</Text>
      </View>
      <View style={styles.card}>
        <CustomInput
          iconName="mail"
          placeholder="Email hoặc số điện thoại"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <CustomInput
          iconName="lock-closed"
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          isPassword
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        <CustomButton
          title="ĐĂNG NHẬP"
          iconName="happy-outline"
          onPress={handleLogin}
          isLoading={isLoading}
        />
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Ionicons name="sunny" size={16} color="#FFCC00" style={styles.dividerIcon} />
          <Text style={styles.dividerText}>hoặc</Text>
          <View style={styles.dividerLine} />
        </View>
        <CustomButton
          title="Đăng ký tài khoản THE SUN"
          variant="outline"
          iconName="person-add"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 THE SUN CINEMA. All rights reserved.</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFCC00',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A7851',
    fontWeight: 'bold',
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
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 15,
  },
  forgotPasswordText: {
    color: '#8A7851',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E0E0E0',
    flex: 1,
    marginHorizontal: 10,
  },
  dividerIcon: {
    marginRight: 5,
  },
  dividerText: {
    color: '#BDBDBD',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#8A7851',
    fontSize: 12,
  }
});

export default LoginScreen;