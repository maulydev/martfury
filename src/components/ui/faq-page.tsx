import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqSection = {
  heading: string;
  items: FaqItem[];
};

type FaqPageProps = {
  sections: FaqSection[];
};

export function FaqPage({ sections }: FaqPageProps) {
  const theme = Colors.light;
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenKey((prev) => (prev === key ? null : key));
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {sections.map((section, sIdx) => (
        <View key={sIdx} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {section.heading}
          </Text>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {section.items.map((item, iIdx) => {
              const key = `${sIdx}-${iIdx}`;
              const open = openKey === key;
              return (
                <View
                  key={key}
                  style={[
                    styles.itemWrap,
                    iIdx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                  ]}
                >
                  <TouchableOpacity style={styles.questionRow} onPress={() => toggle(key)}>
                    <Text style={[styles.question, { color: theme.text }]}>{item.question}</Text>
                    <View style={open && styles.chevronOpen}>
                      <Icon name="chevron-down" size={18} color={theme.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  {open && (
                    <Text style={[styles.answer, { color: theme.textSecondary }]}>{item.answer}</Text>
                  )}
                </View>
              );
            })}
          </View>
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
    gap: 20,
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemWrap: {
    paddingHorizontal: 14,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
    paddingBottom: 14,
  },
});
