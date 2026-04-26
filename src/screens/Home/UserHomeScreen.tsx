import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const nowShowingMovies = [
  {
    id: 1,
    title: "MƯA ĐỎ",
    image: require("../../../assets/movies/muado.jpg"),
    time: "2 giờ",
    date: "22 Thg 8, 2025",
  },
  {
    id: 2,
    title: "PHI PHỔNG: QUỶ MẶT TRỜI",
    image: require("../../../assets/movies/phiphong.jpg"),
    time: "2 giờ",
    date: "30 Thg 4, 2026",
  },
  {
    id: 3,
    title: "TÀI",
    image: require("../../../assets/movies/tai.jpg"),
    time: "1 giờ 50 phút",
    date: "Mùa xuân 2026",
  },
];

const specialMovies = [
  {
    id: 1,
    title: "PHIM ĐẶC BIỆT",
    image: require("../../../assets/movies/phiphong.jpg"),
    time: "2 giờ",
    date: "Suất chiếu đặc biệt",
  },
  {
    id: 2,
    title: "TÀI",
    image: require("../../../assets/movies/tai.jpg"),
    time: "1 giờ 50 phút",
    date: "Vé ưu đãi",
  },
];

const comingSoonMovies = [
  {
    id: 1,
    title: "TÀI",
    image: require("../../../assets/movies/tai.jpg"),
    time: "1 giờ 50 phút",
    date: "Mùa xuân 2026",
  },
  {
    id: 2,
    title: "MƯA ĐỎ",
    image: require("../../../assets/movies/muado.jpg"),
    time: "2 giờ",
    date: "Sắp chiếu",
  },
];

export default function UserHomeScreen() {
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState("Đang chiếu");
  const [activeIndex, setActiveIndex] = useState(0);

  const movies =
    activeTab === "Đang chiếu"
      ? nowShowingMovies
      : activeTab === "Đặc biệt"
        ? specialMovies
        : comingSoonMovies;

  const activeMovie = movies[activeIndex] || movies[0];

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setActiveIndex(0);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.avatar}
              activeOpacity={0.7}
              onPress={() => navigation.navigate("Profile")}
            >
              <Ionicons name="person" size={24} color="#FFB800" />
            </TouchableOpacity>

            <View style={styles.logoBox}>
              <Text style={styles.sun}>☀️</Text>
              <Text style={styles.logo}>THE SUN</Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Home")}
              >
                <Ionicons name="home-outline" size={27} color="#4A2C13" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate("Menu")}
              >
                <Feather name="menu" size={30} color="#4A2C13" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerSmall}>Ưu đãi</Text>
              <Text style={styles.bannerBig}>VÉ XEM PHIM</Text>
              <Text style={styles.bannerToday}>HÔM NAY</Text>

              <Text style={styles.bannerDesc}>
                Nhiều phim hay - Ưu đãi mỗi ngày
              </Text>

              <TouchableOpacity style={styles.bannerBtn}>
                <Text style={styles.bannerBtnText}>XEM NGAY ›</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bannerEmoji}>🍿🎟️</Text>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "Đang chiếu" && styles.tabActive]}
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
                    ? styles.tabActiveText
                    : styles.tabText
                }
              >
                Đang chiếu
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "Đặc biệt" && styles.tabActive]}
              onPress={() => changeTab("Đặc biệt")}
            >
              <Ionicons
                name="star-outline"
                size={18}
                color={activeTab === "Đặc biệt" ? "#fff" : "#4A2C13"}
              />
              <Text
                style={
                  activeTab === "Đặc biệt"
                    ? styles.tabActiveText
                    : styles.tabText
                }
              >
                Đặc biệt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "Sắp chiếu" && styles.tabActive]}
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
                    ? styles.tabActiveText
                    : styles.tabText
                }
              >
                Sắp chiếu
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.62}
            decelerationRate="fast"
            contentContainerStyle={styles.movieRow}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / (width * 0.62)
              );

              setActiveIndex(Math.max(0, Math.min(index, movies.length - 1)));
            }}
          >
            {movies.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={`${activeTab}-${item.id}`}
                style={[
                  styles.movieCard,
                  activeIndex === index && styles.movieCardActive,
                ]}
                onPress={() => setActiveIndex(index)}
              >
                <Image source={item.image} style={styles.poster} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.infoBox}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.movieTitle}>
                {activeMovie.title}
              </Text>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={18} color="#4A2C13" />
                <Text style={styles.meta}>{activeMovie.time}</Text>

                <Text style={styles.divide}>|</Text>

                <Ionicons name="calendar-outline" size={18} color="#4A2C13" />
                <Text numberOfLines={1} style={styles.meta}>
                  {activeMovie.date}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.bookBtn}>
              <Text style={styles.bookText}>Đặt Vé</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.supportBox}>
            <Text style={styles.supportEmoji}>🌻</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.supportTitle}>Bạn cần hỗ trợ gì?</Text>
              <Text style={styles.supportDesc}>
                The Sun luôn sẵn sàng hỗ trợ bạn!
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={28} color="#4A2C13" />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#FFF4CF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF4CF",
  },

  header: {
    paddingTop: 48,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  logoBox: {
    alignItems: "center",
  },

  sun: {
    fontSize: 34,
  },

  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFB800",
  },

  headerRight: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  banner: {
    marginHorizontal: 22,
    marginTop: 22,
    padding: 22,
    borderRadius: 26,
    backgroundColor: "#FFD96D",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 190,
  },

  bannerSmall: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4A2C13",
    fontStyle: "italic",
  },

  bannerBig: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    marginTop: 6,
  },

  bannerToday: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4A2C13",
    marginTop: 4,
  },

  bannerDesc: {
    marginTop: 10,
    fontSize: 14,
    color: "#4A2C13",
    width: 190,
  },

  bannerBtn: {
    marginTop: 16,
    backgroundColor: "#FFB800",
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 24,
  },

  bannerBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },

  bannerEmoji: {
    fontSize: 56,
    alignSelf: "center",
    marginLeft: 10,
  },

  tabs: {
    marginHorizontal: 20,
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  tab: {
    backgroundColor: "#fff",
    paddingHorizontal: 22,
    height: 56,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  tabActive: {
    backgroundColor: "#FFB800",
  },

  tabText: {
    color: "#4A2C13",
    fontWeight: "800",
    fontSize: 15,
  },

  tabActiveText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },

  movieRow: {
    paddingHorizontal: width * 0.18,
    paddingTop: 34,
  },

  movieCard: {
    width: width * 0.56,
    height: 340,
    marginRight: 24,
    opacity: 0.55,
    transform: [{ scale: 0.88 }],
  },

  movieCardActive: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },

  poster: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    resizeMode: "cover",
  },

  infoBox: {
    marginHorizontal: 26,
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  movieTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#4A2C13",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },

  meta: {
    color: "#4A2C13",
  },

  divide: {
    marginHorizontal: 4,
  },

  bookBtn: {
    backgroundColor: "#FFB800",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 24,
    marginLeft: 10,
  },

  bookText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  supportBox: {
    marginHorizontal: 26,
    marginTop: 22,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  supportEmoji: {
    fontSize: 42,
  },

  supportTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4A2C13",
  },

  supportDesc: {
    marginTop: 4,
    color: "#4A2C13",
  },
});