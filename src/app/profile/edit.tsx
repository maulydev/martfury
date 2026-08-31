import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { useSession, authFetch } from '@/lib/auth-client';

type ProfileData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const { data: session, isPending: sessionPending, refetch: refetchSession } = useSession();
  const user = session?.user;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (sessionPending) return;

    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingProfile(true);
      setError(null);
      try {
        const res = await authFetch('/api/auth/profile');
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? 'Could not load your profile.');
        }

        if (!cancelled) {
          setProfile(json.data);
          setName(json.data.name ?? '');
        }
      } catch {
        // Fall back to what the session already has, so the screen is still usable.
        if (!cancelled) {
          setName(user.name ?? '');
          setError('Could not refresh your profile from the server — showing cached info.');
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionPending, user?.id]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name cannot be empty.');
      return;
    }

    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await authFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? 'Could not save your changes.');
      }

      setProfile(json.data);
      setSuccess(true);
      await refetchSession();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  if (sessionPending || (loadingProfile && !error)) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!user) return null;

  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Icon name="person-outline" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setSuccess(false);
              }}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
          <View style={[styles.inputContainer, styles.inputDisabled, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
            <Icon name="mail-outline" size={18} color={theme.textSecondary} />
            <Text style={[styles.input, { color: theme.textSecondary }]}>{user.email}</Text>
          </View>
        </View>

        {joinedDate && (
          <Text style={[styles.metaText, { color: theme.textSecondary }]}>Member since {joinedDate}</Text>
        )}

        {error && <Text style={[styles.messageText, { color: theme.error }]}>{error}</Text>}
        {success && (
          <Text style={[styles.messageText, { color: theme.success }]}>Profile updated.</Text>
        )}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.btnText}>Save Changes</Text>}
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
  inputDisabled: {
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  metaText: {
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
