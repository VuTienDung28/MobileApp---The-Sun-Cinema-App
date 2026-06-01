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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import movieService, { MovieListItem } from '../../services/movieService';
import useAlertStore from '../../store/useAlertStore';
import { getImageUrl } from '../../utils/imageUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieManagement'>;

type MovieStatus = 'nowShowing' | 'comingSoon' | 'archived';

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

const getMovieStatus = (releaseDate: string): MovieStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startRange = new Date(today);
  startRange.setDate(startRange.getDate() - 20);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const release = new Date(releaseDate);
  release.setHours(0, 0, 0, 0);

  if (release >= startRange && release < tomorrow) return 'nowShowing';
  if (release >= tomorrow) return 'comingSoon';
  return 'archived';
};

const getStatusBadge = (releaseDate: string) => {
  const status = getMovieStatus(releaseDate);
  if (status === 'nowShowing') {
    return { text: 'Đang chiếu', color: '#4ECDC4', bgColor: '#4ECDC422' };
  }
  if (status === 'comingSoon') {
    return { text: 'Sắp chiếu', color: '#F59E0B', bgColor: '#F59E0B22' };
  }
  return { text: 'Đã qua', color: '#999', bgColor: '#99999922' };
};

const MovieManagementScreen: React.FC<Props> = ({ navigation }) => {
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchMovies();
    const unsubscribe = navigation.addListener('focus', fetchMovies);
    return unsubscribe;
  }, [navigation]);

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
            },
          },
        ],
      }
    );
  };

  const renderMovieCard = (movie: MovieListItem) => {
    const genreColor = GENRE_COLORS[movie.movieGenre] ?? '#8A7851';
    const statusBadge = getStatusBadge(movie.releaseDate);

    return (
      <View key={movie.id} style={styles.movieCard}>
        <Image
          source={{ uri: getImageUrl(movie.thumbnailPosterUrl) }}
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
              <Text style={[styles.genreText, { color: genreColor }]} numberOfLines={1}>
                {movie.movieGenre || 'Chưa phân loại'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={12} color="#8A7851" />
              <Text style={styles.metaText}>{movie.duration} phút</Text>
            </View>
          </View>

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#8A7851" />
            <Text style={styles.dateText}>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</Text>
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
            onPress={() => handleDeleteMovie(movie.id, movie.title)}
          >
            <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movie Management</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="film-outline" size={28} color="#FF6B6B" />
          </View>
          <View>
            <Text style={styles.summaryTitle}>Danh sách phim</Text>
            <Text style={styles.summaryText}>{movies.length} phim trong hệ thống</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFCC00" />
          </View>
        ) : movies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="film-outline" size={52} color="#BDBDBD" />
            <Text style={styles.emptyText}>Không có phim nào</Text>
          </View>
        ) : (
          movies.map(renderMovieCard)
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMovie')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={22} color="#1A1A2E" />
          <Text style={styles.addButtonText}>Thêm phim</Text>
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
    backgroundColor: '#FF6B6B20',
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
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFCC00',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  movieThumbnail: {
    width: 52,
    height: 74,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  movieInfo: {
    flex: 1,
    marginLeft: 14,
  },
  movieTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 5,
  },
  movieTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  genreTag: {
    maxWidth: 150,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  genreText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#8A7851',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7,
  },
  dateText: {
    fontSize: 11,
    color: '#8A7851',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 14,
    marginLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  editButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  editText: {
    fontSize: 10,
    color: '#FFCC00',
    fontWeight: '800',
    marginTop: 2,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
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

export default MovieManagementScreen;
