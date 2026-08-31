import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useSession } from '@/lib/auth-client';

export default function AdminLayout() {
  const theme = Colors.light;
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (!isPending && !isAdmin) {
      router.replace('/(tabs)/profile');
    }
  }, [isPending, isAdmin, router]);

  if (isPending || !isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard', headerBackTitle: 'App' }}
      />
      <Stack.Screen
        name="products"
        options={{ title: 'Manage Products' }}
      />
      <Stack.Screen
        name="orders"
        options={{ title: 'Manage Orders' }}
      />
    </Stack>
  );
}
