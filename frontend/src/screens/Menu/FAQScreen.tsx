import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAuthStore from "../../store/useAuthStore";

function FAQItem({
    question,
    answer,
}: {
    question: string;
    answer: string;
}) {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.faqItem}>
            <TouchableOpacity
                style={styles.questionBox}
                onPress={() => setOpen(!open)}
            >
                <Text style={styles.question}>{question}</Text>

                <Ionicons
                    name={open ? "chevron-up" : "chevron-down"}
                    size={28}
                    color="#B8B0A5"
                />
            </TouchableOpacity>

            {open && (
                <View style={styles.answerBox}>
                    <Text style={styles.answer}>{answer}</Text>
                </View>
            )}
        </View>
    );
}

function MenuIcon({ icon, text, onPress }: any) {
    return (
        <TouchableOpacity style={styles.menuIcon} onPress={onPress}>
            <Ionicons name={icon} size={34} color="#FFF" />
            <Text style={styles.menuIconText}>{text}</Text>
        </TouchableOpacity>
    );
}

export default function FAQScreen({ navigation }: any) {
    const [activeTab, setActiveTab] = useState("Phim");
    const [showMenu, setShowMenu] = useState(false);
    const { fullName } = useAuthStore();

    const go = (screen: string) => {
        setShowMenu(false);
        navigation.navigate(screen);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={34} color="#A51D2D" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Hỏi đáp</Text>

                <TouchableOpacity onPress={() => setShowMenu(true)}>
                    <Ionicons name="menu" size={38} color="#A51D2D" />
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabContainer}
            >
                <TouchableOpacity onPress={() => setActiveTab("Phim")}>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Phim" && styles.activeTab,
                        ]}
                    >
                        Phim
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveTab("Bắp nước")}>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Bắp nước" && styles.activeTab,
                        ]}
                    >
                        Bắp nước & Thức ăn tại rạp
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setActiveTab("Voucher")}>
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "Voucher" && styles.activeTab,
                        ]}
                    >
                        Voucher
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === "Phim" && (
                    <>
                        <FAQItem
                            question="Phân loại phim P, K, T13, T16, T18 là gì?"
                            answer={`P: Phim phổ biến đến mọi lứa tuổi.

K: Phim dành cho trẻ dưới 13 tuổi có người bảo hộ đi cùng.

T13: Phim dành cho khán giả từ 13 tuổi trở lên.

T16: Phim dành cho khán giả từ 16 tuổi trở lên.

T18: Phim dành cho khán giả từ 18 tuổi trở lên.`}
                        />

                        <FAQItem
                            question="Làm sao để phân biệt phim dành cho mọi lứa tuổi?"
                            answer="Biểu tượng P là phim dành cho mọi lứa tuổi. T13/T16/T18 là giới hạn độ tuổi."
                        />

                        <FAQItem
                            question="Suất Chiếu Đặc Biệt là gì?"
                            answer="Suất Chiếu Đặc Biệt là những suất chiếu được ra rạp trước ngày công chiếu chính thức."
                        />

                        <FAQItem
                            question="Khởi Chiếu Sớm là gì?"
                            answer="Khởi Chiếu Sớm là bộ phim được chính thức ra rạp trước ngày khởi chiếu đã định."
                        />
                    </>
                )}

                {activeTab === "Bắp nước" && (
                    <>
                        <FAQItem
                            question="Thức ăn, đồ uống mua bên ngoài có được mang vào rạp CGV không?"
                            answer={`Nhằm mục đích bảo vệ trải nghiệm của khách hàng và bảo đảm vệ sinh an toàn thực phẩm, quý khách vui lòng chỉ sử dụng đồ ăn thức uống mua tại rạp trong phạm vi khu vực hoạt động của rạp bao gồm sảnh và phòng chiếu.

Ngoài ra, bạn cũng không được hút thuốc, dùng kẹo cao su, không quay phim, chụp hình, không nghe-gọi điện thoại, không nói chuyện trong rạp chiếu phim.`}
                        />

                        <FAQItem
                            question="Có bao nhiêu vị bắp tại CGV?"
                            answer="Có 3 loại: Ngọt, phô mai và caramel. Bạn có thể thưởng thức vị ngọt, phô mai, caramel hoặc mix hai vị tùy chọn."
                        />

                        <FAQItem
                            question="Tôi có thể mua bắp nước trực tuyến được không?"
                            answer={`Được. Bạn có thể mua combo bắp nước trực tuyến và nhận sản phẩm tại rạp vào ngày xem phim.

Ngoài ra, rạp đã có chức năng mua bắp nước không cần mua vé tại cửa hàng.`}
                        />

                        <FAQItem
                            question="Có bao nhiêu loại kích cỡ bắp và nước?"
                            answer={`Tại rạp các bạn có rất nhiều lựa chọn bắp nước:

- 2 kích cỡ ly: Lớn và siêu lớn.

- 2 kích cỡ bắp: Vừa và lớn.

Ngoài ra, rạp còn có các combo bắp nước phù hợp cho các nhóm khách hàng.`}
                        />

                        <FAQItem
                            question="Tôi muốn nâng cấp kích thước của bắp và nước trong combo có được không?"
                            answer="Được. Bạn có thể thêm tiền tại quầy để nâng cấp cho phần bắp hoặc nước trong combo lên kích cỡ lớn hơn."
                        />

                        <FAQItem
                            question="Tôi muốn nâng cấp bắp ngọt thành vị phô mai/caramel có được không?"
                            answer={`Được. Bạn có thể thêm tiền tại quầy để nâng cấp bắp vị ngọt thành vị phô mai/caramel.

Lưu ý: Không áp dụng chung với các combo khuyến mãi khác.`}
                        />
                    </>
                )}

                {activeTab === "Voucher" && (
                    <>
                        <FAQItem
                            question="Voucher có thời hạn sử dụng không?"
                            answer="Mỗi voucher sẽ có thời hạn khác nhau tùy chương trình khuyến mãi."
                        />

                        <FAQItem
                            question="Có thể dùng nhiều voucher cùng lúc không?"
                            answer="Không. Mỗi giao dịch chỉ áp dụng một voucher."
                        />
                    </>
                )}

                <View style={{ height: 80 }} />
            </ScrollView>

            <Modal visible={showMenu} transparent animationType="slide">
                <View style={styles.modalWrap}>
                    <TouchableOpacity
                        style={styles.leftBlank}
                        onPress={() => setShowMenu(false)}
                    />

                    <View style={styles.sideMenu}>
                        <TouchableOpacity
                            style={styles.menuClose}
                            onPress={() => setShowMenu(false)}
                        >
                            <Ionicons name="menu" size={36} color="#e3962bff" />
                        </TouchableOpacity>

                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>👨‍🍳</Text>
                        </View>

                        <Text style={styles.userName}>
                            {fullName || "Người dùng"}
                        </Text>

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
                                icon="home-outline"
                                text="Trang chủ"
                                onPress={() => go("UserHome")}
                            />

                            <MenuIcon
                                icon="person-outline"
                                text="Thành viên"
                                onPress={() => go("Profile")}
                            />

                            <MenuIcon
                                icon="information-circle-outline"
                                text="Rạp"
                                onPress={() => go("Theater")}
                            />

                            <MenuIcon
                                icon="gift-outline"
                                text="Tin mới & Ưu đãi"
                                onPress={() => go("Promotion")}
                            />

                            <MenuIcon
                                icon="ticket-outline"
                                text="Vé của tôi"
                                onPress={() => go("Tickets")}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EFECE4",
    },

    header: {
        height: 82,
        backgroundColor: "#FFF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },

    headerTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#000",
        flex: 1,
        marginLeft: 20,
    },

    tabContainer: {
        backgroundColor: "#FFF",
        borderBottomWidth: 1,
        borderBottomColor: "#DDD",
        maxHeight: 60,
    },

    tabText: {
        fontSize: 22,
        color: "#C8C0B8",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
    },

    activeTab: {
        color: "#3D2B1F",
        fontWeight: "700",
    },

    content: {
        flex: 1,
    },

    faqItem: {
        marginTop: 1,
    },

    questionBox: {
        minHeight: 76,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    question: {
        flex: 1,
        fontSize: 20,
        color: "#3D2B1F",
        marginRight: 10,
    },

    answerBox: {
        backgroundColor: "#E8E3D8",
        padding: 20,
    },

    answer: {
        fontSize: 18,
        lineHeight: 30,
        color: "#8A7D6F",
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
        backgroundColor: "#ebec95ff",
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
        color: "#edeac9ff",
        fontSize: 16,
        marginTop: 6,
    },

    bigLink: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        paddingVertical: 16,
        alignItems: "center",
        marginTop: 14,
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
});