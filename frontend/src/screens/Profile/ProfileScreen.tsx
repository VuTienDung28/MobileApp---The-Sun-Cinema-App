import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import useAuthStore from '../../store/useAuthStore';
import useAlertStore from '../../store/useAlertStore';
import { RootStackParamList } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { signOut, role } = useAuthStore();
  const showAlert = useAlertStore(state => state.showAlert);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState('ĐẶNG THỊ KHÁNH VY');

  const goToVerifyPassword = () => {
    navigation.navigate('VerifyPassword', {
      fullName,
      avatar,
      onSave: (newName: string, newAvatar: string | null) => {
        setFullName(newName);
        setAvatar(newAvatar);
      },
    });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      showAlert('Thông báo', 'Bạn cần cấp quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleLogout = () => {
    showAlert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?', {
      type: 'warning',
      buttons: [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => signOut() },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#8B4A12" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trang cá nhân</Text>

        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* PROFILE CARD */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.profileCard}
          onPress={goToVerifyPassword}
        >
          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={70} color="#3A2418" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
              <Ionicons name="camera" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userRole}>
              {role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={30} color="#B0823A" />
        </TouchableOpacity>

        {/* MENU */}
        <View style={styles.menuCard}>
          <MenuItem
            title="Thông tin Tài khoản"
            icon="card-account-details-outline"
            onPress={goToVerifyPassword}
          />

          <MenuItem
            title="Đổi mật khẩu"
            icon="lock-outline"
            onPress={() => navigation.navigate('ChangePassword')}
          />

          <MenuItem
            title="Cài đặt mật mã thanh toán"
            icon="dialpad"
            onPress={() => navigation.navigate('PaymentPin')}
          />

          <MenuItem
            title="Lịch sử Giao dịch"
            icon="file-clock-outline"
            onPress={() => navigation.navigate('TransactionHistory')}
            isLast
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={25} color="#FF3B30" />
          <Text style={styles.logoutText}>ĐĂNG XUẤT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

type MenuItemProps = {
  title: string;
  icon: any;
  onPress: () => void;
  isLast?: boolean;
};

const MenuItem = ({ title, icon, onPress, isLast }: MenuItemProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[styles.menuRow, !isLast && styles.menuDivider]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name={icon} size={28} color="#D39A05" />

      <Text style={styles.menuText}>{title}</Text>

      <Ionicons name="chevron-forward" size={26} color="#B0823A" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF4EA',
  },

  header: {
    height: 64,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2F211A',
  },

  content: {
    padding: 18,
    paddingBottom: 28,
  },

  profileCard: {
    minHeight: 150,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    elevation: 3,
  },

  avatarWrap: {
    width: 118,
    height: 118,
    marginRight: 22,
  },

  avatarCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#F8B900',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: 118,
    height: 118,
    borderRadius: 59,
  },

  cameraButton: {
    position: 'absolute',
    right: -4,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F8B900',
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  profileInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 21,
    fontWeight: '900',
    color: '#2F211A',
  },

  userRole: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#9B7A3F',
  },

  menuCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    elevation: 3,
  },

  menuRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFE8DD',
  },

  menuText: {
    flex: 1,
    marginLeft: 18,
    fontSize: 17,
    color: '#2F211A',
    fontWeight: '500',
  },

  logoutButton: {
    height: 64,
    borderRadius: 14,
    backgroundColor: '#FFE7EA',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoutText: {
    marginLeft: 10,
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '900',
  },
});

export default ProfileScreen;