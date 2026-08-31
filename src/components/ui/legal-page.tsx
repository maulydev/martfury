import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

type LegalPageProps = {
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({ intro, updatedAt, sections }: LegalPageProps) {
  const theme = Colors.light;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.updatedAt, { color: theme.textSecondary }]}>
        Last updated: {updatedAt}
      </Text>
      <Text style={[styles.intro, { color: theme.text }]}>{intro}</Text>

      {sections.map((section, idx) => (
        <View key={idx} style={styles.section}>
          <Text style={[styles.heading, { color: theme.text }]}>{section.heading}</Text>
          {section.paragraphs.map((p, pIdx) => (
            <Text key={pIdx} style={[styles.paragraph, { color: theme.textSecondary }]}>
              {p}
            </Text>
          ))}
          {section.bullets && (
            <View style={styles.bulletList}>
              {section.bullets.map((b, bIdx) => (
                <View key={bIdx} style={styles.bulletRow}>
                  <Text style={[styles.bulletDot, { color: theme.primary }]}>{'•'}</Text>
                  <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
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
  updatedAt: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  section: {
    marginBottom: 22,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 4,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    lineHeight: 21,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
});
