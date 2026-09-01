import { Tabs } from "expo-router";
import { View } from "react-native";

import { AssistantFab } from "@/components/ui/assistant-fab";
import { Icon } from "@/components/ui/icon";
import { Colors } from "@/constants/theme";
import { useCartStore } from "@/stores/cart.store";

export default function TabLayout() {
  const themeColors = Colors.light;
  const cartCount = useCartStore((s) => s.getCount());

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: themeColors.primary,
          tabBarInactiveTintColor: themeColors.tabIconDefault,
          tabBarStyle: {
            backgroundColor: themeColors.background,
            borderTopColor: themeColors.border,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          headerStyle: {
            backgroundColor: themeColors.background,
          },
          headerTintColor: themeColors.text,
          headerTitleStyle: {
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            title: "Shop",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "grid" : "grid-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            headerTitle: "Shopping Cart",
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "cart" : "cart-outline"}
                size={24}
                color={color}
              />
            ),
            tabBarBadge: cartCount > 0 ? cartCount : undefined,
            tabBarBadgeStyle: {
              backgroundColor: themeColors.primary,
              fontSize: 10,
              fontWeight: "700",
            },
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: "Wishlist",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "heart" : "heart-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Account",
            headerTitle: "My Profile",
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <AssistantFab />
    </View>
  );
}
