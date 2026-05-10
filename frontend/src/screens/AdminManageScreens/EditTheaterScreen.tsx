import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import theaterService from '../../services/theaterService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTheater'>;

const EditTheaterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theater } = route.params;

  // Thông tin cơ bản
  const [theaterName, setTheaterName] = useState(theater?.name || '');
  const [address, setAddress] = useState(theater?.address || '');
  
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý cập nhật rạp
  const handleUpdateTheater = async () => {
    Keyboard.dismiss();
    
    // Validation
    if (!theaterName || !address) {
      useAlertStore.getState().showAlert(
        'Thiếu thông tin', 
        'Vui lòng điền đầy đủ thông tin bắt buộc', 
        { type: 'warning' }
      );
      return;
    }

    setIsLoading(true);
    
    try {
      await theaterService.updateTheater(theater.id, {
        name: theaterName,
        address: address,
      });
      
      useAlertStore.getState().showAlert(
        'Thành công', 
        'Thông tin rạp đã được cập nhật!', 
        {
          type: 'success',
          buttons: [{ 
            text: 'OK', 
            onPress: () => navigation.navigate('AdminHome', { refreshTheaters: true } as never) 
          }]
        }
      );
      
    } catch (error: any) {
      console.error('Error updating theater:', error);
      useAlertStore.getState().showAlert(
        'Lỗi', 
        error.message || 'Không thể cập nhật rạp, vui lòng thử lại sau', 
        { type: 'error' }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const Content = (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Rạp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          
          <Text style={styles.sectionTitle}>Thông tin rạp</Text>
          
          {/* Tên rạp */}
          <View style={styles.inputWrapper}>
            <Ionicons name="business-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên rạp *"
              placeholderTextColor="#BDBDBD"
              value={theaterName}
              onChangeText={setTheaterName}
            />
          </View>

          {/* Địa chỉ */}
          <View style={styles.inputWrapper}>
            <Ionicons name="location-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Địa chỉ *"
              placeholderTextColor="#BDBDBD"
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleUpdateTheater}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Ionicons name="hourglass-outline" size={20} color="#1A1A2E" />
                <Text style={styles.submitButtonText}>Đang lưu...</Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#1A1A2E" />
                <Text style={styles.submitButtonText}>Lưu Thay Đổi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFCC00',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A7851',
    marginBottom: 12,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5B4',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditTheaterScreen;
