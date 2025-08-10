import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './frontend/screens/HomeScreen';
import MenuScreen from './frontend/screens/MenuScreen';
import CartScreen from './frontend/screens/CartScreen';
import { RootStackParamList } from './frontend/types/Navigation';
import { CartProvider, useCart } from './frontend/contexts/CartContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNav() {
  const { isHydrated } = useCart();
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppNav />
    </CartProvider>
  );
}
