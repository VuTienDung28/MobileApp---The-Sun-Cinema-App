import useAuthStore from "../../store/useAuthStore"
import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { calculateDistance } from "../../utils/locationUtils"

const formatDistance = (dist: number) => {
  if (dist < 1) {
    return `${Math.round(dist * 1000)}m`
  }
  return `${dist.toFixed(1).replace(".", ",")}km`
}

export default function TheaterScreen({ navigation }: any) {
  const [expandedArea, setExpandedArea] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [cinemas, setCinemas] = useState<any[]>([])
  const [suggestedCinemas, setSuggestedCinemas] = useState<any[]>([])
  const [hasLocationPermission, setHasLocationPermission] = useState<
    boolean | null
  >(null)

  React.useEffect(() => {
    const fetchCinemasAndLocation = async () => {
      try {
        // Fetch cinemas from backend
        const module = await import("../../services/theaterService")
        let fetchedCinemas = await module.default.getAllTheaters()

        // Request location permission
        let { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== "granted") {
          setHasLocationPermission(false)
          setCinemas(fetchedCinemas) // Use default order
          return
        }

        setHasLocationPermission(true)
        let location = await Location.getCurrentPositionAsync({})
        const userLat = location.coords.latitude
        const userLon = location.coords.longitude

        // Calculate distance for each cinema
        fetchedCinemas = fetchedCinemas.map((cinema: any) => {
          if (cinema.latitude && cinema.longitude) {
            const distance = calculateDistance(
              userLat,
              userLon,
              cinema.latitude,
              cinema.longitude,
            )
            return { ...cinema, distance }
          }
          return { ...cinema, distance: Infinity }
        })

        // Sort by distance
        fetchedCinemas.sort((a: any, b: any) => a.distance - b.distance)

        setSuggestedCinemas(fetchedCinemas.slice(0, 5))
        setCinemas(fetchedCinemas)
      } catch (error) {
        console.log(error)
      }
    }

    fetchCinemasAndLocation()
  }, [])

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.navigate("UserHome")
    }
  }

  const goToShowtime = (cinema: any) => {
    navigation.navigate("TheaterShowtime", {
      cinemaName: cinema.name,
      cinemaId: cinema.id,
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name='arrow-back' size={28} color='#D69A00' />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chọn Rạp</Text>

        <View style={styles.rightHeader}>
          {hasLocationPermission && (
            <TouchableOpacity style={styles.locationButton}>
              <Ionicons name='navigate-outline' size={26} color='#D69A00' />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          >
            <Ionicons name='menu' size={32} color='#D69A00' />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {hasLocationPermission && suggestedCinemas.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>GỢI Ý GẦN BẠN</Text>
            </View>

            <View style={styles.listBox}>
              {suggestedCinemas.map((cinema, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.itemRow}
                  onPress={() => goToShowtime(cinema)}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemText} numberOfLines={1}>
                      {cinema.name.startsWith("The Sun ") ? (
                        <>
                          <Text style={styles.brandText}>The Sun </Text>
                          {cinema.name.substring(8)}
                        </>
                      ) : cinema.name.startsWith("CGV ") ? (
                        <>
                          <Text style={styles.brandText}>CGV </Text>
                          {cinema.name.substring(4)}
                        </>
                      ) : (
                        cinema.name
                      )}
                    </Text>
                  </View>
                  {cinema.distance !== Infinity && (
                    <Text style={styles.distanceText}>
                      {formatDistance(cinema.distance)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* MOCK DATA
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>CHỌN KHU VỰC</Text>
                </View>

                <View style={styles.listBox}>
                    {areas.map((area, index) => {
                        const isOpen = expandedArea === area.name;

                        return (
                            <View key={index}>
                                <TouchableOpacity
                                    style={styles.areaRow}
                                    onPress={() =>
                                        setExpandedArea(isOpen ? null : area.name)
                                    }
                                >
                                    <Text style={styles.areaText}>{area.name}</Text>

                                    <View style={styles.areaRight}>
                                        <Text style={styles.totalText}>{area.total}</Text>

                                        <Ionicons
                                            name={isOpen ? "chevron-up" : "chevron-down"}
                                            size={24}
                                            color="#CFC8C1"
                                        />
                                    </View>
                                </TouchableOpacity>

                                {isOpen &&
                                    area.cinemas.map((cinema, cinemaIndex) => (
                                        <TouchableOpacity
                                            key={cinemaIndex}
                                            style={styles.cinemaChildRow}
                                            onPress={() => goToShowtime(cinema)}
                                        >
                                            <Text style={styles.cinemaChildText}>
                                                {cinema}
                                            </Text>

                                            <Ionicons
                                                name="chevron-forward"
                                                size={22}
                                                color="#D69A00"
                                            />
                                        </TouchableOpacity>
                                    ))}
                            </View>
                        );
                    })}
                </View>
                */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TẤT CẢ RẠP</Text>
        </View>

        <View style={styles.listBox}>
          {cinemas.map((cinema, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemRow}
              onPress={() => goToShowtime(cinema)}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemText} numberOfLines={1}>
                  {cinema.name.startsWith("The Sun ") ? (
                    <>
                      <Text style={styles.brandText}>The Sun </Text>
                      {cinema.name.substring(8)}
                    </>
                  ) : cinema.name.startsWith("CGV ") ? (
                    <>
                      <Text style={styles.brandText}>CGV </Text>
                      {cinema.name.substring(4)}
                    </>
                  ) : (
                    cinema.name
                  )}
                </Text>
              </View>
              {hasLocationPermission &&
                cinema.distance &&
                cinema.distance !== Infinity && (
                  <Text style={styles.distanceText}>
                    {formatDistance(cinema.distance)}
                  </Text>
                )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <SideMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  )
}

function SideMenu({ visible, onClose, navigation }: any) {
  const fullName = useAuthStore((state) => state.fullName)

  const go = (screen: string) => {
    onClose()
    navigation.navigate(screen)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View style={styles.modalWrap}>
        <TouchableOpacity
          style={styles.leftBlank}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sideMenu}>
          <TouchableOpacity style={styles.menuClose} onPress={onClose}>
            <Ionicons name='menu' size={36} color='#e3962b' />
          </TouchableOpacity>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👨‍🍳</Text>
          </View>

          <Text style={styles.userName}>{fullName || "Người dùng"}</Text>

          <Text style={styles.memberRole}>Thành viên</Text>

          <TouchableOpacity
            style={styles.bigLink}
            onPress={() => go("MovieList")}
          >
            <Text style={styles.bigLinkText}>Đặt vé theo Phim</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bigLink}
            onPress={() => go("Theater")}
          >
            <Text style={styles.bigLinkText}>Đặt vé theo Rạp</Text>
          </TouchableOpacity>

          <View style={styles.grid}>
            <MenuIcon
              icon='home-outline'
              text='Trang chủ'
              onPress={() => go("UserHome")}
            />

            <MenuIcon
              icon='person-outline'
              text='Thành viên'
              onPress={() => go("Profile")}
            />

            <MenuIcon
              icon='information-circle-outline'
              text='Rạp'
              onPress={() => go("Theater")}
            />

            <MenuIcon
              icon='gift-outline'
              text='Tin mới & Ưu đãi'
              onPress={() => go("Promotion")}
            />

            <MenuIcon
              icon='ticket-outline'
              text='Vé của tôi'
              onPress={() => go("MyTickets")}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

function MenuIcon({ icon, text, onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuIcon} onPress={onPress}>
      <Ionicons name={icon} size={34} color='#FFF' />
      <Text style={styles.menuIconText}>{text}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4EE",
  },

  header: {
    height: 76,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    elevation: 2,
  },

  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    marginLeft: 18,
    fontSize: 23,
    fontWeight: "800",
    color: "#000000",
  },

  rightHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
  },

  menuButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  sectionHeader: {
    height: 72,
    backgroundColor: "#E9E4D6",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    color: "#9B8B7A",
    fontWeight: "500",
  },

  listBox: {
    backgroundColor: "#FFF",
  },

  itemRow: {
    minHeight: 78,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE9E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  brandText: {
    fontSize: 22,
    color: "#D69A00",
    fontWeight: "700",
  },

  itemText: {
    fontSize: 22,
    color: "#463A32",
    fontWeight: "500",
    flexShrink: 1,
  },

  distanceText: {
    fontSize: 18,
    color: "#D69A00",
    fontWeight: "600",
    marginLeft: 12,
  },

  areaRow: {
    height: 82,
    borderBottomWidth: 1,
    borderBottomColor: "#EFE9E1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },

  areaText: {
    fontSize: 22,
    color: "#463A32",
  },

  areaRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  totalText: {
    fontSize: 20,
    color: "#8F8174",
    marginRight: 10,
  },

  cinemaChildRow: {
    height: 62,
    backgroundColor: "#FFFDF8",
    borderBottomWidth: 1,
    borderBottomColor: "#EFE9E1",
    paddingLeft: 44,
    paddingRight: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  cinemaChildText: {
    flex: 1,
    fontSize: 18,
    color: "#463A32",
    fontWeight: "600",
  },

  modalWrap: {
    flex: 1,
    flexDirection: "row",
  },

  leftBlank: {
    width: 85,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  sideMenu: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    paddingHorizontal: 22,
    paddingTop: 35,
  },

  menuClose: {
    marginBottom: 8,
  },

  avatar: {
    alignSelf: "center",
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: "#ebec95",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 58,
  },

  userName: {
    marginTop: 14,
    textAlign: "center",
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
  },

  memberRole: {
    textAlign: "center",
    color: "#edeac9",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 20,
  },

  bigLink: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 16,
    alignItems: "center",
  },

  bigLinkText: {
    color: "#FFF",
    fontSize: 22,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 18,
  },

  menuIcon: {
    width: "33.33%",
    alignItems: "center",
    marginBottom: 24,
  },

  menuIconText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
})
