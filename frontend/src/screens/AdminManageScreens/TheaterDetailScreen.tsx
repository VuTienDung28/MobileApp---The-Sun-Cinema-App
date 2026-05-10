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
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import roomService, { RoomDetailDto } from '../../services/roomService';
import showtimeService, { ShowtimesByMovieDto } from '../../services/showtimeService';

type Props = NativeStackScreenProps<RootStackParamList, 'TheaterDetail'>;

// Generate next 7 days for the date picker
const getNext7Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      date: d,
      dateString: d.toISOString().split('T')[0], // yyyy-MM-dd
      dayName: i === 0 ? 'Hôm nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()],
      dayNum: d.getDate().toString()
    });
  }
  return dates;
};

const TheaterDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cinemaId, cinemaName } = route.params;

  const [activeTab, setActiveTab] = useState<'rooms' | 'showtimes'>('rooms');
  
  // --- Rooms State ---
  const [rooms, setRooms] = useState<RoomDetailDto[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState(false);

  // --- Showtimes State ---
  const [showtimesByMovie, setShowtimesByMovie] = useState<ShowtimesByMovieDto[]>([]);
  const [isLoadingShowtimes, setIsLoadingShowtimes] = useState(false);
  const dates = getNext7Days();
  const [selectedDate, setSelectedDate] = useState<string>(dates[0].dateString);

  // Focus effect to refetch if coming back from AddShowtime
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (activeTab === 'showtimes') {
        fetchShowtimes();
      }
    });
    return unsubscribe;
  }, [navigation, activeTab, selectedDate]);

  useEffect(() => {
    if (activeTab === 'rooms') {
      fetchRooms();
    } else {
      fetchShowtimes();
    }
  }, [activeTab, selectedDate, cinemaId]);

  // --- Rooms Logic ---
  const fetchRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const data = await roomService.getRoomsByCinema(cinemaId);
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      useAlertStore.getState().showAlert('Lỗi', 'Không thể tải danh sách phòng chiếu', { type: 'error' });
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleDeleteRoom = (id: number, name: string) => {
    useAlertStore.getState().showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phòng chiếu "${name}"?`,
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Xóa ngay', 
            onPress: async () => {
              try {
                await roomService.deleteRoom(cinemaId, id);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa phòng chiếu!', { type: 'success' });
                fetchRooms();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa phòng', { type: 'error' });
              }
            }
          }
        ]
      }
    );
  };

  const openAddRoomModal = () => {
    setEditRoomId(null);
    setRoomNameInput('');
    setIsRoomModalVisible(true);
  };

  const openEditRoomModal = (room: RoomDetailDto) => {
    setEditRoomId(room.id);
    setRoomNameInput(room.name);
    setIsRoomModalVisible(true);
  };

  const handleSaveRoom = async () => {
    if (!roomNameInput.trim()) {
      useAlertStore.getState().showAlert('Thiếu thông tin', 'Vui lòng nhập tên phòng', { type: 'warning' });
      return;
    }

    setIsSubmittingRoom(true);
    try {
      if (editRoomId) {
        await roomService.updateRoom(cinemaId, editRoomId, { name: roomNameInput.trim() });
        useAlertStore.getState().showAlert('Thành công', 'Đã cập nhật tên phòng', { type: 'success' });
      } else {
        await roomService.createRoom(cinemaId, { name: roomNameInput.trim() });
        useAlertStore.getState().showAlert('Thành công', 'Đã thêm phòng chiếu mới', { type: 'success' });
      }
      setIsRoomModalVisible(false);
      fetchRooms();
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi lưu thông tin phòng', { type: 'error' });
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // --- Showtimes Logic ---
  const fetchShowtimes = async () => {
    try {
      setIsLoadingShowtimes(true);
      const data = await showtimeService.getShowtimesByCinema(cinemaId, selectedDate);
      setShowtimesByMovie(data);
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      useAlertStore.getState().showAlert('Lỗi', 'Không thể tải lịch chiếu', { type: 'error' });
    } finally {
      setIsLoadingShowtimes(false);
    }
  };

  const handleDeleteShowtime = (id: number) => {
    useAlertStore.getState().showAlert(
      'Xóa Suất Chiếu',
      'Bạn có chắc muốn xóa suất chiếu này?',
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Xóa', 
            onPress: async () => {
              try {
                await showtimeService.deleteShowtime(id);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa suất chiếu', { type: 'success' });
                fetchShowtimes();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa suất chiếu', { type: 'error' });
              }
            }
          }
        ]
      }
    );
  };

  const renderRoomsTab = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Danh sách phòng chiếu</Text>
      <View style={styles.gridContainer}>
        {rooms.map((room) => (
          <TouchableOpacity 
            key={room.id}
            style={styles.roomCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SeatLayoutManage', { cinemaId, roomId: room.id, roomName: room.name })}
          >
            <View style={styles.roomHeader}>
              <Ionicons name="tv-outline" size={20} color="#FFCC00" />
              <View style={styles.roomActions}>
                <TouchableOpacity onPress={() => openEditRoomModal(room)} style={styles.actionBtn}>
                  <Ionicons name="pencil" size={16} color="#4ECDC4" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteRoom(room.id, room.name)} style={styles.actionBtn}>
                  <Ionicons name="trash" size={16} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
            <View style={styles.roomSeatsInfo}>
              <Ionicons name="people" size={14} color="#8A7851" />
              <Text style={styles.roomSeatsText}>{room.totalSeats} ghế</Text>
            </View>
          </TouchableOpacity>
        ))}
        {rooms.length === 0 && !isLoadingRooms && (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có phòng chiếu nào</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderShowtimesTab = () => (
    <View style={styles.showtimesContainer}>
      {/* Date Picker Horizontal */}
      <View style={styles.datePickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {dates.map((d) => {
            const isSelected = selectedDate === d.dateString;
            return (
              <TouchableOpacity 
                key={d.dateString} 
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(d.dateString)}
              >
                <Text style={[styles.dateDayName, isSelected && styles.dateTextActive]}>{d.dayName}</Text>
                <Text style={[styles.dateDayNum, isSelected && styles.dateTextActive]}>{d.dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {showtimesByMovie.length === 0 && !isLoadingShowtimes ? (
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>Không có suất chiếu nào trong ngày này</Text>
          </View>
        ) : (
          showtimesByMovie.map((movie) => (
            <View key={movie.movieId} style={styles.movieShowtimeCard}>
              <View style={styles.movieHeader}>
                <Image source={{ uri: movie.movieThumbnailUrl }} style={styles.movieThumb} />
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle}>{movie.movieTitle}</Text>
                  <View style={styles.movieMeta}>
                    <Text style={styles.movieDuration}>{movie.movieDuration} phút</Text>
                    <View style={styles.ageTag}>
                      <Text style={styles.ageTagText}>{movie.ageRestriction || 'P'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.slotsGrid}>
                {movie.showtimes.map((slot) => {
                  const startTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <View key={slot.id} style={styles.slotCard}>
                      <View style={styles.slotMain}>
                        <Text style={styles.slotTime}>{startTime}</Text>
                        <Text style={styles.slotRoom}>{slot.roomName}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.slotDeleteBtn}
                        onPress={() => handleDeleteShowtime(slot.id)}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{cinemaName}</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => activeTab === 'rooms' ? openAddRoomModal() : navigation.navigate('AddShowtime', { cinemaId, cinemaName })}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'rooms' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('rooms')}
        >
          <Text style={[styles.tabText, activeTab === 'rooms' && styles.tabTextActive]}>Phòng chiếu</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'showtimes' && styles.tabButtonActive]} 
          onPress={() => setActiveTab('showtimes')}
        >
          <Text style={[styles.tabText, activeTab === 'showtimes' && styles.tabTextActive]}>Suất chiếu</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'rooms' ? renderRoomsTab() : renderShowtimesTab()}

      {/* Room Add/Edit Modal */}
      <Modal visible={isRoomModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsRoomModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editRoomId ? 'Sửa Phòng Chiếu' : 'Thêm Phòng Chiếu'}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="tv-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Tên phòng (vd: Rạp 1, VIP 2)"
                placeholderTextColor="#BDBDBD"
                value={roomNameInput}
                onChangeText={setRoomNameInput}
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setIsRoomModalVisible(false)} disabled={isSubmittingRoom}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton, isSubmittingRoom && { opacity: 0.7 }]} onPress={handleSaveRoom} disabled={isSubmittingRoom}>
                <Text style={styles.modalSaveText}>{isSubmittingRoom ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
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
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFCC00', flex: 1, textAlign: 'center' },
  addButton: { padding: 8, marginRight: -8 },
  
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#FFCC00',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8A7851',
  },
  tabTextActive: {
    color: '#1A1A2E',
    fontWeight: '700',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#8A7851', marginBottom: 16 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  roomCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  roomActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 4, backgroundColor: '#F8F9FA', borderRadius: 8 },
  roomName: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 8 },
  roomSeatsInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roomSeatsText: { fontSize: 12, color: '#8A7851', fontWeight: '500' },
  emptyState: { width: '100%', paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: '#8A7851' },

  // Showtimes Styles
  showtimesContainer: { flex: 1 },
  datePickerContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  dateScroll: { paddingHorizontal: 16, gap: 12 },
  dateCard: {
    width: 60,
    height: 70,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateCardActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#FFCC00',
  },
  dateDayName: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  dateDayNum: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  dateTextActive: { color: '#1A1A2E' },

  movieShowtimeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  movieHeader: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  movieThumb: { width: 50, height: 75, borderRadius: 8, backgroundColor: '#E5E7EB' },
  movieInfo: { flex: 1, justifyContent: 'center' },
  movieTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A2E', marginBottom: 6 },
  movieMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  movieDuration: { fontSize: 13, color: '#8A7851' },
  ageTag: { backgroundColor: '#FF6B6B', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  ageTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotCard: {
    width: '31%',
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  slotMain: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, alignItems: 'center' },
  slotTime: { fontSize: 14, fontWeight: '700', color: '#1A1A2E', marginBottom: 2 },
  slotRoom: { fontSize: 10, color: '#6B7280' },
  slotDeleteBtn: {
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  // Modal Room Form
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 20, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#FFE5B4', borderRadius: 12, marginBottom: 24, paddingHorizontal: 12, backgroundColor: '#F9FAFB' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#1A1A2E' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalCancelButton: { backgroundColor: '#F3F4F6' },
  modalSaveButton: { backgroundColor: '#FFCC00' },
  modalCancelText: { color: '#4B5563', fontWeight: '700', fontSize: 15 },
  modalSaveText: { color: '#1A1A2E', fontWeight: '700', fontSize: 15 },
});

export default TheaterDetailScreen;
