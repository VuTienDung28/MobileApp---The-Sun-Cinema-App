import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import MainTabNavigator from "./src/navigation/MainTabNavigator";
import LoginScreen from "./src/screens/Auth/LoginScreen";
import RegisterScreen from "./src/screens/Auth/RegisterScreen";
import AdminHomeScreen from "./src/screens/Home/AdminHomeScreen";

import ProfileScreen from "./src/screens/Profile/ProfileScreen";
import VerifyPasswordScreen from "./src/screens/Profile/VerifyPasswordScreen";
import EditProfileScreen from "./src/screens/Profile/EditProfileScreen";
import ChangePasswordScreen from "./src/screens/Profile/ChangePasswordScreen";
import PaymentPinScreen from "./src/screens/Profile/PaymentPinScreen";
import TransactionHistoryScreen from "./src/screens/Profile/TransactionHistoryScreen";

import MovieDetailScreen from "./src/screens/Movie/MovieDetailScreen";
import MovieListScreen from "./src/screens/Movie/MovieListScreen";
import MenuScreen from "./src/screens/Menu/MenuScreen";

import AddMovieScreen from "./src/screens/AdminManageScreens/AddMovieScreen";
import EditMovieScreen from "./src/screens/AdminManageScreens/EditMovieScreen";
import AddTheaterScreen from "./src/screens/AdminManageScreens/AddTheaterScreen";

import useAuthStore from "./src/store/useAuthStore";
import CustomAlert from "./src/components/CustomAlert";
import { RootStackParamList } from "./src/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const { token, role, isLoading, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#FFCC00" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {token == null ? (
                        <>
                            <Stack.Screen name="Login" component={LoginScreen} />
                            <Stack.Screen name="Register" component={RegisterScreen} />
                        </>
                    ) : role === "Admin" ? (
                        <>
                            <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                            <Stack.Screen name="AddMovie" component={AddMovieScreen} />
                            <Stack.Screen name="EditMovie" component={EditMovieScreen} />
                            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                            <Stack.Screen name="AddTheater" component={AddTheaterScreen} />

                            <Stack.Screen name="Profile" component={ProfileScreen} />
                            <Stack.Screen name="VerifyPassword" component={VerifyPasswordScreen} />
                            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                            <Stack.Screen name="PaymentPin" component={PaymentPinScreen} />
                            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
                        </>
                    ) : (
                        <>
                            <Stack.Screen name="UserHome" component={MainTabNavigator} />
                            <Stack.Screen name="Menu" component={MenuScreen} />
                            <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
                            <Stack.Screen name="MovieList" component={MovieListScreen} />

                            <Stack.Screen name="Profile" component={ProfileScreen} />
                            <Stack.Screen name="VerifyPassword" component={VerifyPasswordScreen} />
                            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                            <Stack.Screen name="PaymentPin" component={PaymentPinScreen} />
                            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>

            <CustomAlert />
        </View>
    );
}