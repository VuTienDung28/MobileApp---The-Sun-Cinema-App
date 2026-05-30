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
import * as Location from 'expo-location';
import MapWrapper from '../../components/MapWrapper';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import theaterService from '../../services/theaterService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTheater'>;

const AddTheaterScreen: React.FC<Props> = ({ navigation }) => {
  // Thông tin cơ bản
  const [theaterName, setTheaterName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 21.028511, // Default Hanoi
    longitude: 105.804817,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Hàm lấy vị trí hiện tại
  const handleGetCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Không có quyền truy cập vị trí');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      setLatitude(lat.toString());
      setLongitude(lon.toString());
      setMapRegion({
        ...mapRegion,
        latitude: lat,
        longitude: lon,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    }
  };

  // Hàm xử lý thêm rạp
  const handleAddTheater = async () => {
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
      await theaterService.createTheater({
        name: theaterName,
        address: address,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
      });
      
      useAlertStore.getState().showAlert(
        'Thành công', 
        'Rạp đã được thêm thành công!', 
        {
          type: 'success',
          buttons: [{ 
            text: 'OK', 
            onPress: () => navigation.navigate('AdminHome', { refreshTheaters: true } as never) 
          }]
        }
      );
      
    } catch (error: any) {
      console.error('Error adding theater:', error);
      useAlertStore.getState().showAlert(
        'Lỗi', 
        error.message || 'Không thể thêm rạp, vui lòng thử lại sau', 
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

          {/* Bản đồ chọn vị trí */}
          <View style={styles.mapSection}>
            <View style={styles.mapHeader}>
              <Text style={styles.sectionTitle}>Vị trí trên bản đồ</Text>
              <TouchableOpacity style={styles.locationBtn} onPress={handleGetCurrentLocation}>
                <Ionicons name="locate" size={18} color="#FFF" />
                <Text style={styles.locationBtnText}>Vị trí của tôi</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapContainer}>
              <MapWrapper
                style={styles.map}
                region={mapRegion}
                latitude={latitude ? parseFloat(latitude) : undefined}
                longitude={longitude ? parseFloat(longitude) : undefined}
                onPress={(e: any) => {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setLatitude(latitude.toString());
                  setLongitude(longitude.toString());
                }}
              />
            </View>

            <View style={styles.rowContainer}>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Vĩ độ (Latitude)"
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputWrapper, styles.halfInput]}>
                <TextInput
                  style={styles.input}
                  placeholder="Kinh độ (Longitude)"
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAddTheater}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Ionicons name="hourglass-outline" size={20} color="#1A1A2E" />
                <Text style={styles.submitButtonText}>Đang xử lý...</Text>
              </>
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
  mapSection: {
    marginTop: 8,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8A7851',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  locationBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default AddTheaterScreen;