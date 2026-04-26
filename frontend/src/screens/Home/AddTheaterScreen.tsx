import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTheater'>;

const AddTheaterScreen: React.FC<Props> = ({ navigation }) => {
  // Thông tin cơ bản
  const [theaterName, setTheaterName] = useState('');
  const [address, setAddress] = useState('');
  const [hotline, setHotline] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  
  // Thông tin chi tiết
  const [totalScreens, setTotalScreens] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('23:59');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleAddTheater = async () => {
    Keyboard.dismiss();
    
    // Validation
    if (!theaterName || !address || !hotline || !totalScreens || !totalSeats) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate hotline format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(hotline.replace(/\s/g, ''))) {
      Alert.alert('Lỗi', 'Số hotline không hợp lệ (phải là 10-11 số)');
      return;
    }

    // Validate email if provided
    if (email && !email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newTheater = {
        id: Date.now().toString(),
        name: theaterName,
        address: address,
        hotline: hotline,
        email: email || null,
        description: description,
        totalScreens: parseInt(totalScreens),
        totalSeats: parseInt(totalSeats),
        openingTime: openingTime,
        closingTime: closingTime,
        createdAt: new Date().toISOString(),
      };
      
      console.log('New Theater:', newTheater);
      
      Alert.alert(
        'Thành công',
        'Rạp đã được thêm thành công!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      setIsLoading(false);
    }, 1500);
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
        <Text style={styles.headerTitle}>Thêm Rạp Mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
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

          {/* Hotline */}
          <View style={styles.inputWrapper}>
            <Ionicons name="call-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Hotline * (VD: 02812345678)"
              placeholderTextColor="#BDBDBD"
              keyboardType="phone-pad"
              value={hotline}
              onChangeText={setHotline}
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email (không bắt buộc)"
              placeholderTextColor="#BDBDBD"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

          {/* Số lượng phòng chiếu */}
          <View style={styles.inputWrapper}>
            <Ionicons name="tv-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Số lượng phòng chiếu *"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={totalScreens}
              onChangeText={setTotalScreens}
            />
          </View>

          {/* Tổng số ghế */}
          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tổng số ghế *"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={totalSeats}
              onChangeText={setTotalSeats}
            />
          </View>

          {/* Giờ mở cửa - Đóng cửa */}
          <View style={styles.rowContainer}>
            <View style={[styles.inputWrapper, styles.halfInput]}>
              <Ionicons name="time-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Giờ mở cửa"
                placeholderTextColor="#BDBDBD"
                value={openingTime}
                onChangeText={setOpeningTime}
              />
            </View>
            <View style={[styles.inputWrapper, styles.halfInput]}>
              <Ionicons name="time-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Giờ đóng cửa"
                placeholderTextColor="#BDBDBD"
                value={closingTime}
                onChangeText={setClosingTime}
              />
            </View>
          </View>

          {/* Mô tả */}
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons name="document-text-outline" size={20} color="#FFCC00" style={[styles.inputIcon, styles.textAreaIcon]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả thêm về rạp"
              placeholderTextColor="#BDBDBD"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAddTheater}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Đang xử lý...</Text>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#1A1A2E" />
                <Text style={styles.submitButtonText}>Thêm Rạp</Text>
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
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

export default AddTheaterScreen;