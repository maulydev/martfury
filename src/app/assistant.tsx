import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import { getProductImage, getProductPricing } from '@/lib/catalog';
import {
  sendAssistantMessage,
  isAssistantConfigured,
  ASSISTANT_QUICK_PROMPTS,
  type AssistantMessage,
} from '@/lib/ai-assistant';

/**
 * AI Shopping Assistant chat screen — the mobile counterpart to the web
 * app's AssistantChatDialog. Opened as a modal (see the "assistant" Stack.
 * Screen in _layout.tsx and AssistantFab, which pushes this route) rather
 * than an in-place dialog, since React Native has no equivalent of the
 * web's shadcn Dialog without pulling in another library — expo-router's
 * modal presentation is the idiomatic fit here (same pattern the sign-in/
 * sign-up screens already use).
 */
export default function AssistantScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const configured = isAssistantConfigured();

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isEmpty = messages.length === 0;

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages;
    const userMessage: AssistantMessage = { role: 'user', parts: [{ text: trimmed }] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    scrollToEnd();

    const result = await sendAssistantMessage(history, trimmed);

    if ('error' in result) {
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: result.error }], isError: true }]);
    } else {
      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: result.text }], products: result.products, wantsCheckout: result.wantsCheckout },
      ]);
    }

    setLoading(false);
    scrollToEnd();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
                <Icon name="sparkles-outline" size={18} color="#ffffff" />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>AI Assistant</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Always here to help</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: theme.backgroundElement }]}
            onPress={() => router.back()}
          >
            <Icon name="close-circle" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
        >
          {!configured ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primaryLight }]}>
                <Icon name="sparkles-outline" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Assistant not set up</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                This device is missing an EXPO_PUBLIC_GEMINI_API_KEY, so the AI assistant can't run yet.
              </Text>
            </View>
          ) : isEmpty ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primaryLight }]}>
                <Icon name="sparkles-outline" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>How can I help you?</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Find products and get checkout-ready in seconds.
              </Text>
              <View style={styles.quickPrompts}>
                {ASSISTANT_QUICK_PROMPTS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.quickPromptBtn, { borderColor: theme.border }]}
                    onPress={() => send(p.value)}
                  >
                    <Text style={[styles.quickPromptText, { color: theme.textSecondary }]}>{p.label} →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            messages.map((m, i) => (
              <View key={i} style={[styles.messageRow, m.role === 'user' && styles.messageRowUser]}>
                <View
                  style={[
                    styles.avatarSmall,
                    { backgroundColor: m.role === 'user' ? theme.primary : theme.backgroundElement, borderColor: theme.border },
                  ]}
                >
                  <Icon
                    name={m.role === 'user' ? 'person-outline' : 'sparkles-outline'}
                    size={14}
                    color={m.role === 'user' ? '#ffffff' : theme.primary}
                  />
                </View>

                <View style={styles.messageBody}>
                  <View
                    style={[
                      styles.bubble,
                      m.role === 'user'
                        ? [styles.bubbleUser, { backgroundColor: theme.primary }]
                        : m.isError
                          ? [styles.bubbleError, { borderColor: '#fecaca' }]
                          : [styles.bubbleModel, { backgroundColor: theme.backgroundElement, borderColor: theme.border }],
                    ]}
                  >
                    {m.isError && (
                      <View style={styles.errorHeader}>
                        <Icon name="close-circle" size={13} color={theme.error} />
                        <Text style={[styles.errorHeaderText, { color: theme.error }]}>Assistant Error</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.bubbleText,
                        { color: m.role === 'user' ? '#ffffff' : m.isError ? theme.error : theme.text },
                      ]}
                    >
                      {m.parts[0]?.text}
                    </Text>
                  </View>

                  {/* Checkout hand-off card */}
                  {m.wantsCheckout && (
                    <View style={[styles.checkoutCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                      <View style={styles.checkoutCardHeader}>
                        <Icon name="bag-handle-outline" size={14} color="#059669" />
                        <Text style={styles.checkoutCardLabel}>CART READY</Text>
                      </View>
                      <Text style={styles.checkoutCardSubtext}>Your cart is set — head to checkout to finish up securely.</Text>
                      <TouchableOpacity
                        style={styles.checkoutCardBtn}
                        onPress={() => router.push('/checkout')}
                      >
                        <Text style={styles.checkoutCardBtnText}>Go to Checkout</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Product cards */}
                  {m.products && m.products.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsRow}>
                      {m.products.map((product) => {
                        const { price } = getProductPricing(product);
                        const image = getProductImage(product);
                        return (
                          <TouchableOpacity
                            key={product.id}
                            style={[styles.productCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
                            onPress={() => router.push(`/product/${product.id}`)}
                          >
                            <View style={[styles.productImageWrap, { backgroundColor: theme.backgroundSelected }]}>
                              {image ? (
                                <Image source={{ uri: image }} style={styles.productImage} resizeMode="cover" />
                              ) : (
                                <Icon name="bag-handle-outline" size={20} color={theme.textSecondary} />
                              )}
                            </View>
                            <Text style={[styles.productName, { color: theme.text }]} numberOfLines={1}>
                              {product.name}
                            </Text>
                            <Text style={[styles.productPrice, { color: theme.primary }]}>{formatGHS(price, false)}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              </View>
            ))
          )}

          {loading && (
            <View style={styles.messageRow}>
              <View style={[styles.avatarSmall, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <Icon name="sparkles-outline" size={14} color={theme.primary} />
              </View>
              <View style={[styles.bubble, styles.bubbleModel, styles.typingBubble, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
                <ActivityIndicator size="small" color={theme.textSecondary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input bar */}
        <View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
          <View style={[styles.inputRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder={configured ? 'Ask anything…' : 'Assistant unavailable'}
              placeholderTextColor={theme.textSecondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send(input)}
              editable={configured && !loading}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.primary, opacity: !configured || loading || !input.trim() ? 0.4 : 1 }]}
              onPress={() => send(input)}
              disabled={!configured || loading || !input.trim()}
            >
              <Icon name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.poweredBy, { color: theme.textMuted }]}>Powered by Gemini AI</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#34d399',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 260,
  },
  quickPrompts: {
    gap: 8,
    width: '100%',
    maxWidth: 280,
    marginTop: 12,
  },
  quickPromptBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickPromptText: {
    fontSize: 13,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  avatarSmall: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  messageBody: {
    flex: 1,
    maxWidth: '82%',
    gap: 10,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleModel: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  bubbleError: {
    alignSelf: 'flex-start',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  errorHeaderText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkoutCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  checkoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkoutCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#047857',
  },
  checkoutCardSubtext: {
    fontSize: 11,
    color: '#065f46',
    lineHeight: 16,
  },
  checkoutCardBtn: {
    height: 36,
    borderRadius: 10,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutCardBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  productsRow: {
    flexGrow: 0,
  },
  productCard: {
    width: 128,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    marginRight: 8,
    gap: 4,
  },
  productImageWrap: {
    height: 72,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontSize: 11,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBar: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 4,
    height: 48,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 8,
    opacity: 0.6,
  },
});
