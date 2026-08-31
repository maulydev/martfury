import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './icon';
import { Colors } from '@/constants/theme';

/**
 * Floating "open the AI assistant" button, the mobile counterpart to the
 * web app's FloatingAssistant (fixed bottom-right button + pulse ring).
 * Mounted once in the tabs layout so it floats above every tab, and pushes
 * the /assistant modal route on tap (see AssistantScreen).
 */
export function AssistantFab() {
  const router = useRouter();
  const theme = Colors.light;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pulseRing,
          {
            backgroundColor: theme.primary,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }],
          },
        ]}
      />
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        activeOpacity={0.85}
        onPress={() => router.push('/assistant')}
        accessibilityLabel="Open AI Assistant"
      >
        <Icon name="sparkles-outline" size={24} color="#ffffff" />
        <View style={styles.sparkleDot} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 20,
    bottom: 84,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  sparkleDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#facc15',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});
