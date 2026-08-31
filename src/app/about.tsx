import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

/**
 * Static "About Us" screen — ported from the web app's
 * (ecommerce)/about page (stats grid + mission/promise/standard pillars),
 * restyled for mobile. Content is fixed/single-use so it isn't split into a
 * generic + data component the way legal-page.tsx / faq-page.tsx are (those
 * back four separate legal screens).
 */

const stats = [
  { value: '10k+', label: 'Customers served' },
  { value: '24/7', label: 'Support availability' },
  { value: '500+', label: 'Products curated' },
  { value: 'Fast', label: 'Delivery options' },
];

const pillars: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'sparkles-outline',
    title: 'Our Mission',
    text: "Make shopping effortless with a store that's fast, clean, and reliable for everyone.",
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Our Promise',
    text: 'Clear product info, secure checkout, and support that actually responds when you need it.',
  },
  {
    icon: 'star',
    title: 'Our Standard',
    text: 'Only quality items — tested, curated, and priced fairly with no surprises.',
  },
];

export default function AboutScreen() {
  const theme = Colors.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.badge, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
        <Text style={[styles.badgeText, { color: theme.primary }]}>ABOUT US</Text>
      </View>

      <Text style={[styles.heading, { color: theme.text }]}>Built to make shopping simple.</Text>
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        We're focused on delivering a clean shopping experience with great products, transparent
        pricing, and reliable support — every single time.
      </Text>

      <View style={[styles.statsGrid, { borderColor: theme.border, backgroundColor: theme.border }]}>
        {stats.map((s) => (
          <View key={s.label} style={[styles.statCell, { backgroundColor: theme.card }]}>
            <Text style={[styles.statValue, { color: theme.text }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pillars}>
        {pillars.map((p) => (
          <View key={p.title} style={[styles.pillarCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.pillarIcon, { backgroundColor: theme.primaryLight }]}>
              <Icon name={p.icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.pillarTitle, { color: theme.text }]}>{p.title}</Text>
            <Text style={[styles.pillarText, { color: theme.textSecondary }]}>{p.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 10,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    gap: 1,
    marginBottom: 28,
  },
  statCell: {
    width: '49.6%',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  pillars: {
    gap: 14,
  },
  pillarCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 18,
  },
  pillarIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  pillarText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
