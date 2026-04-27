import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

// Imports navigation & screens
import MainTabNavigator from "./src/navigation/MainTabNavigator";
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import AdminHomeScreen from './src/screens/Home/AdminHomeScreen';
import UserHomeScreen from './src/screens/Home/UserHomeScreen'; // Có thể bỏ đi nếu MainTabNavigator đã bao gồm màn hình này
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import MovieDetailScreen from './src/screens/Movie/MovieDetailScreen';
import MovieListScreen from './src/screens/Movie/MovieListScreen';

// Các màn hình quản lý dành cho Admin
import AddMovieScreen from './src/screens/AdminManageScreens/AddMovieScreen';  
import EditMovieScreen from './src/screens/AdminManageScreens/EditMovieScreen';
import AddTheaterScreen from './src/screens/AdminManageScreens/AddTheaterScreen';

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
                // Nhóm màn hình dành cho Admin (Đã gộp code của cả 2)
                <>
                    <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                    <Stack.Screen name="AddMovie" component={AddMovieScreen} />
                    <Stack.Screen name="EditMovie" component={EditMovieScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="AddTheater" component={AddTheaterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </>
            ) : (
                // Nhóm màn hình dành cho User
                <>
                    <Stack.Screen name="UserHome" component={MainTabNavigator} />
                    <Stack.Screen name="MovieDetail" component={MovieDetailScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="MovieList" component={MovieListScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
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