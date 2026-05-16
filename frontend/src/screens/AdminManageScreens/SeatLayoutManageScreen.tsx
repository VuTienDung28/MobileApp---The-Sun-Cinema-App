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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import seatService, { RoomSeatLayoutDto, SeatDto, SeatRowConfigDto } from '../../services/seatService';

interface RowConfigForm {
  rowName: string;
  type: string;
  hiddenColsStr: string;
}

const SeatLayoutManageScreen: React.FC<Props> = ({ navigation, route }) => {
  const { cinemaId, roomId, roomName } = route.params;

  const [layout, setLayout] = useState<RoomSeatLayoutDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Form states for Generate
  const [totalColumns, setTotalColumns] = useState('11');
  const [aisleAtColumns, setAisleAtColumns] = useState('4,8');
  const [isNumberingFromRight, setIsNumberingFromRight] = useState(false);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  
  // default 3 rows config
  const [rowConfigs, setRowConfigs] = useState<RowConfigForm[]>([
    { rowName: 'A', type: 'Standard', hiddenColsStr: '' },
    { rowName: 'B', type: 'Standard', hiddenColsStr: '1,11' },
    { rowName: 'C', type: 'VIP', hiddenColsStr: '' },
  ]);

  const fetchLayout = async () => {
    try {
      setIsLoading(true);
      const data = await seatService.getSeatLayout(cinemaId, roomId);
      setLayout(data);
    } catch (error: any) {
      // It might return 404 if no seats generated yet
      if (error.response?.status === 404) {
        setLayout(null);
      } else {
        console.error('Error fetching seat layout:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, [cinemaId, roomId]);

  const handleClearSeats = () => {
    useAlertStore.getState().showAlert(
      'Xóa Sơ Đồ Ghế',
      'Bạn có chắc muốn xóa toàn bộ sơ đồ ghế của phòng này?',
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Xóa ngay', 
            onPress: async () => {
              try {
                await seatService.clearSeats(cinemaId, roomId);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa sơ đồ ghế!', { type: 'success' });
                fetchLayout();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa ghế', { type: 'error' });
              }
            }
          }
        ]
      }
    );
  };

  const handleGenerateSeats = async () => {
    const columns = parseInt(totalColumns);
    if (isNaN(columns) || columns <= 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Số cột phải là số dương hợp lệ', { type: 'error' });
      return;
    }

    const aisles = aisleAtColumns.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    try {
      await seatService.generateSeats(cinemaId, roomId, {
        totalColumns: columns,
        aisleAtColumns: aisles,
        isNumberingFromRight: isNumberingFromRight,
        rows: rowConfigs.map(r => ({
          rowName: r.rowName,
          type: r.type,
          hiddenColumns: r.hiddenColsStr ? r.hiddenColsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) : []
        }))
      });
      useAlertStore.getState().showAlert('Thành công', 'Tạo sơ đồ ghế thành công!', { type: 'success' });
      setIsModalVisible(false);
      fetchLayout();
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi tạo ghế', { type: 'error' });
    }
  };

  const updateRowConfig = (index: number, key: keyof RowConfigForm, value: string) => {
    const newConfigs = [...rowConfigs];
    newConfigs[index] = { ...newConfigs[index], [key]: value };
    setRowConfigs(newConfigs);
  };

  const addRowConfig = () => {
    const nextChar = String.fromCharCode(65 + rowConfigs.length); // A, B, C...
    setRowConfigs([...rowConfigs, { rowName: nextChar, type: 'VIP', hiddenColsStr: '' }]);
  };

  const removeRowConfig = (index: number) => {
    setRowConfigs(rowConfigs.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{roomName} - Sơ đồ ghế</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {!layout || layout.seats.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có sơ đồ ghế</Text>
            <TouchableOpacity style={styles.generateBtn} onPress={() => setIsModalVisible(true)}>
              <Ionicons name="add" size={20} color="#1A1A2E" />
              <Text style={styles.generateBtnText}>Khởi tạo sơ đồ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.layoutContainer}>
            <View style={styles.screenIndicator}>
              <Text style={styles.screenText}>MÀN HÌNH</Text>
            </View>

            {/* Render Seat Grid */}
            <View style={styles.seatGrid}>
              {Array.from(new Set(layout.seats.map(s => s.rowName))).map((rowName) => (
                <View key={rowName} style={styles.seatRow}>
                  <Text style={styles.rowLabel}>{rowName}</Text>
                  <View style={styles.rowSeats}>
                    {(() => {
                      const renderedRow = [];
                      let skipNext = false;
                      for (let colIdx = 0; colIdx < layout.totalColumns; colIdx++) {
                        if (skipNext) {
                          skipNext = false;
                          continue;
                        }
                        const seat = layout.seats.find(s => s.rowName === rowName && s.columnIndex === colIdx + 1);
                        if (!seat) {
                          // This is an aisle or empty space
                          renderedRow.push(<View key={colIdx} style={styles.emptySeat} />);
                        } else {
                          if (seat.type === 'Couple') skipNext = true; // Ghế đôi chiếm 2 ô nên bỏ qua ô tiếp theo
                          renderedRow.push(
                            <View key={colIdx} style={[
                              styles.seat, 
                              seat.type === 'VIP' ? styles.seatVIP : styles.seatStandard,
                              seat.type === 'Couple' ? styles.seatCouple : null
                            ]}>
                              <Text style={styles.seatNumber}>{seat.seatNumber}</Text>
                            </View>
                          );
                        }
                      }
                      return renderedRow;
                    })()}
                  </View>
                  <Text style={styles.rowLabel}>{rowName}</Text>
                </View>
              ))}
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.seatStandard]} />
                <Text style={styles.legendText}>Standard</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.seatVIP]} />
                <Text style={styles.legendText}>VIP</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendBox, styles.seatCouple, { width: 30 }]} />
                <Text style={styles.legendText}>Couple</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.clearBtn} onPress={handleClearSeats}>
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.clearBtnText}>Xóa toàn bộ ghế</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Generate Form Modal */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cấu hình tạo ghế</Text>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Tổng số cột (bao gồm lối đi)</Text>
              <TextInput style={styles.input} value={totalColumns} onChangeText={setTotalColumns} keyboardType="numeric" />

              <Text style={styles.inputLabel}>Vị trí cột lối đi (cách nhau bởi dấu phẩy, vd: 4,8)</Text>
              <TextInput style={styles.input} value={aisleAtColumns} onChangeText={setAisleAtColumns} keyboardType="numbers-and-punctuation" />

              <View style={styles.directionToggleContainer}>
                <Text style={styles.inputLabel}>Chiều đánh số ghế</Text>
                <View style={styles.toggleGroup}>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, !isNumberingFromRight && styles.toggleBtnActive]}
                    onPress={() => setIsNumberingFromRight(false)}
                  >
                    <Text style={[styles.toggleBtnText, !isNumberingFromRight && styles.toggleBtnTextActive]}>Trái sang Phải</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleBtn, isNumberingFromRight && styles.toggleBtnActive]}
                    onPress={() => setIsNumberingFromRight(true)}
                  >
                    <Text style={[styles.toggleBtnText, isNumberingFromRight && styles.toggleBtnTextActive]}>Phải sang Trái</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowHeader}>
                <Text style={styles.inputLabel}>Cấu hình Hàng (từ trên xuống)</Text>
                <TouchableOpacity onPress={addRowConfig}>
                  <Text style={styles.addText}>+ Thêm hàng</Text>
                </TouchableOpacity>
              </View>

              {rowConfigs.map((cfg, idx) => (
                <View key={idx} style={{ marginBottom: 12 }}>
                  <View style={styles.rowConfigItem}>
                    <TextInput 
                      style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                      value={cfg.rowName} 
                      onChangeText={t => updateRowConfig(idx, 'rowName', t)} 
                      placeholder="Tên (A)" 
                    />
                    
                    <TouchableOpacity 
                      style={[styles.input, { flex: 2, marginBottom: 0, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }]} 
                      onPress={() => setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)}
                    >
                      <Text style={{ flex: 1, color: cfg.type ? '#1A1A2E' : '#BDBDBD' }}>
                        {cfg.type || 'Chọn loại'}
                      </Text>
                      <Ionicons name={openDropdownIndex === idx ? "chevron-up" : "chevron-down"} size={16} color="#8A7851" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={() => removeRowConfig(idx)}>
                      <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput 
                    style={[styles.input, { marginTop: 8, marginBottom: openDropdownIndex === idx ? 0 : 16, height: 40, fontSize: 13 }]} 
                    value={cfg.hiddenColsStr} 
                    onChangeText={t => updateRowConfig(idx, 'hiddenColsStr', t)} 
                    placeholder="Các cột bị ẩn (vd: 1,11)" 
                    keyboardType="numbers-and-punctuation"
                  />

                  {openDropdownIndex === idx && (
                    <View style={styles.dropdownContainer}>
                      {['Standard', 'VIP', 'Couple'].map(type => (
                        <TouchableOpacity 
                          key={type} 
                          style={styles.dropdownOption}
                          onPress={() => {
                            updateRowConfig(idx, 'type', type);
                            setOpenDropdownIndex(null);
                          }}
                        >
                          <Text style={[styles.dropdownOptionText, cfg.type === type && styles.dropdownOptionTextActive]}>
                            {type}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleGenerateSeats}>
                <Text style={styles.confirmText}>Tạo Sơ Đồ</Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFCC00', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 16 },
  
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: '#8A7851', marginTop: 16, marginBottom: 24 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFCC00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  generateBtnText: { color: '#1A1A2E', fontWeight: '700', fontSize: 16 },

  layoutContainer: { alignItems: 'center', paddingBottom: 40 },
  screenIndicator: {
    width: '80%',
    height: 30,
    backgroundColor: '#4ECDC4',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: '#4ECDC4',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  screenText: { color: '#FFF', fontWeight: 'bold', letterSpacing: 2 },
  
  seatGrid: { alignItems: 'center' },
  seatRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rowLabel: { width: 20, textAlign: 'center', fontWeight: 'bold', color: '#8A7851' },
  rowSeats: { flexDirection: 'row', marginHorizontal: 10 },
  seat: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    borderRadius: 4,
  },
  seatStandard: { backgroundColor: '#BDBDBD' },
  seatVIP: { backgroundColor: '#FFCC00' },
  seatCouple: { width: 46, backgroundColor: '#9B59B6' }, // Màu tím cho ghế Couple
  emptySeat: { width: 20, height: 20, marginHorizontal: 3 },
  seatNumber: { fontSize: 8, fontWeight: 'bold', color: '#FFF' },

  legendContainer: { flexDirection: 'row', marginTop: 30, gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 16, height: 16, borderRadius: 4 },
  legendText: { fontSize: 12, color: '#8A7851', fontWeight: '600' },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 40,
  },
  clearBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },

  // Modal Form
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 13, color: '#8A7851', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#FFE5B4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    color: '#1A1A2E',
  },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 10 },
  addText: { color: '#4ECDC4', fontWeight: '700' },
  rowConfigItem: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: { flex: 1, padding: 14, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#4B5563' },
  confirmBtn: { flex: 1, padding: 14, backgroundColor: '#FFCC00', borderRadius: 12, alignItems: 'center' },
  confirmText: { fontWeight: '700', color: '#1A1A2E' },

  directionToggleContainer: { marginBottom: 16 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 4 },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  toggleBtnText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  toggleBtnTextActive: { color: '#FFCC00', fontWeight: '700' },

  dropdownContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#FFE5B4',
    borderRadius: 8,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    marginLeft: '35%',
    marginRight: 34,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    color: '#4B5563',
    fontSize: 14,
  },
  dropdownOptionTextActive: {
    color: '#FFCC00',
    fontWeight: '700',
  },
});

export default SeatLayoutManageScreen;
