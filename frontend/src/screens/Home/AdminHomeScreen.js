import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/useAuthStore';

const AdminHomeScreen = () => {
  const signOut = useAuthStore(state => state.signOut);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy (Cancel)",
          style: "cancel"
        },
        { 
          text: "Xác nhận (OK)", 
          onPress: () => signOut(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.avatarButton}>
          <Ionicons name="person-circle" size={40} color="#FFCC00" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="settings" size={100} color="#BDBDBD" />
        <Text style={styles.welcomeText}>Xin chào Admin!</Text>
        <Text style={styles.subText}>Đây là giao diện dành riêng cho quản trị viên.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  }
});

export default AdminHomeScreen;
