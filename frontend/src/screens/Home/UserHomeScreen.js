import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/useAuthStore';

const UserHomeScreen = () => {
  const signOut = useAuthStore(state => state.signOut);

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        { 
          text: "Xác nhận", 
          onPress: () => signOut(),
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>THE SUN CINEMA</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.avatarButton}>
          <Ionicons name="person-circle" size={40} color="#FFCC00" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Ionicons name="film" size={100} color="#BDBDBD" />
        <Text style={styles.welcomeText}>Xin chào Khách hàng!</Text>
        <Text style={styles.subText}>Cùng trải nghiệm những bộ phim tuyệt vời nhé.</Text>
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
    color: '#FFCC00',
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

export default UserHomeScreen;
