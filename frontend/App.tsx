import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import AdminHomeScreen from './src/screens/Home/AdminHomeScreen';
import AddMovieScreen from './src/screens/Home/AddMovieScreen';  
import AddTheaterScreen from './src/screens/Home/AddTheaterScreen';
import UserHomeScreen from './src/screens/Home/UserHomeScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import useAuthStore from './src/store/useAuthStore';
import CustomAlert from './src/components/CustomAlert';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator();

export default function App() {
  const { token, role, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFCC00" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator id="RootNavigator" screenOptions={{ headerShown: false }}>
          {token == null ? (
            <Stack.Group>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              {role === 'Admin' ? (
                <>
                  <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
                  <Stack.Screen name="AddMovie" component={AddMovieScreen} /> 
                  <Stack.Screen name="AddTheater" component={AddTheaterScreen} /> 
                </>
              ) : (
                <Stack.Screen name="UserHome" component={UserHomeScreen} />
              )}
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <CustomAlert />
    </View>
  );
}