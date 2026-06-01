import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import theaterService, { CinemaListItemDto } from '../../services/theaterService';
import useAlertStore from '../../store/useAlertStore';

type Props = NativeStackScreenProps<RootStackParamList, 'TheaterManagement'>;

const TheaterManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [theaters, setTheaters] = useState<CinemaListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTheaters = async () => {
    try {
      setIsLoading(true);
      const data = await theaterService.getAllTheaters();
      setTheaters(data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      useAlertStore.getState().showAlert('Lỗi', 'Không thể tải danh sách rạp', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
    const unsubscribe = navigation.addListener('focus', fetchTheaters);
    return unsubscribe;
  }, [navigation]);

  const handleDeleteTheater = (id: number, name: string) => {
    useAlertStore.getState().showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa rạp "${name}"?`,
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa ngay',
            onPress: async () => {
              try {
                setIsLoading(true);
                await theaterService.deleteTheater(id);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa rạp thành công!', { type: 'success' });
                fetchTheaters();
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa rạp', { type: 'error' });
              } finally {
                setIsLoading(false);
              }
            },
          },
        ],
      }
    );
  };

  const renderTheaterCard = (theater: CinemaListItemDto) => (
    <View key={theater.id} style={styles.theaterCard}>
      <TouchableOpacity
        style={styles.theaterMain}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TheaterDetail', { cinemaId: theater.id, cinemaName: theater.name })}
      >
        <View style={styles.theaterIconContainer}>
          <Ionicons name="business-outline" size={30} color="#FFCC00" />
        </View>
        <View style={styles.theaterInfo}>
          <Text style={styles.theaterName} numberOfLines={1}>{theater.name}</Text>
          <View style={styles.theaterMeta}>
            <Ionicons name="location-outline" size={12} color="#8A7851" />
            <Text style={styles.theaterAddress} numberOfLines={2}>{theater.address}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.theaterActions}>
        <TouchableOpacity
          style={styles.theaterEditButton}
          onPress={() => navigation.navigate('EditTheater', { theater })}
        >
          <Ionicons name="pencil-outline" size={19} color="#4ECDC4" />
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.theaterDeleteButton}
          onPress={() => handleDeleteTheater(theater.id, theater.name)}
        >
          <Ionicons name="trash-outline" size={19} color="#FF6B6B" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theater Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="business-outline" size={28} color="#4ECDC4" />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Danh sách rạp</Text>
            <Text style={styles.summaryText}>{theaters.length} rạp trong hệ thống</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFCC00" />
          </View>
        ) : theaters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={52} color="#BDBDBD" />
            <Text style={styles.emptyText}>Không có rạp nào</Text>
          </View>
        ) : (
          theaters.map(renderTheaterCard)
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTheater')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={22} color="#1A1A2E" />
          <Text style={styles.addButtonText}>Thêm rạp</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4ECDC420',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  summaryText: {
    marginTop: 3,
    fontSize: 13,
    color: '#8A7851',
  },
  loadingContainer: {
    paddingVertical: 70,
  },
  theaterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  theaterMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  theaterIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  theaterInfo: {
    flex: 1,
    marginLeft: 14,
  },
  theaterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 5,
  },
  theaterMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  theaterAddress: {
    flex: 1,
    fontSize: 11,
    color: '#8A7851',
    lineHeight: 15,
  },
  theaterActions: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 12,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  theaterEditButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  theaterDeleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  editText: {
    fontSize: 10,
    color: '#4ECDC4',
    fontWeight: '800',
    marginTop: 2,
  },
  deleteText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '800',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A7851',
  },
  addButton: {
    marginTop: 14,
    backgroundColor: '#FFCC00',
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default TheaterManagementScreen;
