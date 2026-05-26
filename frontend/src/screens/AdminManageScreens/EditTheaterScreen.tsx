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
import * as Location from 'expo-location';
import MapWrapper from '../../components/MapWrapper';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import theaterService from '../../services/theaterService';

type Props = NativeStackScreenProps<RootStackParamList, 'EditTheater'>;

const EditTheaterScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theater } = route.params;

  // Thông tin cơ bản
  const [theaterName, setTheaterName] = useState(theater?.name || '');
  const [address, setAddress] = useState(theater?.address || '');
  const [latitude, setLatitude] = useState<string>(theater?.latitude ? theater.latitude.toString() : '');
  const [longitude, setLongitude] = useState<string>(theater?.longitude ? theater.longitude.toString() : '');
  const [mapRegion, setMapRegion] = useState({
    latitude: theater?.latitude && theater.latitude !== 0 ? theater.latitude : 21.028511,
    longitude: theater?.longitude && theater.longitude !== 0 ? theater.longitude : 105.804817,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Hàm lấy vị trí hiện tại
  const handleGetCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        useAlertStore.getState().showAlert('Lỗi', 'Không có quyền truy cập vị trí', { type: 'error' });
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
      useAlertStore.getState().showAlert('Lỗi', 'Không thể lấy vị trí hiện tại', { type: 'error' });
    }
  };

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
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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

export default EditTheaterScreen;
