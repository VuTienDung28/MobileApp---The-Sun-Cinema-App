import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import movieService, { MovieListItem } from '../../services/movieService';

const getImageUrl = (url: string) => {
  if (!url) return "https://via.placeholder.com/150x220";
  if (url.startsWith("http")) return url;
  const baseUrl = process.env.EXPO_PUBLIC_BASE_IP ? `http://${process.env.EXPO_PUBLIC_BASE_IP}:9000` : "http://localhost:9000";
  return `${baseUrl}${url}`;
};

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}giờ ${m}phút`;
  if (h > 0) return `${h}giờ`;
  return `${m}phút`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  return `${date.getDate()} Thg ${months[date.getMonth()]}, ${date.getFullYear()}`;
};

export default function MovieListScreen() {
  const navigation = useNavigation<any>();
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await movieService.getAllMovies();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMovieItem = ({ item }: { item: MovieListItem }) => (
    <TouchableOpacity 
      style={styles.movieItem} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('MovieDetail', { movieId: item.id })}
    >
      <Image 
        source={{ uri: getImageUrl(item.thumbnailPosterUrl) }} 
        style={styles.poster} 
        contentFit="cover"
        transition={200}
        cachePolicy="disk"
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title.toUpperCase()}</Text>
        
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{formatDate(item.releaseDate)}</Text>
          <View style={[styles.ageBadge, { backgroundColor: getAgeColor(item.ageRestriction) }]}>
            <Text style={styles.ageText}>{item.ageRestriction || 'P'}</Text>
          </View>
        </View>
        
        <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        
        <View style={styles.techRow}>
          <View style={styles.techTag}><Text style={styles.techText}>4DX</Text></View>
          <View style={styles.techTag}><Text style={[styles.techText, { color: '#D29A1D' }]}>STARIUM</Text></View>
          {item.duration > 100 && (
            <View style={styles.techTag}><Text style={styles.techText}>ULTRA 4DX</Text></View>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={24} color="#CCC" style={styles.arrow} />
    </TouchableOpacity>
  );

  const getAgeColor = (age: string) => {
    switch (age) {
      case 'T18': return '#FF4D4D';
      case 'T16': return '#FFCC00';
      case 'T13': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#A52A2A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn phim của bạn</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Menu')}>
          <Feather name="menu" size={28} color="#A52A2A" />
        </TouchableOpacity>
      </View>

      {/* --- Subheader / Filter --- */}
      <View style={styles.filterBar}>
        <View style={styles.filterActive}>
          <Ionicons name="checkmark" size={18} color="#888" />
          <Text style={styles.filterText}>Đang chiếu</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFCC00" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderMovieItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterBar: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  filterActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#888',
  },
  listContent: {
    paddingBottom: 20,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 0,
    backgroundColor: '#FFF',
    alignItems: 'center',
  },
  poster: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#888',
  },
  ageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ageText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  durationText: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  techTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
  },
  techText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  arrow: {
    marginRight: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#EEE',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
