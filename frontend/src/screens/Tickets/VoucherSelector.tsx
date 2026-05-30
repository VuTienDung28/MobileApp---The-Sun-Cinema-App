import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import voucherService, { VoucherDto } from "../../services/voucherService";
import useAlertStore from "../../store/useAlertStore";
import {
    getUsedVoucherCodes,
    normalizeVoucherCode,
} from "./voucherUsageStorage";

type VoucherSelectorProps = {
    orderTotal: number;
    selectedVoucher: VoucherDto | null;
    onChange: (voucher: VoucherDto | null) => void;
};

export const calculateVoucherDiscount = (
    voucher: VoucherDto | null,
    total: number
) => {
    if (!voucher || total < voucher.minOrderValue) return 0;

    if (voucher.discountType === "percentage") {
        const rawDiscount = (total * voucher.discountValue) / 100;
        const maxDiscount = Number(voucher.maxDiscount ?? 0);

        if (maxDiscount > 0 && rawDiscount > maxDiscount) {
            return Math.min(maxDiscount, total);
        }

        return Math.min(rawDiscount, total);
    }

    return Math.min(voucher.discountValue, total);
};

const formatVoucherDiscount = (voucher: VoucherDto) => {
    if (voucher.discountType === "percentage") {
        return `Giảm ${voucher.discountValue}%`;
    }

    return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")} đ`;
};

