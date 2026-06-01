import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import movieService, { MovieListItem } from "../../services/movieService";
import useAuthStore from "../../store/useAuthStore";
import { getImageUrl } from "../../utils/imageUtils";
import AppSideMenu from "../../components/AppSideMenu";

const { width } = Dimensions.get("window");

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h > 0 && m > 0) return `${h} giờ ${m} phút`;
  if (h > 0) return `${h} giờ`;

  return `${m} phút`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Sắp chiếu";

  const date = new Date(dateString);

  return `${date.getDate()} Thg ${
    date.getMonth() + 1
  }, ${date.getFullYear()}`;
};

export default function UserHomeScreen() {
  const navigation = useNavigation<any>();
  const avatarUrl = useAuthStore((state) => state.avatarUrl);

  const [activeTab, setActiveTab] = useState("Đang chiếu");
  const [activeIndex, setActiveIndex] = useState(0);
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const fetchMovies = async (tab: string) => {
    setIsLoading(true);

    try {
      let data: MovieListItem[] = [];

      if (tab === "Đang chiếu") {
        data = await movieService.getNowShowing();
      } else {
        data = await movieService.getComingSoon();
      }

      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMovies(activeTab);
  }, [activeTab]);

  const activeMovie = movies[activeIndex];

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setActiveIndex(0);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => navigation.navigate("Profile")}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: getImageUrl(avatarUrl) }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Ionicons name="person" size={24} color="#FFB800" />
            )}
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <Text style={styles.sun}>☀️</Text>
            <Text style={styles.logo}>THE SUN</Text>
          </View>

          <TouchableOpacity onPress={() => setShowMenu(true)}>
            <Ionicons name="menu" size={36} color="#4A2C13" />
          </TouchableOpacity>
        </View>

        {/* BANNER */}
        {/* BANNER */}
        {/* BANNER */}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => navigation.navigate("Promotion")}
          style={styles.bannerContainer}
        >
          <Image
            source={require("../../../assets/banners/home-banner.png")}
            style={styles.bannerFull}
            contentFit="cover"
          />
        </TouchableOpacity>
        {/* TABS */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Đang chiếu" && styles.activeTab,
            ]}
            onPress={() => changeTab("Đang chiếu")}
          >
            <Ionicons
              name="film-outline"
              size={18}
              color={activeTab === "Đang chiếu" ? "#fff" : "#4A2C13"}
            />

            <Text
              style={
                activeTab === "Đang chiếu"
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              Đang chiếu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Sắp chiếu" && styles.activeTab,
            ]}
            onPress={() => changeTab("Sắp chiếu")}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeTab === "Sắp chiếu" ? "#fff" : "#4A2C13"}
            />

            <Text
              style={
                activeTab === "Sắp chiếu"
                  ? styles.activeTabText
                  : styles.tabText
              }
            >
              Sắp chiếu
            </Text>
          </TouchableOpacity>
        </View>

        {/* MOVIES */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FFB800" />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.72}
            decelerationRate="fast"
            contentContainerStyle={styles.movieRow}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (width * 0.72)
              );

              setActiveIndex(index);
            }}
          >
            {movies.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[
                  styles.movieCard,
                  activeIndex === index && styles.movieCardActive,
                ]}
                onPress={() => {
                  if (activeIndex === index) {
                    navigation.navigate("MovieDetail", {
                      movieId: item.id,
                    });
                  } else {
                    setActiveIndex(index);
                  }
                }}
              >
                <Image
                  source={{
                    uri: getImageUrl(item.thumbnailPosterUrl),
                  }}
                  style={styles.poster}
                  contentFit="cover"
                />

                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.posterOverlay}
                >
                  <Text numberOfLines={1} style={styles.posterTitle}>
                    {item.title}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* MOVIE INFO */}
        {activeMovie && (
          <View style={styles.infoBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.movieTitle}>
                {activeMovie.title}
              </Text>

              <View style={styles.metaRow}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color="#6B4B2A"
                />

                <Text style={styles.meta}>
                  {formatDuration(activeMovie.duration)}
                </Text>

                <Text style={styles.divide}>|</Text>

                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color="#6B4B2A"
                />

                <Text style={styles.meta}>
                  {formatDate(activeMovie.releaseDate)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() =>
                navigation.navigate("MovieDetail", {
                  movieId: activeMovie.id,
                })
              }
            >
              <Text style={styles.bookBtnText}>Đặt Vé</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* SUPPORT */}
        <TouchableOpacity style={styles.supportBox}>
          <View style={styles.supportIcon}>
            <Text style={{ fontSize: 30 }}>🌻</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>
              Bạn cần hỗ trợ gì?
            </Text>

            <Text style={styles.supportDesc}>
              The Sun luôn sẵn sàng hỗ trợ bạn mọi lúc.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={24}
            color="#4A2C13"
          />
        </TouchableOpacity>
      </ScrollView>

      <AppSideMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF8E7",
  },

  header: {
    paddingTop: 58,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 4,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  logoBox: {
    alignItems: "center",
  },

  sun: {
    fontSize: 34,
  },

  logo: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFB800",
    letterSpacing: 1,
  },

  bannerContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    height: 180,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
  },

  bannerFull: {
    width: "100%",
    height: "100%",
  },

  tabsContainer: {
    marginHorizontal: 20,
    marginTop: 34,
    backgroundColor: "#F7EFD7",
    borderRadius: 24,
    padding: 6,
    flexDirection: "row",
  },

  tab: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },

  activeTab: {
    backgroundColor: "#FFB800",
  },

  tabText: {
    color: "#4A2C13",
    fontWeight: "800",
    fontSize: 15,
  },

  activeTabText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },

  loadingBox: {
    height: 340,
    justifyContent: "center",
  },

  movieRow: {
    paddingLeft: 24,
    paddingRight: 12,
    paddingTop: 36,
  },

  movieCard: {
    width: width * 0.66,
    height: 390,
    marginRight: 24,
    borderRadius: 32,
    overflow: "hidden",
    opacity: 0.55,
    transform: [{ scale: 0.92 }],
  },

  movieCardActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },

  poster: {
    width: "100%",
    height: "100%",
  },

  posterOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    justifyContent: "flex-end",
    height: 120,
  },

  posterTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 22,
  },

  infoBox: {
    marginHorizontal: 22,
    marginTop: 22,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
  },

  movieTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2D1B0F",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },

  meta: {
    color: "#6B4B2A",
    fontWeight: "600",
  },

  divide: {
    marginHorizontal: 4,
    color: "#6B4B2A",
  },

  bookBtn: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 26,
    marginLeft: 14,
  },

  bookBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  supportBox: {
    marginHorizontal: 22,
    marginTop: 24,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    elevation: 5,
  },

  supportIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFF4CF",
    justifyContent: "center",
    alignItems: "center",
  },

  supportTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2D1B0F",
  },

  supportDesc: {
    marginTop: 4,
    color: "#6B4B2A",
    lineHeight: 20,
  },
});