import React, { useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import { signUp, useSession } from '@/lib/auth-client';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const { data: session, isPending: isSessionPending } = useSession();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'phone' | 'password' | null>(null);

  // Already signed-in users shouldn't land on this screen (e.g. deep link,
  // or session finishing its load after the screen mounted) — bounce them
  // back to wherever they came from instead of showing the form.
  useEffect(() => {
    if (isSessionPending || !session) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  }, [isSessionPending, session, router]);

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      setError('Full name, email, and password are required.');
      return;
    }

    setError(null);
    setLoading(true);
    const { error: signUpError } = await signUp.email({
      name: fullName,
      email,
      password,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message ?? 'Unable to create account. Please try again.');
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/profile');
    }
  };

  // Avoid flashing the form before the redirect effect above fires.
  if (isSessionPending || session) {
    return <View style={[styles.screen, { backgroundColor: theme.background }]} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          {/* Top Bar with Brand Logo and Close Button */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <Text style={styles.logoText}>
                mart<Text style={styles.logoAccent}>fury</Text>
              </Text>
              <View style={styles.logoDot} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Segmented Auth Tabs */}
          <View style={[styles.tabBar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => router.replace('/auth/sign-in')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, { color: theme.textSecondary }]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]} activeOpacity={0.9}>
              <Text style={[styles.tabText, styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* Headline & Subtitle */}
          <View style={styles.welcomeGroup}>
            <Text style={[styles.title, { color: theme.text }]}>Create Your Account</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join Martfury for fast GHS checkout, saved addresses, and exclusive member deals.
            </Text>
          </View>

          {/* Error Alert Box */}
          {error && (
            <View style={[styles.errorBox, { backgroundColor: '#fef2f2', borderColor: '#fca5a5' }]}>
              <Icon name="close-circle" size={16} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  focusedInput === 'name' && { borderColor: theme.primary, backgroundColor: '#ffffff' },
                ]}
              >
                <Icon
                  name="person-outline"
                  size={18}
                  color={focusedInput === 'name' ? theme.primary : theme.textMuted}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="e.g. Kofi Mensah"
                  placeholderTextColor={theme.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  focusedInput === 'email' && { borderColor: theme.primary, backgroundColor: '#ffffff' },
                ]}
              >
                <Icon
                  name="mail-outline"
                  size={18}
                  color={focusedInput === 'email' ? theme.primary : theme.textMuted}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="name@example.com"
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Phone Number Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Phone Number <Text style={styles.optionalText}>(Optional)</Text></Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  focusedInput === 'phone' && { borderColor: theme.primary, backgroundColor: '#ffffff' },
                ]}
              >
                <Icon
                  name="call-outline"
                  size={18}
                  color={focusedInput === 'phone' ? theme.primary : theme.textMuted}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="+233 24 123 4567"
                  placeholderTextColor={theme.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phone')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                  focusedInput === 'password' && { borderColor: theme.primary, backgroundColor: '#ffffff' },
                ]}
              >
                <Icon
                  name="lock-closed-outline"
                  size={18}
                  color={focusedInput === 'password' ? theme.primary : theme.textMuted}
                />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={theme.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.primary },
                loading && styles.submitBtnDisabled,
              ]}
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.btnInner}>
                  <Text style={styles.submitBtnText}>Create Martfury Account</Text>
                  <Icon name="arrow-forward" size={18} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Trust Footnote Badges */}
          <View style={[styles.trustSection, { borderTopColor: theme.border }]}>
            <View style={styles.trustItem}>
              <Icon name="shield-checkmark-outline" size={16} color={theme.primary} />
              <Text style={[styles.trustText, { color: theme.textSecondary }]}>Secure Auth</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Icon name="truck-outline" size={16} color={theme.primary} />
              <Text style={[styles.trustText, { color: theme.textSecondary }]}>Fast GHS Delivery</Text>
            </View>
            <View style={styles.trustDivider} />
            <View style={styles.trustItem}>
              <Icon name="headset-outline" size={16} color={theme.primary} />
              <Text style={[styles.trustText, { color: theme.textSecondary }]}>24/7 Support</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 24,
    gap: 20,
    boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.06)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#2962ff',
    fontWeight: '900',
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffaa00',
    marginLeft: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2962ff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  welcomeGroup: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#888888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  trustSection: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 4,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
  },
  trustDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#e1e4e8',
  },
});
