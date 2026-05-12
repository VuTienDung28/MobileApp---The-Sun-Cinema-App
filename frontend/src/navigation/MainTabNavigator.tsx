import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, Feather } from "@expo/vector-icons";

import UserHomeScreen from "../screens/Home/UserHomeScreen";
import MyTicketsScreen from "../screens/Tickets/MyTicketsScreen";
import MenuScreen from "../screens/Menu/MenuScreen";
import TheaterScreen from "../screens/Theater/TheaterScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#FFB800",
                tabBarInactiveTintColor: "#222",
                tabBarLabelPosition: "below-icon",

                tabBarStyle: {
                    position: "absolute",
                    left: 20,
                    right: 20,
                    bottom: 16,
                    height: 86,
                    borderRadius: 30,
                    backgroundColor: "#fff",
                    borderTopWidth: 0,
                    paddingHorizontal: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                },

                tabBarItemStyle: {
                    flex: 1,
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                },

                tabBarIconStyle: {
                    marginBottom: 2,
                },

                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: "900",
                    textAlign: "center",
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={UserHomeScreen}
                options={{
                    title: "Trang chủ",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" size={28} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Tickets"
                component={MyTicketsScreen}
                options={{
                    title: "Vé của tôi",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="ticket-outline" size={28} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Cinema"
                component={TheaterScreen}
                options={{
                    title: "Rạp",
                    tabBarIcon: ({ color }) => (
                        <Feather name="map-pin" size={28} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    title: "Menu",
                    tabBarIcon: ({ color }) => (
                        <Feather name="menu" size={28} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}