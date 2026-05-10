import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import DateTimePicker from '@react-native-community/datetimepicker';

import movieService, { MovieListItem } from '../../services/movieService';
import roomService, { RoomDetailDto } from '../../services/roomService';
import showtimeService from '../../services/showtimeService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddShowtime'>;

const AddShowtimeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cinemaId, cinemaName } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [rooms, setRooms] = useState<RoomDetailDto[]>([]);

  // Form State
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [basePrice, setBasePrice] = useState<string>('50000');
  
  // Date/Time State
  const [startTime, setStartTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Modals for Selection
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [moviesData, roomsData] = await Promise.all([
          movieService.getAllMovies(),
          roomService.getRoomsByCinema(cinemaId)
        ]);
        setMovies(moviesData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Error loading data:', error);
        useAlertStore.getState().showAlert('Lỗi', 'Không thể tải dữ liệu phim/phòng', { type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [cinemaId]);

  const handleCreateShowtime = async () => {
    if (!selectedMovieId || !selectedRoomId || !basePrice) {
      useAlertStore.getState().showAlert('Thiếu thông tin', 'Vui lòng điền đầy đủ các thông tin', { type: 'warning' });
      return;
    }

    const price = parseFloat(basePrice);
    if (isNaN(price) || price < 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Giá vé không hợp lệ', { type: 'error' });
      return;
    }

    if (startTime <= new Date()) {
      useAlertStore.getState().showAlert('Lỗi', 'Thời gian chiếu phải ở trong tương lai', { type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Ensure the time matches the local timezone when sending ISO string
      const localOffset = startTime.getTimezoneOffset() * 60000;
      const localTime = new Date(startTime.getTime() - localOffset);
      
      await showtimeService.createShowtime({
        movieId: selectedMovieId,
        roomId: selectedRoomId,
        startTime: localTime.toISOString().split('.')[0], // Send yyyy-MM-ddTHH:mm:ss without Z to backend if backend expects local time, but typically sending standard ISO is better.
        basePrice: price
      });

      useAlertStore.getState().showAlert('Thành công', 'Đã thêm suất chiếu mới!', {
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Lỗi hệ thống';
      useAlertStore.getState().showAlert('Lỗi thêm suất chiếu', msg, { type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedMovieTitle = () => {
    return movies.find(m => m.id === selectedMovieId)?.title || 'Chọn phim...';
  };

  const getSelectedRoomName = () => {
    return rooms.find(r => r.id === selectedRoomId)?.name || 'Chọn phòng...';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm suất chiếu</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.cinemaNameText}>Rạp: {cinemaName}</Text>

        <View style={styles.card}>
          {/* Movie Selection */}
          <Text style={styles.label}>Phim</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowMovieModal(true)}>
            <Ionicons name="film-outline" size={20} color="#8A7851" style={styles.selectIcon} />
            <Text style={[styles.selectText, !selectedMovieId && { color: '#BDBDBD' }]}>{getSelectedMovieTitle()}</Text>
            <Ionicons name="chevron-down" size={20} color="#BDBDBD" />
          </TouchableOpacity>

          {/* Room Selection */}
          <Text style={styles.label}>Phòng chiếu</Text>
          <TouchableOpacity style={styles.selectBox} onPress={() => setShowRoomModal(true)}>
            <Ionicons name="tv-outline" size={20} color="#8A7851" style={styles.selectIcon} />
            <Text style={[styles.selectText, !selectedRoomId && { color: '#BDBDBD' }]}>{getSelectedRoomName()}</Text>
            <Ionicons name="chevron-down" size={20} color="#BDBDBD" />
          </TouchableOpacity>

          {/* Date & Time Selection */}
          <Text style={styles.label}>Thời gian chiếu</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity style={[styles.selectBox, { flex: 1, marginBottom: 0 }]} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color="#8A7851" style={styles.selectIcon} />
              <Text style={styles.selectText}>{formatDate(startTime)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.selectBox, { flex: 1, marginBottom: 0 }]} onPress={() => setShowTimePicker(true)}>
              <Ionicons name="time-outline" size={20} color="#8A7851" style={styles.selectIcon} />
              <Text style={styles.selectText}>{formatTime(startTime)}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={startTime}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (date) {
                  const newDate = new Date(startTime);
                  newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                  setStartTime(newDate);
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (date) {
                  const newDate = new Date(startTime);
                  newDate.setHours(date.getHours(), date.getMinutes());
                  setStartTime(newDate);
                }
              }}
            />
          )}

          {/* Base Price */}
          <Text style={[styles.label, { marginTop: 16 }]}>Giá vé cơ bản (VNĐ)</Text>
          <View style={styles.selectBox}>
            <Ionicons name="cash-outline" size={20} color="#8A7851" style={styles.selectIcon} />
            <TextInput
              style={styles.input}
              value={basePrice}
              onChangeText={setBasePrice}
              keyboardType="numeric"
              placeholder="VD: 50000"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleCreateShowtime}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#1A1A2E" />
            ) : (
              <Text style={styles.submitBtnText}>Thêm Suất Chiếu</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Movie Selection Modal */}
      <Modal visible={showMovieModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Phim</Text>
              <TouchableOpacity onPress={() => setShowMovieModal(false)}>
                <Ionicons name="close" size={24} color="#1A1A2E" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {movies.map(movie => (
                <TouchableOpacity 
                  key={movie.id} 
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedMovieId(movie.id);
                    setShowMovieModal(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, selectedMovieId === movie.id && { color: '#FFCC00', fontWeight: 'bold' }]}>
                    {movie.title}
                  </Text>
                  {selectedMovieId === movie.id && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Room Selection Modal */}
      <Modal visible={showRoomModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Phòng Chiếu</Text>
              <TouchableOpacity onPress={() => setShowRoomModal(false)}>
                <Ionicons name="close" size={24} color="#1A1A2E" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {rooms.length === 0 ? (
                <Text style={{ textAlign: 'center', padding: 20, color: '#8A7851' }}>Rạp này chưa có phòng chiếu nào.</Text>
              ) : (
                rooms.map(room => (
                  <TouchableOpacity 
                    key={room.id} 
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedRoomId(room.id);
                      setShowRoomModal(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, selectedRoomId === room.id && { color: '#FFCC00', fontWeight: 'bold' }]}>
                      {room.name} ({room.totalSeats} ghế)
                    </Text>
                    {selectedRoomId === room.id && <Ionicons name="checkmark" size={20} color="#FFCC00" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
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
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFCC00', flex: 1, textAlign: 'center' },
  content: { padding: 20 },
  cinemaNameText: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 20 },
  
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#8A7851', marginBottom: 8 },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  selectIcon: { marginRight: 10 },
  selectText: { flex: 1, fontSize: 15, color: '#1A1A2E' },
  input: { flex: 1, fontSize: 15, color: '#1A1A2E', padding: 0 },
  dateTimeRow: { flexDirection: 'row', gap: 12 },

  submitBtn: {
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: { color: '#1A1A2E', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  modalOptionText: { fontSize: 15, color: '#4B5563' },
});

export default AddShowtimeScreen;
