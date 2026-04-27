import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
  Platform,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import movieService from '../../services/movieService';
import useAlertStore from '../../store/useAlertStore';

type Props = NativeStackScreenProps<RootStackParamList, 'EditMovie'>;

const getImageUrl = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const baseUrl = process.env.EXPO_PUBLIC_BASE_IP ? `http://${process.env.EXPO_PUBLIC_BASE_IP}:9000` : 'http://localhost:9000';
  return `${baseUrl}${url}`;
};

const EditMovieScreen: React.FC<Props> = ({ navigation, route }) => {
  const { movie } = route.params;

  const [movieTitle, setMovieTitle] = useState(movie.title || '');
  const [genre, setGenre] = useState(movie.movieGenre || '');
  const [director, setDirector] = useState(movie.director || '');
  const [actors, setActors] = useState(movie.movieActors || '');
  const [duration, setDuration] = useState(movie.duration?.toString() || '');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState(movie.description || '');
  const [ageRestriction, setAgeRestriction] = useState(movie.ageRestriction || 'P');
  const [language, setLanguage] = useState(movie.language || 'Tiếng Việt');
  
  const [posterImage, setPosterImage] = useState<string | null>(getImageUrl(movie.thumbnailPosterUrl));
  const [backdropImage, setBackdropImage] = useState<string | null>(getImageUrl(movie.backdropPosterUrl));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Format date from ISO to DD/MM/YYYY
    if (movie.releaseDate) {
      const d = new Date(movie.releaseDate);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      setReleaseDate(`${day}/${month}/${year}`);
    }

    // Nếu movie truyền vào chưa đủ thông tin, fetch chi tiết
    const fetchDetail = async () => {
      try {
        const detail = await movieService.getMovieById(movie.id);
        setActors(detail.movieActors);
        setDirector(detail.director);
        setDescription(detail.description);
        setBackdropImage(getImageUrl(detail.backdropPosterUrl));
      } catch (e) {
        console.error('Error fetching detail:', e);
      }
    };
    fetchDetail();
  }, [movie.id]);

  const pickImage = async (type: 'poster' | 'backdrop') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'poster' ? [2, 3] : [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (type === 'poster') setPosterImage(result.assets[0].uri);
      else setBackdropImage(result.assets[0].uri);
    }
  };

  const showImageOptions = (type: 'poster' | 'backdrop') => {
    if (Platform.OS === 'web') {
      pickImage(type);
      return;
    }
    Alert.alert(
      type === 'poster' ? 'Cập nhật ảnh poster' : 'Cập nhật ảnh nền',
      'Chọn nguồn ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chọn từ thư viện', onPress: () => pickImage(type) },
      ]
    );
  };

  const handleUpdateMovie = async () => {
    Keyboard.dismiss();
    console.log('Update Movie Clicked');
    
    if (!movieTitle || !genre || !duration || !releaseDate) {
      console.log('Validation failed: missing fields');
      useAlertStore.getState().showAlert('Thiếu thông tin', 'Vui lòng điền các trường bắt buộc', { type: 'warning' });
      return;
    }

    setIsLoading(true);
    console.log('Starting Update Movie API call...');
    try {
      // 1. Update text info
      await movieService.updateMovie(movie.id, {
        title: movieTitle,
        movieGenre: genre,
        director: director,
        movieActors: actors,
        duration: parseInt(duration),
        releaseDate: new Date(releaseDate.split('/').reverse().join('-')).toISOString(),
        description: description,
        ageRestriction,
        language,
      } as any);

      // 2. Upload images if changed (checking if URI is local)
      if (posterImage && !posterImage.startsWith('http')) {
        await movieService.uploadThumbnail(movie.id, posterImage);
      }
      if (backdropImage && !backdropImage.startsWith('http')) {
        await movieService.uploadBackdrop(movie.id, backdropImage);
      }

      useAlertStore.getState().showAlert('Thành công', 'Thông tin phim đã được cập nhật', {
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (error: any) {
      console.error('Error updating movie:', error);
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Không thể cập nhật phim', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8A7851" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chỉnh Sửa Phim</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Giao diện hiển thị (Preview)</Text>
            <View style={styles.previewContainer}>
              <TouchableOpacity style={styles.backdropPlaceholder} onPress={() => showImageOptions('backdrop')}>
                {backdropImage ? (
                  <Image source={{ uri: backdropImage }} style={styles.backdropImageFull} />
                ) : (
                  <View style={styles.emptyBackdrop}><Ionicons name="image-outline" size={40} color="#8A7851" /></View>
                )}
              </TouchableOpacity>
              <View style={styles.posterOverlayWrap}>
                <TouchableOpacity style={styles.posterPlaceholder} onPress={() => showImageOptions('poster')}>
                  {posterImage ? (
                    <Image source={{ uri: posterImage }} style={styles.posterImageOverlay} />
                  ) : (
                    <View style={styles.emptyPoster}><Ionicons name="add" size={24} color="#FFCC00" /></View>
                  )}
                </TouchableOpacity>
                <View style={styles.movieBasicInfo}>
                  <Text style={styles.previewTitle} numberOfLines={1}>{movieTitle || 'Tên phim'}</Text>
                  <Text style={styles.previewMetaText}>📅 {releaseDate}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Thông tin</Text>
            <TextInput style={styles.input} placeholder="Tên phim" value={movieTitle} onChangeText={setMovieTitle} />
            <TextInput style={styles.input} placeholder="Thể loại" value={genre} onChangeText={setGenre} />
            <TextInput style={styles.input} placeholder="Đạo diễn" value={director} onChangeText={setDirector} />
            <TextInput style={styles.input} placeholder="Diễn viên" value={actors} onChangeText={setActors} />
            <TextInput style={styles.input} placeholder="Thời lượng" keyboardType="numeric" value={duration} onChangeText={setDuration} />
            <TextInput style={styles.input} placeholder="Ngày chiếu (DD/MM/YYYY)" value={releaseDate} onChangeText={setReleaseDate} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Mô tả" multiline value={description} onChangeText={setDescription} />

            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateMovie} disabled={isLoading}>
              <Text style={styles.submitButtonText}>{isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF9E6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFCC00' },
  backButton: { padding: 4 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, elevation: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#8A7851', marginBottom: 12 },
  previewContainer: { height: 260, backgroundColor: '#1A1A2E', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  backdropPlaceholder: { width: '100%', height: 180, backgroundColor: '#2A2A40', justifyContent: 'center', alignItems: 'center' },
  backdropImageFull: { width: '100%', height: '100%', resizeMode: 'cover' },
  posterOverlayWrap: { flexDirection: 'row', paddingHorizontal: 20, marginTop: -60, alignItems: 'flex-end', gap: 16 },
  posterPlaceholder: { width: 100, height: 140, backgroundColor: '#333', borderRadius: 8, borderWidth: 2, borderColor: '#FFF', overflow: 'hidden' },
  posterImageOverlay: { width: '100%', height: '100%' },
  movieBasicInfo: { flex: 1, paddingBottom: 10 },
  previewTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  previewMetaText: { color: '#BBB', fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#FFE5B4', borderRadius: 12, padding: 12, marginBottom: 16, color: '#1A1A2E' },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#FFCC00', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitButtonText: { color: '#1A1A2E', fontWeight: '700', fontSize: 16 },
  emptyBackdrop: { alignItems: 'center' },
  emptyPoster: { justifyContent: 'center', alignItems: 'center', flex: 1 },
});

export default EditMovieScreen;
