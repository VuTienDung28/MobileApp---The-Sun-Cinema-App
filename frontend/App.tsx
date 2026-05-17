import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Imports navigation & screens
import TheaterScreen from "./src/screens/Theater/TheaterScreen";
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import AdminHomeScreen from './src/screens/Home/AdminHomeScreen';
import UserHomeScreen from './src/screens/Home/UserHomeScreen';
import AdminVouchersScreen from './src/screens/AdminManageScreens/AdminVouchersScreen';
import TheaterShowtimeScreen from "./src/screens/Theater/TheaterShowtimeScreen";
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import VerifyPasswordScreen from './src/screens/Profile/VerifyPasswordScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/Profile/ChangePasswordScreen';
import PaymentPinScreen from './src/screens/Profile/PaymentPinScreen';
import TransactionHistoryScreen from './src/screens/Profile/TransactionHistoryScreen';
import MovieDetailScreen from './src/screens/Movie/MovieDetailScreen';
import MovieListScreen from './src/screens/Movie/MovieListScreen';
import SeatSelectionScreen from "./src/screens/Tickets/SeatSelectionScreen";
import PromotionScreen from "./src/screens/Promotion/PromotionScreen";
import PromotionDetailScreen from "./src/screens/Promotion/PromotionDetailScreen";
import SettingsScreen from "./src/screens/Menu/SettingsScreen";
import FAQScreen from "./src/screens/Menu/FAQScreen";
import MovieBookingScreen from "./src/screens/Movie/MovieBookingScreen";
import FoodDrinkScreen from './src/screens/Tickets/FoodDrinkScreen';
import TotalTicketsScreenUser from './src/screens/Tickets/TotalTicketsScreenUser';
import PaymentScreen from './src/screens/Tickets/PaymentScreen';
// Các màn hình quản lý dành cho Admin
import AddMovieScreen from './src/screens/AdminManageScreens/AddMovieScreen';
import EditMovieScreen from './src/screens/AdminManageScreens/EditMovieScreen';
import AddTheaterScreen from './src/screens/AdminManageScreens/AddTheaterScreen';
import EditTheaterScreen from './src/screens/AdminManageScreens/EditTheaterScreen';
import TheaterDetailScreen from './src/screens/AdminManageScreens/TheaterDetailScreen';
import SeatLayoutManageScreen from './src/screens/AdminManageScreens/SeatLayoutManageScreen';
import AddShowtimeScreen from './src/screens/AdminManageScreens/AddShowtimeScreen';
import AdminMenuScreen from './src/screens/Menu/AdminMenuScreen';
import TotalTicketsScreen from './src/screens/Tickets/TotalTicketsScreen';
// Imports store, components & types
import useAuthStore from './src/store/useAuthStore';
import CustomAlert from './src/components/CustomAlert';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const { token, role, isLoading, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#FFCC00" />
            </View>
        );
    }

    const navigator = (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {token == null ? (
                // Nhóm màn hình khi chưa đăng nhập
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            ) : role === 'Admin' ? (
                // Nhóm màn hình dành cho Admin
                <>
                    <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                    <Stack.Screen name="AddMovie" component={AddMovieScreen} />
                    <Stack.Screen name="EditMovie" component={EditMovieScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AddTheater" component={AddTheaterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditTheater" component={EditTheaterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TheaterDetail" component={TheaterDetailScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="SeatLayoutManage" component={SeatLayoutManageScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AddShowtime" component={AddShowtimeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TotalTickets" component={TotalTicketsScreen} />
                    <Stack.Screen name="AdminVouchers" component={AdminVouchersScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="AdminMenu" component={AdminMenuScreen} />
                    <Stack.Screen name="VerifyPassword" component={VerifyPasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PaymentPin" component={PaymentPinScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ headerShown: false }} />
                </>
            ) : (
                // Nhóm màn hình dành cho User
                <>
                    <Stack.Screen name="UserHome" component={MainTabNavigator} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MovieList" component={MovieListScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Theater" component={TheaterScreen} />
                    <Stack.Screen name="TheaterShowtime" component={TheaterShowtimeScreen} />
                    <Stack.Screen name="VerifyPassword" component={VerifyPasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="PaymentPin" component={PaymentPinScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="MovieBooking"
                        component={MovieBookingScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="FAQ"
                        component={FAQScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Settings"
                        component={SettingsScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Promotion"
                        component={PromotionScreen}
                        options={{ headerShown: false }}
                    />

                    <Stack.Screen
                        name="PromotionDetail"
                        component={PromotionDetailScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="SeatSelection"
                        component={SeatSelectionScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="FoodDrink"
                        component={FoodDrinkScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="TotalTicketsUser"
                        component={TotalTicketsScreenUser}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="PaymentScreen"
                        component={PaymentScreen}
                        options={{ headerShown: false }}
                    />
                </>
            )}
        </Stack.Navigator>
    );

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer children={navigator} />
            <CustomAlert />
        </View>
    );
}