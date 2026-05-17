import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';  
import useAuthStore from '../../store/useAuthStore';  

type Props = NativeStackScreenProps<RootStackParamList, 'AdminMenu'>;

const AdminMenuScreen: React.FC<Props> = ({ navigation }) => {
  const signOut = useAuthStore(state => state.signOut);

  const menuItems = [
    {
      key: 'MovieManagement',
      title: 'Movie Management',
      description: 'Thêm, sửa, xóa phim',
      icon: 'film-outline' as const,
      color: '#FF6B6B',
      screen: 'AddMovie',
    },
    {
      key: 'TheaterManagement',
      title: 'Theater Management',
      description: 'Quản lý rạp chiếu phim',
      icon: 'business-outline' as const,
      color: '#4ECDC4',
      screen: 'AddTheater',
    },
    {
      key: 'VoucherManagement', // Thêm mới
      title: 'Voucher Management',
      description: 'Thêm, sửa, xóa mã giảm giá',
      icon: 'pricetag-outline' as const,
      color: '#FFCC00',
      screen: 'AdminVouchers',
    },
    {
      key: 'TotalTickets',
      title: 'View Total Tickets Sold',
      description: 'Thống kê vé đã bán',
      icon: 'ticket-outline' as const,
      color: '#F59E0B',
      screen: 'TotalTickets',
    },
    {
      key: 'Logout',
      title: 'Logout',
      description: 'Đăng xuất khỏi hệ thống',
      icon: 'log-out-outline' as const,
      color: '#FF6B6B',
    },
  ];

  const handlePress = async (item: typeof menuItems[0]) => {
    if (item.key === 'Logout') {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
    } else if (item.screen) {
      navigation.navigate(item.screen as never);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Menu</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={50} color="#FFCC00" />
          </View>
          <Text style={styles.adminName}>Administrator</Text>
          <Text style={styles.adminRole}>Admin Dashboard</Text>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuCard, { borderTopColor: item.color }]}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
              <View style={styles.arrowIcon}>
                <Ionicons name="chevron-forward" size={20} color="#8A7851" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFCC00',
  },
  adminName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  adminRole: {
    fontSize: 14,
    color: '#8A7851',
  },
  menuGrid: {
    gap: 16,
  },
  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderTopWidth: 3,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#FFE5B4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#8A7851',
  },
  arrowIcon: {
    position: 'absolute',
    right: 16,
    top: 28,
  },
});

export default AdminMenuScreen;