export default function VoucherSelector({
    orderTotal,
    selectedVoucher,
    onChange,
}: VoucherSelectorProps) {
    const [availableVouchers, setAvailableVouchers] = useState<VoucherDto[]>([]);
    const [usedVoucherCodes, setUsedVoucherCodes] = useState<string[]>([]);
    const [voucherLoading, setVoucherLoading] = useState(false);
    const showAlert = useAlertStore((state) => state.showAlert);

    useEffect(() => {
        let isMounted = true;

        const loadVouchers = async () => {
            try {
                setVoucherLoading(true);
                const [data, usedCodes] = await Promise.all([
                    voucherService.getAllVouchers(),
                    getUsedVoucherCodes(),
                ]);
                if (isMounted) {
                    setAvailableVouchers(data);
                    setUsedVoucherCodes(usedCodes);
                }
            } catch (error) {
                console.log("Voucher load error:", error);
            } finally {
                if (isMounted) {
                    setVoucherLoading(false);
                }
            }
        };

        loadVouchers();

        return () => {
            isMounted = false;
        };
    }, []);

    const activeVouchers = useMemo(() => {
        const now = new Date();

        return availableVouchers.filter((voucher) => {
            const start = new Date(voucher.startDate);
            const end = new Date(voucher.endDate);

            return (
                voucher.isActive &&
                start <= now &&
                end >= now
            );
        });
    }, [availableVouchers]);

    const voucherDiscount = calculateVoucherDiscount(
        selectedVoucher,
        orderTotal
    );

    const hasUsedVoucher = (voucher: VoucherDto) =>
        usedVoucherCodes.includes(normalizeVoucherCode(voucher.code));

    const isVoucherUsedUp = (voucher: VoucherDto) =>
        hasUsedVoucher(voucher) || voucher.usedCount >= voucher.usageLimit;

    const applyVoucher = (voucher: VoucherDto) => {
        const now = new Date();
        const start = new Date(voucher.startDate);
        const end = new Date(voucher.endDate);
        const normalizedCode = normalizeVoucherCode(voucher.code);

        if (
            selectedVoucher &&
            normalizeVoucherCode(selectedVoucher.code) !== normalizedCode
        ) {
            showAlert(
                "Thông báo",
                "Mỗi giao dịch chỉ được dùng 1 voucher. Vui lòng bỏ voucher hiện tại trước khi chọn mã khác.",
                { type: "warning" }
            );
            return;
        }

        if (!voucher.isActive) {
            showAlert("Thông báo", "Voucher này đang tạm tắt.", {
                type: "warning",
            });
            return;
        }

        if (start > now || end < now) {
            showAlert("Thông báo", "Voucher này chưa đến hạn hoặc đã hết hạn.", {
                type: "warning",
            });
            return;
        }

        if (isVoucherUsedUp(voucher)) {
            showAlert("Thông báo", "Voucher này đã hết lượt sử dụng.", {
                type: "warning",
            });
            return;
        }

        if (orderTotal < voucher.minOrderValue) {
            showAlert(
                "Chưa đủ điều kiện",
                `Đơn hàng cần tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")} đ để dùng voucher này.`,
                { type: "warning" }
            );
            return;
        }

        onChange(voucher);
    };

    const removeVoucher = () => {
        onChange(null);
    };

    return (
        <>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>MÃ ƯU ĐÃI</Text>
            </View>

            <View style={styles.voucherBox}>
                {selectedVoucher ? (
                    <View style={styles.appliedVoucherCard}>
                        <View style={styles.appliedVoucherLeft}>
                            <Text style={styles.appliedVoucherLabel}>
                                Đang áp dụng
                            </Text>
                            <Text style={styles.appliedVoucherCode}>
                                {selectedVoucher.code}
                            </Text>
                            <Text style={styles.appliedVoucherDesc}>
                                {formatVoucherDiscount(selectedVoucher)} - Tiết
                                kiệm{" "}
                                {voucherDiscount.toLocaleString("vi-VN")} đ
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.removeVoucherButton}
                            onPress={removeVoucher}
                        >
                            <Ionicons name="close" size={22} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <Text style={styles.voucherHint}>Voucher khả dụng</Text>

                        {voucherLoading ? (
                            <View style={styles.voucherLoading}>
                                <ActivityIndicator
                                    size="small"
                                    color="#D69A00"
                                />
                            </View>
                        ) : activeVouchers.length > 0 ? (
                            activeVouchers.map((voucher) => {
                                const usedUp = isVoucherUsedUp(voucher);
                                const missingAmount = Math.max(
                                    voucher.minOrderValue - orderTotal,
                                    0
                                );
                                const belowMinOrder = missingAmount > 0;

                                return (
                                    <TouchableOpacity
                                        key={voucher.id}
                                        style={[
                                            styles.voucherCard,
                                            (usedUp || belowMinOrder) &&
                                                styles.disabledVoucherCard,
                                        ]}
                                        onPress={() => applyVoucher(voucher)}
                                        disabled={usedUp || belowMinOrder}
                                    >
                                        <View style={styles.voucherCardIcon}>
                                            <Ionicons
                                                name="pricetag"
                                                size={26}
                                                color="#D69A00"
                                            />
                                        </View>

                                        <View style={styles.voucherCardInfo}>
                                            <Text
                                                numberOfLines={1}
                                                style={styles.voucherCardCode}
                                            >
                                                {voucher.code}
                                            </Text>
                                            <Text style={styles.voucherCardDesc}>
                                                {formatVoucherDiscount(voucher)}
                                            </Text>
                                            <Text style={styles.voucherCardMin}>
                                                Đơn tối thiểu{" "}
                                                {voucher.minOrderValue.toLocaleString(
                                                    "vi-VN"
                                                )}{" "}
                                                đ
                                            </Text>
                                            {belowMinOrder && !usedUp && (
                                                <Text
                                                    style={
                                                        styles.voucherNeedMore
                                                    }
                                                >
                                                    Cần thêm{" "}
                                                    {missingAmount.toLocaleString(
                                                        "vi-VN"
                                                    )}{" "}
                                                    đ để dùng voucher
                                                </Text>
                                            )}
                                        </View>

                                        {usedUp ? (
                                            <View style={styles.usedVoucherBadge}>
                                                <Text
                                                    style={
                                                        styles.usedVoucherText
                                                    }
                                                >
                                                    Hết lượt
                                                </Text>
                                            </View>
                                        ) : (
                                            <View
                                                style={
                                                    styles.voucherSelectButton
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.voucherSelectButtonText
                                                    }
                                                >
                                                    Chọn
                                                </Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={styles.noVoucherText}>
                                Hiện chưa có voucher khả dụng.
                            </Text>
                        )}
                    </>
                )}
            </View>

            {voucherDiscount > 0 && (
                <View style={styles.infoRow}>
                    <Text style={styles.rowLabel}>Voucher</Text>
                    <Text style={styles.discountValue}>
                        -{voucherDiscount.toLocaleString("vi-VN")} đ
                    </Text>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        height: 82,
        backgroundColor: "#DDD9CE",
        justifyContent: "center",
        paddingHorizontal: 18,
    },

    sectionHeaderText: {
        fontSize: 28,
        color: "#8D8178",
        fontWeight: "500",
    },

    infoRow: {
        minHeight: 75,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },

    rowLabel: {
        fontSize: 25,
        color: "#3A332F",
    },

    voucherBox: {
        backgroundColor: "#FFF8E8",
        paddingVertical: 14,
        paddingHorizontal: 16,
    },

    voucherHint: {
        marginTop: 14,
        marginBottom: 10,
        color: "#6D4D1D",
        fontSize: 15,
        fontWeight: "800",
    },

    voucherLoading: {
        height: 64,
        justifyContent: "center",
        alignItems: "center",
    },

    voucherCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E7D7B4",
        padding: 14,
        marginBottom: 10,
    },

    disabledVoucherCard: {
        opacity: 0.6,
    },

    voucherCardIcon: {
        width: 54,
        height: 54,
        borderRadius: 15,
        backgroundColor: "#FFF1C6",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },

    voucherCardInfo: {
        flex: 1,
    },

    voucherCardCode: {
        fontSize: 17,
        fontWeight: "900",
        color: "#2F211A",
    },

    voucherCardDesc: {
        fontSize: 14,
        fontWeight: "900",
        color: "#8B2D1C",
        marginTop: 4,
    },

    voucherCardMin: {
        fontSize: 12,
        color: "#8B7A68",
        marginTop: 3,
        fontWeight: "700",
    },

    voucherNeedMore: {
        fontSize: 12,
        color: "#D12121",
        marginTop: 4,
        fontWeight: "900",
    },

    voucherSelectButton: {
        minWidth: 58,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFF1C6",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        paddingHorizontal: 12,
    },

    voucherSelectButtonText: {
        color: "#8B2D1C",
        fontSize: 13,
        fontWeight: "900",
    },

    usedVoucherBadge: {
        minWidth: 72,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFE8E8",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
        paddingHorizontal: 12,
    },

    usedVoucherText: {
        color: "#D12121",
        fontSize: 13,
        fontWeight: "900",
    },

    appliedVoucherCard: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 12,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#E7D7B4",
        padding: 14,
    },

    appliedVoucherLeft: {
        flex: 1,
    },

    appliedVoucherLabel: {
        fontSize: 13,
        color: "#6D4D1D",
        fontWeight: "800",
    },

    appliedVoucherCode: {
        fontSize: 19,
        fontWeight: "900",
        color: "#2F211A",
        marginTop: 3,
    },

    appliedVoucherDesc: {
        fontSize: 14,
        color: "#8B2D1C",
        marginTop: 5,
        fontWeight: "800",
    },

    removeVoucherButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#8B2D1C",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 12,
    },

    noVoucherText: {
        color: "#8B7A68",
        fontSize: 14,
        fontWeight: "700",
        paddingVertical: 8,
    },

    discountValue: {
        fontSize: 25,
        color: "#A3262A",
        fontWeight: "900",
    },
});
