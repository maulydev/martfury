import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { useSession, authFetch } from '@/lib/auth-client';

/**
 * Account Security screen — mirrors the web app's account/security page
 * (components/security.tsx): a change-password form posting to
 * POST /api/auth/change-password, which checks the current password against
 * the credential account before hashing and saving the new one. Session
 * cookie is attached by authFetch; the endpoint 401s without it.
 */
export default function AccountSecurityScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (sessionPending) return;
    if (!user) router.replace('/auth/sign-in');
  }, [sessionPending, user, router]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Fill in all three fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setSaving(true);
    try {
      const res = await authFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? 'Could not update your password.');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update your password.');
    } finally {
      setSaving(false);
    }
  };

  if (sessionPending) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Protect your account by keeping your password up to date.
        </Text>
        <TouchableOpacity onPress={() => setShowPasswords((v) => !v)} style={styles.toggleRow}>
          <Icon name={showPasswords ? 'eye-off-outline' : 'eye-outline'} size={15} color={theme.primary} />
          <Text style={[styles.toggleText, { color: theme.primary }]}>
            {showPasswords ? 'Hide' : 'Show'} passwords
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Current Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Icon name="lock-closed-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPasswords}
              value={currentPassword}
              onChangeText={(t) => {
                setCurrentPassword(t);
                setSuccess(false);
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>New Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Icon name="lock-closed-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPasswords}
              value={newPassword}
              onChangeText={(t) => {
                setNewPassword(t);
                setSuccess(false);
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm New Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Icon name="lock-closed-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showPasswords}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setSuccess(false);
              }}
            />
          </View>
        </View>

        <Text style={[styles.hint, { color: theme.textMuted }]}>Password must be at least 8 characters.</Text>

        {error && <Text style={[styles.messageText, { color: theme.error }]}>{error}</Text>}
        {success && <Text style={[styles.messageText, { color: theme.success }]}>Password updated successfully.</Text>}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }, saving && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Update Password</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    marginBottom: 20,
    gap: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
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
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
