import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import movieService, { MovieDetail } from '../../services/movieService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const getImageUrl = (url: string) => {
  if (!url) return "https://via.placeholder.com/600x900";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.EXPO_PUBLIC_BASE_IP ? `http://${process.env.EXPO_PUBLIC_BASE_IP}:9000` : "http://localhost:9000";
  return `${baseUrl}${url}`;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;
  return `${m} phút`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const MovieDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { movieId } = route.params;
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  const fetchMovieDetail = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getMovieById(movieId);
      setMovie(data);
    } catch (error) {
      console.error("Error fetching movie detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  if (!movie) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin phim</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* --- Header: Backdrop & Mini Poster --- */}
        <View style={styles.header}>
          <Image 
            source={{ uri: getImageUrl(movie.backdropPosterUrl || movie.thumbnailPosterUrl) }} 
            style={styles.backdrop} 
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#1A1A1A']}
            style={styles.gradient}
          />
          
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.posterContainer}>
              <Image 
                source={{ uri: getImageUrl(movie.thumbnailPosterUrl) }} 
                style={styles.miniPoster} 
                contentFit="cover"
                transition={200}
                cachePolicy="disk"
              />
            </View>
            
            <View style={styles.mainInfo}>
              <Text style={styles.title}>{movie.title.toUpperCase()}</Text>
              
              <View style={styles.tagRow}>
                <View style={styles.tag}><Text style={styles.tagText}>4DX</Text></View>
                <View style={styles.tag}><Text style={styles.tagText}>STARIUM</Text></View>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={16} color="#AAA" />
                <Text style={styles.metaText}>{formatDate(movie.releaseDate)}</Text>
                <Ionicons name="time-outline" size={16} color="#AAA" style={{ marginLeft: 15 }} />
                <Text style={styles.metaText}>{formatDuration(movie.duration)}</Text>
              </View>

              <View style={styles.reactionRow}>
                <Ionicons name="heart" size={20} color="#FF4D4D" />
                <Text style={styles.reactionCount}>{movie.totalReactions || 1777}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- Description --- */}
        <View style={styles.section}>
          <Text 
            style={styles.description} 
            numberOfLines={showFullDesc ? undefined : 3}
          >
            {movie.description}
          </Text>
          <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
            <Text style={styles.showMore}>{showFullDesc ? 'Thu gọn' : 'Xem thêm'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* --- Full Details --- */}
        <View style={styles.section}>
          <DetailItem label="Kiểm duyệt" value={movie.ageRestriction || 'P'} valueColor="#FFCC00" />
          <DetailItem label="Thể loại" value={movie.movieGenre} />
          <DetailItem label="Đạo diễn" value={movie.director} />
          <DetailItem label="Diễn viên" value={movie.movieActors} />
          <DetailItem label="Ngôn ngữ" value={movie.language} />
        </View>
      </ScrollView>

      {/* --- Footer Button --- */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookingButton}>
          <Text style={styles.bookingButtonText}>ĐẶT VÉ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const DetailItem = ({ label, value, valueColor = '#FFF' }: { label: string, value: string, valueColor?: string }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, { color: valueColor }]}>{value || 'Đang cập nhật'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 20,
  },
  backBtnText: {
    color: '#FFCC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    height: 420,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  posterContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  miniPoster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  mainInfo: {
    flex: 1,
    marginLeft: 20,
    paddingBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    color: '#AAA',
    fontSize: 13,
    marginLeft: 5,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reactionCount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  description: {
    color: '#DDD',
    fontSize: 15,
    lineHeight: 24,
  },
  showMore: {
    color: '#FFCC00',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    marginTop: 25,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailLabel: {
    color: '#888',
    width: 100,
    fontSize: 14,
  },
  detailValue: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    padding: 20,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  bookingButton: {
    backgroundColor: '#FFCC00',
    height: 55,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookingButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});

export default MovieDetailScreen;
