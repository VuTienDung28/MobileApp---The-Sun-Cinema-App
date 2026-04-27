import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAuthStore from '../../store/useAuthStore';

import movieService, { MovieListItem } from '../../services/movieService';
import useAlertStore from '../../store/useAlertStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

const GENRE_COLORS: Record<string, string> = {
  Action: '#FF6B6B',
  'Hành động': '#FF6B6B',
  Animation: '#4ECDC4',
  'Hoạt hình': '#4ECDC4',
  Thriller: '#A78BFA',
  'Hồi hộp': '#A78BFA',
  Adventure: '#F59E0B',
  'Phiêu lưu': '#F59E0B',
  Fantasy: '#60A5FA',
  'Viễn tưởng': '#60A5FA',
  Horror: '#F97316',
  'Kinh dị': '#F97316',
  'Tình cảm': '#F06292',
  'Hài hước': '#FFD54F',
};

// Helper function to get image URL
const getImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.EXPO_PUBLIC_BASE_IP ? `http://${process.env.EXPO_PUBLIC_BASE_IP}:9000` : 'http://localhost:9000';
  return `${baseUrl}${url}`;
};

// ─── Dropdown Menu Component ───────────────────────────────────────────────────
const AvatarDropdown: React.FC<{
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}> = ({ visible, onClose, onNavigate, onLogout }) => {
  const menuItems = [
    { key: 'MovieManagement', label: 'Movie Management', icon: 'film-outline' as const },
    { key: 'TheaterManagement', label: 'Theater Management', icon: 'business-outline' as const },
    { key: 'TotalTickets', label: 'View Total Tickets Sold', icon: 'ticket-outline' as const },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownArrow} />
          <View style={styles.dropdownCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
                onPress={() => {
                  onClose();
                  onNavigate(item.key);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={18} color="#FFCC00" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color="#8A7851" />
              </TouchableOpacity>
            ))}

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.logoutItem}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, styles.logoutIconWrap]}>
                <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
              </View>
              <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ─── Movie Card Component ─────────────────────────────────────────────────────
const MovieCard: React.FC<{
  movie: MovieListItem;
  rank: number;
  navigation: any;
  onDelete: (id: number, title: string) => void;
}> = ({ movie, rank, navigation, onDelete }) => {
  const genreColor = GENRE_COLORS[movie.movieGenre] ?? '#888';
  const isTop3 = rank <= 3;

  return (
    <View style={[styles.movieCard, isTop3 && styles.movieCardTop]}>
      {/* Thumbnail thay cho Rank */}
      <Image 
        source={{ uri: getImageUrl(movie.thumbnailPosterUrl) || 'https://via.placeholder.com/60x90' }} 
        style={styles.movieThumbnail} 
      />

      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
        <View style={styles.infoRow}>
          <View style={[styles.genreTag, { backgroundColor: genreColor + '22', borderColor: genreColor + '55' }]}>
            <Text style={[styles.genreText, { color: genreColor }]}>{movie.movieGenre}</Text>
          </View>
          
          {/* Reaction di chuyển sang trái */}
          <View style={styles.reactionMini}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.reactionMiniText}>{movie.totalReactions}</Text>
          </View>
        </View>
      </View>

      {/* Nhóm nút Sửa & Xóa */}
      <View style={styles.actionGroup}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditMovie', { movie })}
        >
          <Ionicons name="create-outline" size={20} color="#FFCC00" />
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(movie.id, movie.title)}
        >
          <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const signOut = useAuthStore(state => state.signOut);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMovies();
    });
    return unsubscribe;
  }, [navigation]);

  // Hiện tại chưa có API thống kê thật, nên ta dùng tạm dữ liệu từ danh sách phim
  const totalTickets = movies.reduce((sum, m) => sum + m.totalReactions, 0); // Tạm lấy reactions làm ticket sold
  const totalRevenue = totalTickets * 75000; // Giả định giá vé trung bình

  const handleNavigate = (screen: string) => {
    if (screen === 'MovieManagement') {
      navigation.navigate('AddMovie' as never);
    } else if (screen === 'TheaterManagement') {
      navigation.navigate('AddTheater' as never);  
    } else {
      try {
        (navigation.navigate as (s: string) => void)(screen);
      } catch {
        console.log(`Navigate to: ${screen}`);
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
  };

  const handleDeleteMovie = (id: number, title: string) => {
    useAlertStore.getState().showAlert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa phim "${title}"?`,
      {
        type: 'warning',
        buttons: [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Xóa ngay', 
            onPress: async () => {
              try {
                setIsLoading(true);
                await movieService.deleteMovie(id);
                useAlertStore.getState().showAlert('Thành công', 'Đã xóa phim thành công!', { type: 'success' });
                fetchMovies(); // Tải lại danh sách
              } catch (error: any) {
                useAlertStore.getState().showAlert('Lỗi', error.message || 'Lỗi khi xóa phim', { type: 'error' });
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Welcome back,</Text>
          <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        </View>
        <TouchableOpacity
          onPress={() => setDropdownVisible(true)}
          style={styles.avatarButton}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle" size={42} color="#FFCC00" />
          <View style={styles.avatarDot} />
        </TouchableOpacity>
      </View>

      {/* ── Stats Bar ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="ticket-outline" size={20} color="#FFCC00" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{totalTickets.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Tickets</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="film-outline" size={20} color="#FFCC00" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{movies.length}</Text>
            <Text style={styles.statLabel}>Now Showing</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={20} color="#FFCC00" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{(totalRevenue / 1_000_000).toFixed(0)}M</Text>
            <Text style={styles.statLabel}>Revenue (VND)</Text>
          </View>
        </View>
      </View>

      {/* ── Movie List ── */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>🎬 Box Office Rankings</Text>
        {movies.map((movie, index) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            rank={index + 1} 
            navigation={navigation}
            onDelete={handleDeleteMovie}
          />
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Avatar Dropdown ── */}
      <AvatarDropdown
        visible={dropdownVisible}
        onClose={() => setDropdownVisible(false)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE5B4',
  },
  headerSub: { fontSize: 12, color: '#8A7851', letterSpacing: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFCC00', letterSpacing: 0.5 },
  avatarButton: { padding: 4, position: 'relative' },
  avatarDot: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  statItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  statText: { flexDirection: 'column' },
  statValue: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 10, color: '#FFCC00', marginTop: 1 },
  statDivider: { width: 1, height: 36, backgroundColor: '#FFFFFF22' },

  listContainer: { flex: 1, marginTop: 16 },
  listContent: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#8A7851', marginBottom: 12 },

  movieCard: {
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
  movieCardTop: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFCC00',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF0D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: { fontSize: 13, fontWeight: '700', color: '#8A7851' },
  rankTextTop: { color: '#FFF' },

  movieThumbnail: {
    width: 50,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  reactionMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionMiniText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontSize: 10,
    color: '#FFCC00',
    fontWeight: '700',
    marginTop: 2,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 10,
    color: '#FF6B6B',
    fontWeight: '700',
    marginTop: 2,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  movieMeta: { flexDirection: 'row' },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreText: { fontSize: 10, fontWeight: '600' },

  ticketBlock: { alignItems: 'flex-end', minWidth: 75 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 },
  trendText: { fontSize: 11, fontWeight: '700' },
  ticketCount: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  ticketLabel: { fontSize: 10, color: '#8A7851' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  dropdownContainer: {
    position: 'absolute',
    top: 90,
    right: 16,
    alignItems: 'flex-end',
  },
  dropdownArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFF',
    marginRight: 18,
    marginBottom: -1,
    zIndex: 1,
  },
  dropdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  menuItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#FFF0D4' },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#8A7851' },
  menuDivider: { height: 1, backgroundColor: '#FFF0D4', marginVertical: 2 },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  logoutIconWrap: { backgroundColor: '#FFF0F0' },
  logoutLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#FF6B6B' },
});

export default AdminHomeScreen;