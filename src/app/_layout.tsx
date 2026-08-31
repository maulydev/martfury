import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { StatusBar } from 'expo-status-bar';
import { LogBox, useColorScheme } from 'react-native';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

// better-auth's bundled useSession/useStore hook (better-auth/dist/client/
// react/react-store) synchronously calls its onChange callback from within
// useSyncExternalStore's subscribe function. That trips React 19's stricter
// concurrent-render consistency check on the Fabric renderer, which logs
// this as a recoverable warning and re-renders synchronously — it isn't
// caused by, or fixable in, our own code. Safe to silence.
LogBox.ignoreLogs([
  'There was an error during concurrent rendering but React was able to recover',
]);

export default function RootLayout() {
  const theme = DefaultTheme;

  useEffect(() => {
    // Android's native root window background defaults to black when unset.
    // With edge-to-edge display (default since SDK 57) nothing else paints
    // behind the status bar, so that default shows through as a black bar.
    // This is the runtime fix (works immediately, even in Expo Go); the
    // app.json `backgroundColor` covers it for native builds too, before
    // this even runs.
    SystemUI.setBackgroundColorAsync(Colors.light.background);
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
          name="profile/edit"
          options={{ title: 'Edit Profile', headerBackTitle: 'Account' }}
        />
        <Stack.Screen
          name="orders/index"
          options={{ title: 'My Orders', headerBackTitle: 'Account' }}
        />
      </Stack>
    </ThemeProvider>
  );
}
