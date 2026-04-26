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
  TouchableWithoutFeedback,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMovie'>;

const AddMovieScreen: React.FC<Props> = ({ navigation }) => {
  const [movieTitle, setMovieTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [duration, setDuration] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  // State cho ảnh và video
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [trailerVideo, setTrailerVideo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPosterImage(result.assets[0].uri);
    }
  };

  // Hàm chụp ảnh mới
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền sử dụng camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPosterImage(result.assets[0].uri);
    }
  };

  // Hàm chọn video trailer
  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setTrailerVideo(result.assets[0].uri);
    }
  };

  // Hàm xóa ảnh
  const removeImage = () => {
    setPosterImage(null);
  };

  // Hàm xóa video
  const removeVideo = () => {
    setTrailerVideo(null);
  };

  // Menu chọn ảnh
  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh poster',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chụp ảnh mới', onPress: takePhoto },
        { text: 'Chọn từ thư viện', onPress: pickImage },
      ]
    );
  };

  const handleAddMovie = async () => {
    Keyboard.dismiss();
    
    if (!movieTitle || !genre || !director || !duration || !releaseDate || !price) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newMovie = {
        id: Date.now().toString(),
        title: movieTitle,
        genre: genre,
        director: director,
        duration: parseInt(duration),
        releaseDate: releaseDate,
        description: description,
        price: parseInt(price),
        posterUrl: posterImage,
        trailerUrl: trailerVideo,
        ticketsSold: 0,
        revenue: 0,
        trend: 'up',
      };
      
      console.log('New Movie:', newMovie);
      
      Alert.alert(
        'Thành công',
        'Phim đã được thêm thành công!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
      setIsLoading(false);
    }, 1500);
  };

  const Content = (
    <SafeAreaView style={styles.container}>
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
          
          {/* Phần thêm ảnh poster */}
          <Text style={styles.sectionTitle}>Ảnh Poster</Text>
          <TouchableOpacity 
            style={styles.imageUploadContainer} 
            onPress={showImageOptions}
          >
            {posterImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: posterImage }} style={styles.posterImage} />
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={removeImage}
                >
                  <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="cloud-upload-outline" size={50} color="#FFCC00" />
                <Text style={styles.uploadText}>Chạm để thêm ảnh poster</Text>
                <Text style={styles.uploadSubText}>Hỗ trợ JPG, PNG, JPEG</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Phần thêm trailer */}
          <Text style={styles.sectionTitle}>Trailer Phim</Text>
          <TouchableOpacity 
            style={styles.videoUploadContainer} 
            onPress={pickVideo}
          >
            {trailerVideo ? (
              <View style={styles.videoPreviewContainer}>
                <Video
                  source={{ uri: trailerVideo }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  isLooping={false}
                  useNativeControls
                  style={styles.trailerVideo}
                />
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={removeVideo}
                >
                  <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="videocam-outline" size={50} color="#FFCC00" />
                <Text style={styles.uploadText}>Chạm để thêm trailer</Text>
                <Text style={styles.uploadSubText}>Hỗ trợ MP4, MOV, AVI</Text>
              </View>
            )}
          </TouchableOpacity>

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

          {/* Director */}
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

          {/* Price */}
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color="#FFCC00" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Giá vé * (VND)"
              placeholderTextColor="#BDBDBD"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Description */}
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <Ionicons name="document-text-outline" size={20} color="#FFCC00" style={[styles.inputIcon, styles.textAreaIcon]} />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Mô tả phim"
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
        </View>
      </ScrollView>
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
  imageUploadContainer: {
    marginBottom: 20,
  },
  videoUploadContainer: {
    marginBottom: 20,
  },
  posterImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  trailerVideo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  videoPreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
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