import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import useAuthStore from '../../store/useAuthStore';
import useAlertStore from '../../store/useAlertStore';

import movieService, { MovieListItem } from '../../services/movieService';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminHome'>;

type MovieStatus = 'nowShowing' | 'comingSoon';

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

// Xác định trạng thái phim dựa vào ngày phát hành
// Logic giống với UserHomeScreen
const getMovieStatus = (releaseDate: string): MovieStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const release = new Date(releaseDate);
  release.setHours(0, 0, 0, 0);
  
  // Nếu ngày phát hành <= hôm nay => Đang chiếu
  // Nếu ngày phát hành > hôm nay => Sắp chiếu
  if (release <= today) {
    return 'nowShowing';
  } else {
    return 'comingSoon';
  }
};

// Interface cho Theater
interface TheaterItem {
  id: number;
  name: string;
  address: string;
  hotline: string;
  email: string;
  totalScreens: number;
  totalSeats: number;
  openingTime: string;
  closingTime: string;
}

// ─── Movie Card Component ─────────────────────────────────────────────────────
const MovieCard: React.FC<{
  movie: MovieListItem;
  rank: number;
  navigation: any;
  onDelete: (id: number, title: string) => void;
}> = ({ movie, rank, navigation, onDelete }) => {
  const genreColor = GENRE_COLORS[movie.movieGenre] ?? '#888';
  const isTop3 = rank <= 3;
  const movieStatus = getMovieStatus(movie.releaseDate);
  
  const getStatusBadge = () => {
    if (movieStatus === 'nowShowing') {
      return { text: 'Đang chiếu', color: '#4ECDC4', bgColor: '#4ECDC422' };
    } else {
      return { text: 'Sắp chiếu', color: '#F59E0B', bgColor: '#F59E0B22' };
    }
  };
  
  const statusBadge = getStatusBadge();

  return (
    <View style={[styles.movieCard, isTop3 && styles.movieCardTop]}>
      <Image 
        source={{ uri: getImageUrl(movie.thumbnailPosterUrl) || 'https://via.placeholder.com/60x90' }} 
        style={styles.movieThumbnail} 
        contentFit="cover"
        transition={200}
        cachePolicy="disk"
      />

      <View style={styles.movieInfo}>
        <View style={styles.movieTitleRow}>
          <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
            <Text style={[styles.statusText, { color: statusBadge.color }]}>{statusBadge.text}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={[styles.genreTag, { backgroundColor: genreColor + '22', borderColor: genreColor + '55' }]}>
            <Text style={[styles.genreText, { color: genreColor }]}>{movie.movieGenre}</Text>
          </View>
          
          <View style={styles.reactionMini}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.reactionMiniText}>{movie.totalReactions}</Text>
          </View>
        </View>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={10} color="#8A7851" />
          <Text style={styles.dateText}>
            {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>

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

// ─── Theater Card Component ─────────────────────────────────────────────────────
const TheaterCard: React.FC<{
  theater: TheaterItem;
  index: number;
  onDelete: (id: number, name: string) => void;
}> = ({ theater, index, onDelete }) => {
  return (
    <View style={styles.theaterCard}>
      <View style={styles.theaterIconContainer}>
        <Ionicons name="business-outline" size={30} color="#FFCC00" />
      </View>
      <View style={styles.theaterInfo}>
        <Text style={styles.theaterName} numberOfLines={1}>{theater.name}</Text>
        <View style={styles.theaterMeta}>
          <Ionicons name="location-outline" size={12} color="#8A7851" />
          <Text style={styles.theaterAddress} numberOfLines={1}>{theater.address}</Text>
        </View>
        <View style={styles.theaterStats}>
          <View style={styles.theaterStat}>
            <Ionicons name="tv-outline" size={12} color="#FFCC00" />
            <Text style={styles.theaterStatText}>{theater.totalScreens} phòng</Text>
          </View>
          <View style={styles.theaterStat}>
            <Ionicons name="people-outline" size={12} color="#FFCC00" />
            <Text style={styles.theaterStatText}>{theater.totalSeats} ghế</Text>
          </View>
          <View style={styles.theaterStat}>
            <Ionicons name="call-outline" size={12} color="#FFCC00" />
            <Text style={styles.theaterStatText}>{theater.hotline}</Text>
          </View>
        </View>
      </View>
      <View style={styles.theaterActions}>
        <TouchableOpacity 
          style={styles.theaterDeleteButton}
          onPress={() => onDelete(theater.id, theater.name)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminHomeScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'theaters'>('movies');
  const [movieStatusFilter, setMovieStatusFilter] = useState<MovieStatus>('nowShowing');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [theaters, setTheaters] = useState<TheaterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy danh sách phim
  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      useAlertStore.getState().showAlert('Lỗi', 'Không thể tải danh sách phim', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Lọc phim theo trạng thái
  const getFilteredMovies = () => {
    return movies.filter(movie => getMovieStatus(movie.releaseDate) === movieStatusFilter);
  };

  // Lấy tiêu đề cho nút bộ lọc
  const getStatusButtonTitle = () => {
    return movieStatusFilter === 'nowShowing' ? '🎬 Đang chiếu' : '⏰ Sắp chiếu';
  };

  // Lấy số lượng phim theo từng loại
  const getNowShowingCount = () => {
    return movies.filter(movie => getMovieStatus(movie.releaseDate) === 'nowShowing').length;
  };

  const getComingSoonCount = () => {
    return movies.filter(movie => getMovieStatus(movie.releaseDate) === 'comingSoon').length;
  };

  // Lấy danh sách rạp (mock data)
  const fetchTheaters = async () => {
    try {
      const mockTheaters: TheaterItem[] = [
        {
          id: 1,
          name: 'THE SUN CINEMA - Quận 1',
          address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
          hotline: '02812345678',
          email: 'quan1@thesun.vn',
          totalScreens: 8,
          totalSeats: 1200,
          openingTime: '08:00',
          closingTime: '23:59',
        },
        {
          id: 2,
          name: 'THE SUN CINEMA - Quận 7',
          address: '456 Đường Nguyễn Thị Thập, Quận 7, TP.HCM',
          hotline: '02887654321',
          email: 'quan7@thesun.vn',
          totalScreens: 6,
          totalSeats: 850,
          openingTime: '09:00',
          closingTime: '23:00',
        },
        {
          id: 3,
          name: 'THE SUN CINEMA - Thủ Đức',
          address: '789 Đường Võ Văn Ngân, Thủ Đức, TP.HCM',
          hotline: '02811223344',
          email: 'thuduc@thesun.vn',
          totalScreens: 5,
          totalSeats: 700,
          openingTime: '08:30',
          closingTime: '22:30',
        },
      ];
      setTheaters(mockTheaters);
    } catch (error) {
      console.error('Error fetching theaters:', error);
    }
  };

  // Refresh dữ liệu khi focus vào màn hình
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMovies();
      fetchTheaters();
    });
    return unsubscribe;
  }, [navigation]);

  // Lấy params từ navigation (khi từ AddTheater quay về)
  useEffect(() => {
    const params = navigation.getState()?.routes?.find(route => route.name === 'AdminHome')?.params;
    if (params && (params as any).refreshTheaters) {
      fetchTheaters();
      setActiveTab('theaters');
    }
  }, [navigation]);

  // Tính tổng vé và doanh thu từ phim
  const totalTickets = movies.reduce((sum, m) => sum + m.totalReactions, 0);
  const totalRevenue = totalTickets * 75000;

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
                fetchMovies();
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
              useAlertStore.getState().showAlert('Thành công', 'Đã xóa rạp thành công!', { type: 'success' });
              fetchTheaters();
            }
          }
        ]
      }
    );
  };

  const filteredMovies = getFilteredMovies();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image 
            source={{ uri: 'https://i.pinimg.com/originals/79/3b/fa/793bfa88e7aa8b825001bc4ce1dbe53e.gif' }} 
            style={{ width: 100, height: 100 }}
          />
          <View>
            <Text style={styles.headerSub}>Welcome back,</Text>
            <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminMenu' as never)}
          style={styles.avatarButton}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle" size={42} color="#FFCC00" />
          <View style={styles.avatarDot} />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
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
            <Text style={styles.statLabel}>Total Movies</Text>
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

      {/* Tab Selector - PHIM và RẠP */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'movies' && styles.tabActive]}
          onPress={() => setActiveTab('movies')}
        >
          <Ionicons name="film-outline" size={20} color={activeTab === 'movies' ? '#FFCC00' : '#8A7851'} />
          <Text style={[styles.tabText, activeTab === 'movies' && styles.tabTextActive]}>Phim</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'theaters' && styles.tabActive]}
          onPress={() => setActiveTab('theaters')}
        >
          <Ionicons name="business-outline" size={20} color={activeTab === 'theaters' ? '#FFCC00' : '#8A7851'} />
          <Text style={[styles.tabText, activeTab === 'theaters' && styles.tabTextActive]}>Rạp</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'movies' ? (
          <>
            <View style={styles.sectionHeader}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowStatusMenu(true)}
              >
                <Text style={styles.filterButtonText}>{getStatusButtonTitle()}</Text>
                <Ionicons name="chevron-down" size={16} color="#8A7851" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('AddMovie' as never)}>
                <Ionicons name="add-circle-outline" size={24} color="#FFCC00" />
              </TouchableOpacity>
            </View>

            {filteredMovies.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="film-outline" size={50} color="#BDBDBD" />
                <Text style={styles.emptyText}>Không có phim nào</Text>
              </View>
            ) : (
              filteredMovies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  rank={index + 1} 
                  navigation={navigation}
                  onDelete={handleDeleteMovie}
                />
              ))
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏢 Danh sách rạp đang hoạt động</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AddTheater' as never)}>
                <Ionicons name="add-circle-outline" size={24} color="#FFCC00" />
              </TouchableOpacity>
            </View>
            {theaters.map((theater, index) => (
              <TheaterCard 
                key={theater.id} 
                theater={theater} 
                index={index}
                onDelete={handleDeleteTheater}
              />
            ))}
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modal chọn loại phim */}
      <Modal
        visible={showStatusMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowStatusMenu(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalCard}>
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => {
                  setMovieStatusFilter('nowShowing');
                  setShowStatusMenu(false);
                }}
              >
                <Ionicons name="film-outline" size={20} color="#4ECDC4" />
                <Text style={styles.modalItemText}>🎬 Đang chiếu</Text>
                <Text style={styles.modalItemCount}>({getNowShowingCount()})</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalItem}
                onPress={() => {
                  setMovieStatusFilter('comingSoon');
                  setShowStatusMenu(false);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#F59E0B" />
                <Text style={styles.modalItemText}>⏰ Sắp chiếu</Text>
                <Text style={styles.modalItemCount}>({getComingSoonCount()})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// Styles
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

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#1A1A2E',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A7851',
  },
  tabTextActive: {
    color: '#FFCC00',
  },

  listContainer: { flex: 1, marginTop: 16 },
  listContent: { paddingHorizontal: 16 },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#8A7851' },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE5B4',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A7851',
  },

  movieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  dateText: {
    fontSize: 10,
    color: '#8A7851',
  },

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
  movieTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  genreTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreText: { fontSize: 10, fontWeight: '600' },
  reactionMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionMiniText: {
    fontSize: 12,
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
  editButton: { alignItems: 'center', justifyContent: 'center' },
  editText: { fontSize: 10, color: '#FFCC00', fontWeight: '700', marginTop: 2 },
  deleteButton: { alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 10, color: '#FF6B6B', fontWeight: '700', marginTop: 2 },

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
  theaterIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  theaterInfo: {
    flex: 1,
    marginLeft: 15,
  },
  theaterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  theaterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  theaterAddress: {
    fontSize: 11,
    color: '#8A7851',
    flex: 1,
  },
  theaterStats: {
    flexDirection: 'row',
    gap: 12,
  },
  theaterStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  theaterStatText: {
    fontSize: 10,
    color: '#8A7851',
  },
  theaterActions: {
    flexDirection: 'row',
    gap: 12,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  theaterDeleteButton: {
    padding: 6,
  },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  modalItemCount: {
    fontSize: 14,
    color: '#8A7851',
  },
});

export default AdminHomeScreen;