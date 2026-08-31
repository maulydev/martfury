import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import { useSession, authFetch } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';

/**
 * Contact Us screen — mirrors the web app's (ecommerce)/contact page: a
 * form posting to POST /api/contact (validated server-side with zod), plus
 * the static store details shown alongside it. The map embed on web has no
 * mobile equivalent and is left out.
 */

const contactInfo = [
  { icon: 'location-outline' as const, label: 'Address', value: '123 Commercial Street, Accra, Ghana' },
  { icon: 'call-outline' as const, label: 'Phone', value: '+233 000 000 000' },
  { icon: 'mail-outline' as const, label: 'Email', value: 'support@yourstore.com' },
  { icon: 'time-outline' as const, label: 'Business hours', value: 'Mon–Fri: 9:00am – 6:00pm\nSat: 10:00am – 4:00pm' },
];

export default function ContactScreen() {
  const theme = Colors.light;
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    if (!trimmed.name || !trimmed.email || !trimmed.subject || !trimmed.message) {
      setError('Please fill in every field.');
      return;
    }
    if (trimmed.message.length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }

    setError(null);
    setSending(true);
    try {
      const res = await authFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(trimmed),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? 'Failed to send message.');
      }

      useToastStore.getState().show('Your message has been sent successfully');
      setSubject('');
      setMessage('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.badge, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>CONTACT US</Text>
        </View>
        <Text style={[styles.heading, { color: theme.text }]}>We'd love to hear from you.</Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>
          Send a message and our team will respond as soon as possible.
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }]}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }]}
              placeholder="you@example.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Subject</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text }]}
              placeholder="What's this about?"
              placeholderTextColor={theme.textSecondary}
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Message</Text>
            <TextInput
              style={[
                styles.input,
                styles.textarea,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border, color: theme.text },
              ]}
              placeholder="Your message..."
              placeholderTextColor={theme.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {error && <Text style={[styles.messageText, { color: theme.error }]}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: theme.primary }, sending && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={sending}
          >
            {sending ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Send Message</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.infoList}>
          {contactInfo.map((item) => (
            <View key={item.label} style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Icon name={item.icon} size={18} color={theme.primary} />
              <View style={styles.infoTextWrap}>
                <Text style={[styles.infoLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.infoValue, { color: theme.textSecondary }]}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  form: {
    gap: 16,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textarea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  infoList: {
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 19,
  },
});
