import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { useSession, signOut } from '@/lib/auth-client';

type MenuItem = {
  icon: string;
  label: string;
  route?: Href;
  comingSoon?: boolean;
};

export default function ProfileScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', route: '/profile/edit' },
        { icon: 'location-outline', label: 'Shipping Addresses', comingSoon: true },
        { icon: 'card-outline', label: 'Payment Methods', comingSoon: true },
      ],
    },
    ...(user?.role === 'admin'
      ? [
          {
            title: 'Admin & Operations',
            items: [
              { icon: 'speedometer-outline', label: 'Admin Dashboard', route: '/admin' as Href },
            ],
          },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  if (isPending) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.loggedOutContainer, { backgroundColor: theme.background }]}>
        <Icon name="person-circle-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.title, { color: theme.text }]}>You're not signed in</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to access your orders, wishlist, and profile
        </Text>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/auth/sign-in')}
        >
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnOutline, { borderColor: theme.primary }]}
          onPress={() => router.push('/auth/sign-up')}
        >
          <Text style={[styles.btnText, { color: theme.primary }]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* User Header Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.menuRow,
                    itemIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                  ]}
                  onPress={() => {
                    if (item.comingSoon) {
                      Alert.alert('Coming soon', `${item.label} isn't available yet.`);
                      return;
                    }
                    if (item.route) router.push(item.route);
                  }}
                >
                  <Icon name={item.icon as any} size={20} color={item.comingSoon ? theme.textSecondary : theme.primary} />
                  <Text style={[styles.menuLabel, { color: item.comingSoon ? theme.textSecondary : theme.text }]}>
                    {item.label}
                  </Text>
                  {item.comingSoon ? (
                    <Text style={[styles.comingSoonBadge, { color: theme.textSecondary, borderColor: theme.border }]}>
                      Soon
                    </Text>
                  ) : (
                    <Icon name="chevron-forward" size={18} color={theme.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.sectionCard, styles.signOutRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={handleSignOut}
        >
          <Icon name="log-out-outline" size={20} color={theme.error} />
          <Text style={[styles.menuLabel, { color: theme.error }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggedOutContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  btn: {
    height: 50,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  profileDetails: {
    gap: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  menuContainer: {
    gap: 20,
    paddingBottom: 32,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  comingSoonBadge: {
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    justifyContent: 'center',
  },
});
