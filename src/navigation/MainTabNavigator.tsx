import React from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, Feather } from "@expo/vector-icons";

import UserHomeScreen from "../screens/Home/UserHomeScreen";
import MyTicketsScreen from "../screens/Tickets/MyTicketsScreen";
import MenuScreen from "../screens/Menu/MenuScreen";

const Tab = createBottomTabNavigator();

function EmptyScreen({ title }: { title: string }) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: "#FFF4CF",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "900",
                    color: "#4A2C13",
                }}
            >
                {title}
            </Text>
        </View>
    );
}

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#FFB800",
                tabBarInactiveTintColor: "#222",
                tabBarStyle: {
                    position: "absolute",
                    width: "100%",
                    height: 84,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    backgroundColor: "#fff",
                    paddingTop: 8,
                    paddingBottom: 12,
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                },
                tabBarItemStyle: {
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                },
                tabBarLabelStyle: {
                    fontSize: 14,
                    fontWeight: "800",
                    textAlign: "center",
                },
                tabBarIconStyle: {
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={UserHomeScreen}
                options={{
                    title: "Trang chủ",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size + 4} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Tickets"
                component={MyTicketsScreen}
                options={{
                    title: "Vé của tôi",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="ticket-outline" size={size + 4} color={color} />
                    ),
                }}
            />

            <Tab.Screen
                name="Cinema"
                options={{
                    title: "Rạp",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="map-pin" size={size + 4} color={color} />
                    ),
                }}
            >
                {() => <EmptyScreen title="Rạp" />}
            </Tab.Screen>

            <Tab.Screen
                name="Menu"
                component={MenuScreen}
                options={{
                    tabBarButton: () => null,
                }}
            />
        </Tab.Navigator>
    );
}