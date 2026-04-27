import React, { useState } from 'react';
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
import { Video, ResizeMode } from 'expo-av';

import movieService from '../../services/movieService';
import useAlertStore from '../../store/useAlertStore';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMovie'>;

const AddMovieScreen: React.FC<Props> = ({ navigation }) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [actors, setActors] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('P');
  const [language, setLanguage] = useState('Tiếng Việt');
  
  // State cho ảnh và video
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [backdropImage, setBackdropImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm chọn ảnh từ thư viện
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

  // Hàm chụp ảnh mới
  const takePhoto = async (type: 'poster' | 'backdrop') => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền sử dụng camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'poster' ? [2, 3] : [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'poster') setPosterImage(result.assets[0].uri);
      else setBackdropImage(result.assets[0].uri);
    }
  };

  // Hàm chọn video trailer - Đã bỏ vì không có trong DB

  // Menu chọn ảnh
  const showImageOptions = (type: 'poster' | 'backdrop') => {
    if (Platform.OS === 'web') {
      // Trên Web, Alert.alert với nhiều nút không hỗ trợ tốt, mở trực tiếp thư viện ảnh
      pickImage(type);
      return;
    }
    Alert.alert(
      type === 'poster' ? 'Chọn ảnh poster' : 'Chọn ảnh nền (Backdrop)',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chụp ảnh mới', onPress: () => takePhoto(type) },
        { text: 'Chọn từ thư viện', onPress: () => pickImage(type) },
      ]
    );
  };

  const handleAddMovie = async () => {
    Keyboard.dismiss();
    console.log('Add Movie Clicked');
    
    if (!movieTitle || !genre || !director || !duration || !releaseDate || !description) {
      console.log('Validation failed: missing fields');
      useAlertStore.getState().showAlert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin bắt buộc', { type: 'warning' });
      return;
    }

    // Kiểm tra định dạng ngày DD/MM/YYYY
    const dateParts = releaseDate.split('/');
    if (dateParts.length !== 3) {
      useAlertStore.getState().showAlert('Định dạng sai', 'Ngày chiếu không đúng định dạng DD/MM/YYYY', { type: 'warning' });
      return;
    }

    setIsLoading(true);
    console.log('Starting Add Movie API call...');
    
    try {
      // 1. Tạo phim
      const newMovie = await movieService.createMovie({
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

      console.log('Created Movie:', newMovie);

      // 2. Upload poster nếu có
      if (posterImage && newMovie.id) {
        try {
          await movieService.uploadThumbnail(newMovie.id, posterImage);
        } catch (e) {
          console.error('Error uploading poster:', e);
        }
      }

      // 3. Upload backdrop nếu có
      if (backdropImage && newMovie.id) {
        try {
          await movieService.uploadBackdrop(newMovie.id, backdropImage);
        } catch (e) {
          console.error('Error uploading backdrop:', e);
        }
      }
      
      useAlertStore.getState().showAlert('Thành công', 'Phim đã được thêm thành công!', {
        type: 'success',
        buttons: [{ text: 'OK', onPress: () => navigation.goBack() }]
      });
    } catch (error: any) {
      console.error('Error adding movie:', error);
      useAlertStore.getState().showAlert('Lỗi', error.message || 'Không thể thêm phim', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const Content = (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#8A7851" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thêm Phim Mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          
          {/* Preview Layout - Giao diện chi tiết phim */}
          <Text style={styles.sectionTitle}>Giao diện hiển thị (Preview)</Text>
          <View style={styles.previewContainer}>
            {/* Backdrop */}
            <TouchableOpacity 
              style={styles.backdropPlaceholder} 
              onPress={() => showImageOptions('backdrop')}
              activeOpacity={0.9}
            >
              {backdropImage ? (
                <Image source={{ uri: backdropImage }} style={styles.backdropImageFull} />
              ) : (
                <View style={styles.emptyBackdrop}>
                  <Ionicons name="image-outline" size={40} color="#8A7851" />
                  <Text style={styles.emptyText}>Thêm ảnh nền (16:9)</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Poster Overlay */}
            <View style={styles.posterOverlayWrap}>
              <TouchableOpacity 
                style={styles.posterPlaceholder} 
                onPress={() => showImageOptions('poster')}
                activeOpacity={0.9}
              >
                {posterImage ? (
                  <Image source={{ uri: posterImage }} style={styles.posterImageOverlay} />
                ) : (
                  <View style={styles.emptyPoster}>
                    <Ionicons name="add" size={24} color="#FFCC00" />
                    <Text style={styles.emptyPosterText}>Poster</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.movieBasicInfo}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {movieTitle || 'Tên phim'}
                </Text>
                <View style={styles.previewMeta}>
                  <Text style={styles.previewMetaText}>📅 {releaseDate || 'Ngày chiếu'}</Text>
                  <Text style={styles.previewMetaText}> ⏱️ {duration || '0'} phút</Text>
                </View>
                <View style={styles.previewReaction}>
                   <Ionicons name="heart" size={16} color="#FF6B6B" />
                   <Text style={styles.previewReactionText}> 0</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          {/* Movie Title */}
          <View style={styles.inputWrapper}>
            <Ionicons name="film-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Tên phim *"
              placeholderTextColor="#BDBDBD"
              value={movieTitle}
              onChangeText={setMovieTitle}
            />
          </View>

          {/* Genre */}
          <View style={styles.inputWrapper}>
            <Ionicons name="pricetag-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Thể loại * (VD: Hành động, Tình cảm, Hài...)"
              placeholderTextColor="#BDBDBD"
              value={genre}
              onChangeText={setGenre}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Đạo diễn *"
              placeholderTextColor="#BDBDBD"
              value={director}
              onChangeText={setDirector}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Diễn viên (cách nhau bởi dấu phẩy)"
              placeholderTextColor="#BDBDBD"
              value={actors}
              onChangeText={setActors}
            />
          </View>

          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>

          {/* Duration */}
          <View style={styles.inputWrapper}>
            <Ionicons name="time-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Thời lượng (phút) *"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          {/* Release Date */}
          <View style={styles.inputWrapper}>
            <Ionicons name="calendar-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ngày phát hành * (DD/MM/YYYY)"
              placeholderTextColor="#BDBDBD"
              value={releaseDate}
              onChangeText={setReleaseDate}
            />
          </View>

          {/* Age Restriction */}
          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Giới hạn độ tuổi (VD: P, T13, T16, T18)"
              placeholderTextColor="#BDBDBD"
              value={ageRestriction}
              onChangeText={setAgeRestriction}
            />
          </View>

          {/* Language */}
          <View style={styles.inputWrapper}>
            <Ionicons name="language-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Ngôn ngữ (VD: Tiếng Việt, Phụ đề...)"
              placeholderTextColor="#BDBDBD"
              value={language}
              onChangeText={setLanguage}
            />
          </View>

          {/* Description */}
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons name="document-text-outline" size={20} color="#FFCC00" style={[styles.inputIcon, styles.textAreaIcon]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả phim *"
              placeholderTextColor="#BDBDBD"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleAddMovie}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.submitButtonText}>Đang xử lý...</Text>
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#1A1A2E" />
                <Text style={styles.submitButtonText}>Thêm Phim</Text>
              </>
            )}
          </TouchableOpacity>
          
          {/* Extra padding for keyboard */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{Content}</View>;
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      {Content}
    </TouchableWithoutFeedback>
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
    padding: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8A7851',
    marginBottom: 12,
    marginTop: 8,
  },
  imageUploadContainer: { marginBottom: 20 },
  previewContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    height: 260,
  },
  backdropPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#2A2A40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropImageFull: { width: '100%', height: '180%', resizeMode: 'cover' },
  emptyBackdrop: { alignItems: 'center' },
  emptyText: { color: '#8A7851', marginTop: 8, fontSize: 12 },
  
  posterOverlayWrap: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -60,
    alignItems: 'flex-end',
    gap: 16,
  },
  posterPlaceholder: {
    width: 100,
    height: 140,
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterImageOverlay: { width: '100%', height: '100%', resizeMode: 'cover' },
  emptyPoster: { alignItems: 'center' },
  emptyPosterText: { color: '#FFCC00', fontSize: 10, fontWeight: '700' },

  movieBasicInfo: { flex: 1, paddingBottom: 10 },
  previewTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  previewMeta: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  previewMetaText: { color: '#BBB', fontSize: 12 },
  previewReaction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewReactionText: { color: '#FF6B6B', fontSize: 14, fontWeight: '700' },

  posterImage: { width: '100%', height: 300, borderRadius: 12, resizeMode: 'cover' },
  backdropImage: { width: '100%', height: 180, borderRadius: 12, resizeMode: 'cover' },
  trailerVideo: { width: '100%', height: 200, borderRadius: 12 },
  imagePreviewContainer: { position: 'relative', width: '100%', height: 300 },
  backdropPreviewContainer: { position: 'relative', width: '100%', height: 180 },
  videoPreviewContainer: { position: 'relative', width: '100%', height: 200 },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    zIndex: 10,
  },
  uploadPlaceholder: {
    borderWidth: 2,
    borderColor: '#FFE5B4',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
  },
  uploadText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8A7851',
    fontWeight: '600',
  },
  uploadSubText: {
    marginTop: 4,
    fontSize: 12,
    color: '#BDBDBD',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE5B4',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#FFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1A1A2E',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textAreaIcon: {
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FFCC00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddMovieScreen;