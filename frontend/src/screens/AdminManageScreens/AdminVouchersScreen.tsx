// screens/admin/AdminVouchersScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAlertStore from '../../store/useAlertStore';
import voucherService, { VoucherDto, CreateVoucherDto } from '../../services/voucherService';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminVouchers'>;
type DateTimeTarget = 'startDate' | 'endDate';

type DateTimeDraft = {
  target: DateTimeTarget;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
};

const createDefaultStartDate = () => new Date().toISOString();

const createDefaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString();
};

const getValidDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDate = (value: string) =>
  getValidDate(value).toLocaleDateString('vi-VN');

const formatTime = (value: string) =>
  getValidDate(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDateTime = (value: string) =>
  `${formatDate(value)} ${formatTime(value)}`;

const pad2 = (value: number) => value.toString().padStart(2, '0');

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const clampNumber = (
  value: string,
  min: number,
  max: number,
  fallback: number
) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const createDateTimeDraft = (
  target: DateTimeTarget,
  value: string
): DateTimeDraft => {
  const date = getValidDate(value);
  return {
    target,
    day: pad2(date.getDate()),
    month: pad2(date.getMonth() + 1),
    year: date.getFullYear().toString(),
    hour: pad2(date.getHours()),
    minute: pad2(date.getMinutes()),
  };
};

const buildDateTimeValue = (currentValue: string, draft: DateTimeDraft) => {
  const currentDate = getValidDate(currentValue);
  const fallbackYear = currentDate.getFullYear();
  const fallbackMonth = currentDate.getMonth() + 1;
  const fallbackDay = currentDate.getDate();
  const fallbackHour = currentDate.getHours();
  const fallbackMinute = currentDate.getMinutes();

  const year = clampNumber(draft.year, 1970, 2100, fallbackYear);
  const month = clampNumber(draft.month, 1, 12, fallbackMonth);
  const maxDay = new Date(year, month, 0).getDate();
  const day = clampNumber(draft.day, 1, maxDay, fallbackDay);
  const hour = clampNumber(draft.hour, 0, 23, fallbackHour);
  const minute = clampNumber(draft.minute, 0, 59, fallbackMinute);

  const nextDate = new Date(currentDate);
  nextDate.setFullYear(year, month - 1, day);
  nextDate.setHours(hour, minute, 0, 0);
  return nextDate.toISOString();
};

const AdminVouchersScreen: React.FC<Props> = ({ navigation }) => {
  const [vouchers, setVouchers] = useState<VoucherDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherDto | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateVoucherDto>({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: undefined,
    startDate: createDefaultStartDate(),
    endDate: createDefaultEndDate(),
    usageLimit: 100,
  });

  const [dateTimeDraft, setDateTimeDraft] = useState<DateTimeDraft | null>(null);

  const openDateTimePicker = (
    picker: 'startDate' | 'endDate' | 'startTime' | 'endTime'
  ) => {
    const target: DateTimeTarget =
      picker === 'startDate' || picker === 'startTime'
        ? 'startDate'
        : 'endDate';
    setDateTimeDraft(createDateTimeDraft(target, formData[target]));
  };

  const closeDateTimePickers = () => {
    setDateTimeDraft(null);
  };

  const updateDateTimeDraft = (
    field: keyof Omit<DateTimeDraft, 'target'>,
    value: string
  ) => {
    setDateTimeDraft((current) =>
      current ? { ...current, [field]: onlyDigits(value) } : current
    );
  };

  const applyDateTimeDraft = () => {
    if (!dateTimeDraft) return;

    const nextValue = buildDateTimeValue(
      formData[dateTimeDraft.target],
      dateTimeDraft
    );

    setFormData({
      ...formData,
      [dateTimeDraft.target]: nextValue,
    });
    closeDateTimePickers();
  };

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const data = await voucherService.getAllVouchers();
      setVouchers(data);
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Không thể tải danh sách voucher', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleSaveVoucher = async () => {
    // Validation
    const normalizedCode = formData.code.trim().toUpperCase();

    if (!normalizedCode) {
      useAlertStore.getState().showAlert('Lỗi', 'Vui lòng nhập mã voucher', { type: 'error' });
      return;
    }

    const voucherPayload: CreateVoucherDto = {
      ...formData,
      code: normalizedCode,
    };
    
    if (formData.discountValue <= 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Giá trị giảm giá phải lớn hơn 0', { type: 'error' });
      return;
    }
    
    if (formData.minOrderValue < 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Giá trị đơn hàng tối thiểu không hợp lệ', { type: 'error' });
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      useAlertStore.getState().showAlert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu', { type: 'error' });
      return;
    }

    if (formData.usageLimit <= 0) {
      useAlertStore.getState().showAlert('Lỗi', 'Giới hạn sử dụng phải lớn hơn 0', { type: 'error' });
      return;
    }

    try {
      setIsLoading(true);
      if (editingVoucher) {
        await voucherService.updateVoucher(editingVoucher.id, voucherPayload);
        useAlertStore.getState().showAlert('Thành công', 'Cập nhật voucher thành công!', { type: 'success' });
      } else {
        await voucherService.createVoucher(voucherPayload);
        useAlertStore.getState().showAlert('Thành công', 'Thêm voucher thành công!', { type: 'success' });
      }
      setModalVisible(false);
      resetForm();
      await fetchVouchers();
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi lưu voucher', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVoucher = (voucher: VoucherDto) => {
    useAlertStore.getState().showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa voucher "${voucher.code}"?`,
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa ngay',
            onPress: async () => {
              try {
                await voucherService.deleteVoucher(voucher.id);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa voucher thành công!', { type: 'success' });
                await fetchVouchers();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa voucher', { type: 'error' });
              }
            }
          }
        ]
      }
    );
  };

  const handleToggleStatus = async (voucher: VoucherDto) => {
    try {
      await voucherService.toggleVoucherStatus(voucher.id);
      await fetchVouchers();
    } catch (error: any) {
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi thay đổi trạng thái', { type: 'error' });
    }
  };

  const resetForm = () => {
    closeDateTimePickers();
    setEditingVoucher(null);
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: undefined,
      startDate: createDefaultStartDate(),
      endDate: createDefaultEndDate(),
      usageLimit: 100,
    });
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (voucher: VoucherDto) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      description: voucher.description,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      usageLimit: voucher.usageLimit,
    });
    setModalVisible(true);
  };

  const getStatusColor = (isActive: boolean, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    if (!isActive) return '#999';
    if (end < now) return '#FF6B6B';
    return '#4ECDC4';
  };

  const getStatusText = (isActive: boolean, endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    if (!isActive) return 'Đã tắt';
    if (end < now) return 'Hết hạn';
    return 'Đang hoạt động';
  };

  const formatDiscount = (voucher: VoucherDto) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    }
    return `${voucher.discountValue.toLocaleString()}đ`;
  };

  // Thống kê
  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.isActive && new Date(v.endDate) >= new Date()).length,
    used: vouchers.reduce((sum, v) => sum + v.usedCount, 0),
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFCC00" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Voucher</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#FFCC00" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.used}</Text>
          <Text style={styles.statLabel}>Đã sử dụng</Text>
        </View>
      </View>

      {/* Voucher List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {vouchers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetag-outline" size={60} color="#BDBDBD" />
            <Text style={styles.emptyText}>Chưa có voucher nào</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>+ Thêm voucher đầu tiên</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vouchers.map((voucher) => (
            <View key={voucher.id} style={styles.voucherCard}>
              <View style={styles.voucherHeader}>
                <View style={styles.voucherCodeContainer}>
                  <Text style={styles.voucherCode}>{voucher.code}</Text>
                  {voucher.discountType === 'percentage' && (
                    <View style={styles.percentBadge}>
                      <Text style={styles.percentBadgeText}>%</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(voucher.isActive, voucher.endDate) + '22' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(voucher.isActive, voucher.endDate) }]}>
                    {getStatusText(voucher.isActive, voucher.endDate)}
                  </Text>
                </View>
              </View>

              <Text style={styles.voucherDesc}>{voucher.description}</Text>

              <View style={styles.voucherDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="pricetag-outline" size={16} color="#FFCC00" />
                  <Text style={styles.detailText}>
                    Giảm: {formatDiscount(voucher)}
                    {voucher.discountType === 'percentage' && voucher.maxDiscount && 
                      ` (tối đa ${voucher.maxDiscount.toLocaleString()}đ)`
                    }
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="cart-outline" size={16} color="#FFCC00" />
                  <Text style={styles.detailText}>
                    Đơn tối thiểu: {voucher.minOrderValue.toLocaleString()}đ
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#FFCC00" />
                  <Text style={styles.detailText}>
                    {formatDateTime(voucher.startDate)} - {formatDateTime(voucher.endDate)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="people-outline" size={16} color="#FFCC00" />
                  <Text style={styles.detailText}>
                    Đã dùng: {voucher.usedCount}/{voucher.usageLimit}
                  </Text>
                </View>
              </View>

              <View style={styles.voucherActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleToggleStatus(voucher)}
                >
                  <Ionicons 
                    name={voucher.isActive ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={voucher.isActive ? "#FF6B6B" : "#4ECDC4"} 
                  />
                  <Text style={[styles.actionText, { color: voucher.isActive ? "#FF6B6B" : "#4ECDC4" }]}>
                    {voucher.isActive ? "Tắt" : "Bật"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => openEditModal(voucher)}
                >
                  <Ionicons name="create-outline" size={20} color="#FFCC00" />
                  <Text style={[styles.actionText, { color: "#FFCC00" }]}>Sửa</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteVoucher(voucher)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                  <Text style={[styles.actionText, { color: "#FF6B6B" }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingVoucher ? '✏️ Chỉnh sửa Voucher' : '➕ Thêm Voucher mới'}
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mã voucher *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.code}
                  onChangeText={(text) =>
                    setFormData({ ...formData, code: text.toUpperCase() })
                  }
                  placeholder="VD: WELCOME20"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={20}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Mô tả chi tiết về voucher..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Loại giảm giá *</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setFormData({ ...formData, discountType: 'percentage', maxDiscount: undefined })}
                  >
                    <View style={[styles.radio, formData.discountType === 'percentage' && styles.radioSelected]}>
                      {formData.discountType === 'percentage' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Phần trăm (%)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setFormData({ ...formData, discountType: 'fixed' })}
                  >
                    <View style={[styles.radio, formData.discountType === 'fixed' && styles.radioSelected]}>
                      {formData.discountType === 'fixed' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Cố định (VNĐ)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {formData.discountType === 'percentage' ? 'Giá trị giảm (%) *' : 'Giá trị giảm (VNĐ) *'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.discountValue.toString()}
                  onChangeText={(text) => setFormData({ ...formData, discountValue: Number(text) || 0 })}
                  keyboardType="numeric"
                  placeholder={formData.discountType === 'percentage' ? "VD: 20" : "VD: 50000"}
                  placeholderTextColor="#999"
                />
              </View>

              {formData.discountType === 'percentage' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Giảm tối đa (VNĐ)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.maxDiscount?.toString() || ''}
                    onChangeText={(text) => setFormData({ ...formData, maxDiscount: text ? Number(text) : undefined })}
                    keyboardType="numeric"
                    placeholder="Không giới hạn"
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Đơn hàng tối thiểu (VNĐ) *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minOrderValue.toString()}
                  onChangeText={(text) => setFormData({ ...formData, minOrderValue: Number(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày bắt đầu *</Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={[styles.dateButton, styles.dateField]}
                    onPress={() => openDateTimePicker('startDate')}
                  >
                    <Ionicons name="calendar" size={20} color="#FFCC00" />
                    <Text style={styles.dateText}>
                      {formatDate(formData.startDate)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateButton, styles.timeField]}
                    onPress={() => openDateTimePicker('startTime')}
                  >
                    <Ionicons name="time" size={20} color="#FFCC00" />
                    <Text style={styles.dateText}>
                      {formatTime(formData.startDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ngày kết thúc *</Text>
                <View style={styles.dateTimeRow}>
                  <TouchableOpacity
                    style={[styles.dateButton, styles.dateField]}
                    onPress={() => openDateTimePicker('endDate')}
                  >
                    <Ionicons name="calendar" size={20} color="#FFCC00" />
                    <Text style={styles.dateText}>
                      {formatDate(formData.endDate)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateButton, styles.timeField]}
                    onPress={() => openDateTimePicker('endTime')}
                  >
                    <Ionicons name="time" size={20} color="#FFCC00" />
                    <Text style={styles.dateText}>
                      {formatTime(formData.endDate)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Giới hạn sử dụng *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.usageLimit.toString()}
                  onChangeText={(text) => setFormData({ ...formData, usageLimit: Number(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="VD: 100"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveVoucher}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>{isLoading ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!dateTimeDraft}
        animationType="fade"
        transparent={true}
        onRequestClose={closeDateTimePickers}
      >
        <View style={styles.dateEditorOverlay}>
          <View style={styles.dateEditorContent}>
            <Text style={styles.dateEditorTitle}>
              {dateTimeDraft?.target === 'startDate'
                ? 'Chỉnh ngày bắt đầu'
                : 'Chỉnh ngày kết thúc'}
            </Text>

            <Text style={styles.dateEditorLabel}>Ngày</Text>
            <View style={styles.dateEditorRow}>
              <View style={styles.dateEditorField}>
                <Text style={styles.dateEditorFieldLabel}>Ngày</Text>
                <TextInput
                  style={styles.dateEditorInput}
                  value={dateTimeDraft?.day ?? ''}
                  onChangeText={(text) => updateDateTimeDraft('day', text)}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.dateEditorField}>
                <Text style={styles.dateEditorFieldLabel}>Tháng</Text>
                <TextInput
                  style={styles.dateEditorInput}
                  value={dateTimeDraft?.month ?? ''}
                  onChangeText={(text) => updateDateTimeDraft('month', text)}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.dateEditorField}>
                <Text style={styles.dateEditorFieldLabel}>Năm</Text>
                <TextInput
                  style={styles.dateEditorInput}
                  value={dateTimeDraft?.year ?? ''}
                  onChangeText={(text) => updateDateTimeDraft('year', text)}
                  keyboardType="numeric"
                  maxLength={4}
                  selectTextOnFocus
                />
              </View>
            </View>

            <Text style={styles.dateEditorLabel}>Giờ</Text>
            <View style={styles.dateEditorRow}>
              <View style={styles.dateEditorField}>
                <Text style={styles.dateEditorFieldLabel}>Giờ</Text>
                <TextInput
                  style={styles.dateEditorInput}
                  value={dateTimeDraft?.hour ?? ''}
                  onChangeText={(text) => updateDateTimeDraft('hour', text)}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.dateEditorField}>
                <Text style={styles.dateEditorFieldLabel}>Phút</Text>
                <TextInput
                  style={styles.dateEditorInput}
                  value={dateTimeDraft?.minute ?? ''}
                  onChangeText={(text) => updateDateTimeDraft('minute', text)}
                  keyboardType="numeric"
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
            </View>

            <View style={styles.dateEditorButtons}>
              <TouchableOpacity
                style={[
                  styles.dateEditorButton,
                  styles.dateEditorCancelButton,
                ]}
                onPress={closeDateTimePickers}
              >
                <Text style={styles.dateEditorCancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateEditorButton,
                  styles.dateEditorConfirmButton,
                ]}
                onPress={applyDateTimeDraft}
              >
                <Text style={styles.dateEditorConfirmText}>Áp dụng</Text>
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
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A2E' },
  addButton: { padding: 4 },
  
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    margin: 16,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#FFCC00' },
  statLabel: { fontSize: 12, color: '#FFF', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#FFFFFF22' },
  
  listContainer: { flex: 1, paddingHorizontal: 16 },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A7851',
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  
  voucherCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voucherCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  percentBadge: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  voucherDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  voucherDetails: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  voucherActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFCC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#FFCC00',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFCC00',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFF',
  },
  dateField: {
    flex: 1.25,
  },
  timeField: {
    flex: 0.85,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  saveButton: {
    backgroundColor: '#FFCC00',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  dateEditorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dateEditorContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
  },
  dateEditorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  dateEditorLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  dateEditorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateEditorField: {
    flex: 1,
  },
  dateEditorFieldLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  dateEditorInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    color: '#1A1A2E',
  },
  dateEditorButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  dateEditorButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  dateEditorCancelButton: {
    backgroundColor: '#F5F5F5',
  },
  dateEditorConfirmButton: {
    backgroundColor: '#FFCC00',
  },
  dateEditorCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  dateEditorConfirmText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A2E',
  },
});

export default AdminVouchersScreen;
