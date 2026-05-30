import AsyncStorage from "@react-native-async-storage/async-storage";

const USED_VOUCHERS_STORAGE_KEY = "THE_SUN_USED_VOUCHER_CODES";

export const normalizeVoucherCode = (code: string) => code.trim().toUpperCase();

export const getUsedVoucherCodes = async (): Promise<string[]> => {
    try {
        const rawValue = await AsyncStorage.getItem(USED_VOUCHERS_STORAGE_KEY);
        if (!rawValue) return [];

        const parsedValue = JSON.parse(rawValue);
        if (!Array.isArray(parsedValue)) return [];

        return parsedValue
            .filter((code) => typeof code === "string")
            .map((code) => normalizeVoucherCode(code));
    } catch (error) {
        console.log("Get used vouchers error:", error);
        return [];
    }
};

export const markVoucherAsUsed = async (code?: string | null) => {
    if (!code) return;

    const normalizedCode = normalizeVoucherCode(code);
    if (!normalizedCode) return;

    const usedCodes = await getUsedVoucherCodes();
    if (usedCodes.includes(normalizedCode)) return;

    await AsyncStorage.setItem(
        USED_VOUCHERS_STORAGE_KEY,
        JSON.stringify([...usedCodes, normalizedCode])
    );
};
