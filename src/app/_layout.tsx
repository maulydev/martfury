import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = DefaultTheme;

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{ title: 'Product Details', headerBackTitle: 'Back' }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{ title: 'Checkout', headerBackTitle: 'Cart' }}
        />
        <Stack.Screen
          name="checkout/success"
          options={{ title: 'Order Confirmed', headerShown: false }}
        />
        <Stack.Screen
          name="auth/sign-in"
          options={{ title: 'Sign In', presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="auth/sign-up"
          options={{ title: 'Create Account', presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen
          name="admin"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ title: 'Edit Profile', headerBackTitle: 'Account' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
