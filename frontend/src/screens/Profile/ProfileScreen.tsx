import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useAuthStore from '../../store/useAuthStore';
import useAlertStore from '../../store/useAlertStore';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, role } = useAuthStore();
  const showAlert = useAlertStore(state => state.showAlert);

  const handleLogout = () => {
    showAlert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', {
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => signOut() }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Ionicons name="person-circle" size={100} color="#FFCC00" />
          <Text style={styles.userName}>Người dùng {role}</Text>
          <Text style={styles.userRole}>{role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}</Text>
        </View>
        <View style={styles.placeholderBox}>
          <Ionicons name="construct-outline" size={40} color="#CCC" />
          <Text style={styles.placeholderText}>Tính năng đang phát triển...</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#F44336" />
          <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF5ED' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { padding: 20, flexGrow: 1 },
  avatarSection: { alignItems: 'center', marginBottom: 30, backgroundColor: '#FFF', padding: 20, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 10 },
  userRole: { fontSize: 16, color: '#8A7851', marginTop: 5 },
  placeholderBox: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 30, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E0E0E0', flex: 1 },
  placeholderText: { marginTop: 10, color: '#999', fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFEBEB', padding: 15, borderRadius: 12, marginTop: 'auto' },
  logoutText: { color: '#F44336', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }
});

export default ProfileScreen;