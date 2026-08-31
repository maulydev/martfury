import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Text, ColorValue } from 'react-native';

export type IconName =
  | 'home'
  | 'home-outline'
  | 'grid'
  | 'grid-outline'
  | 'cart'
  | 'cart-outline'
  | 'receipt'
  | 'receipt-outline'
  | 'person'
  | 'person-outline'
  | 'search-outline'
  | 'laptop-outline'
  | 'shirt-outline'
  | 'sparkles-outline'
  | 'bag-handle-outline'
  | 'speedometer-outline'
  | 'chevron-forward'
  | 'star'
  | 'close-circle'
  | 'add'
  | 'remove'
  | 'trash-outline'
  | 'arrow-forward'
  | 'location-outline'
  | 'card-outline'
  | 'phone-portrait-outline'
  | 'lock-closed-outline'
  | 'checkmark-circle'
  | 'time-outline'
  | 'mail-outline'
  | 'call-outline'
  | 'person-add-outline'
  | 'log-in-outline'
  | 'log-out-outline'
  | 'person-circle-outline'
  | 'wallet-outline'
  | 'cube-outline'
  | 'cube'
  | 'people-outline'
  | 'create-outline'
  | 'headset-outline'
  | 'heart'
  | 'heart-outline'
  | 'truck-outline'
  | 'refresh-outline'
  | 'shield-checkmark-outline'
  | 'chevron-down'
  | 'list-outline'
  | 'filter-outline'
  | 'eye-outline'
  | 'eye-off-outline';

interface IconProps {
  name: IconName;
  size?: number;
  color?: ColorValue;
}

const symbolMap: Record<IconName, { ios: string; android: string; web: string; textFallback: string }> = {
  'home': { ios: 'house.fill', android: 'home', web: 'home', textFallback: '🏠' },
  'home-outline': { ios: 'house', android: 'home', web: 'home', textFallback: '🏠' },
  'grid': { ios: 'square.grid.2x2.fill', android: 'grid_view', web: 'grid_view', textFallback: '🛍️' },
  'grid-outline': { ios: 'square.grid.2x2', android: 'grid_view', web: 'grid_view', textFallback: '🛍️' },
  'cart': { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart', textFallback: '🛒' },
  'cart-outline': { ios: 'cart', android: 'shopping_cart', web: 'shopping_cart', textFallback: '🛒' },
  'receipt': { ios: 'doc.text.fill', android: 'receipt', web: 'receipt', textFallback: '📜' },
  'receipt-outline': { ios: 'doc.text', android: 'receipt', web: 'receipt', textFallback: '📜' },
  'person': { ios: 'person.fill', android: 'person', web: 'person', textFallback: '👤' },
  'person-outline': { ios: 'person', android: 'person', web: 'person', textFallback: '👤' },
  'search-outline': { ios: 'magnifyingglass', android: 'search', web: 'search', textFallback: '🔍' },
  'laptop-outline': { ios: 'laptopcomputer', android: 'laptop', web: 'laptop', textFallback: '💻' },
  'shirt-outline': { ios: 'tshirt', android: 'checkroom', web: 'checkroom', textFallback: '👕' },
  'sparkles-outline': { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome', textFallback: '✨' },
  'bag-handle-outline': { ios: 'bag', android: 'shopping_bag', web: 'shopping_bag', textFallback: '🛍️' },
  'speedometer-outline': { ios: 'speedometer', android: 'dashboard', web: 'dashboard', textFallback: '⚡' },
  'chevron-forward': { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right', textFallback: '›' },
  'star': { ios: 'star.fill', android: 'star', web: 'star', textFallback: '★' },
  'close-circle': { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel', textFallback: '✕' },
  'add': { ios: 'plus', android: 'add', web: 'add', textFallback: '+' },
  'remove': { ios: 'minus', android: 'remove', web: 'remove', textFallback: '-' },
  'trash-outline': { ios: 'trash', android: 'delete', web: 'delete', textFallback: '🗑' },
  'arrow-forward': { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward', textFallback: '→' },
  'location-outline': { ios: 'location', android: 'location_on', web: 'location_on', textFallback: '📍' },
  'card-outline': { ios: 'creditcard', android: 'credit_card', web: 'credit_card', textFallback: '💳' },
  'phone-portrait-outline': { ios: 'iphone', android: 'smartphone', web: 'smartphone', textFallback: '📱' },
  'lock-closed-outline': { ios: 'lock', android: 'lock', web: 'lock', textFallback: '🔒' },
  'checkmark-circle': { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle', textFallback: '✓' },
  'time-outline': { ios: 'clock', android: 'schedule', web: 'schedule', textFallback: '⏰' },
  'mail-outline': { ios: 'envelope', android: 'email', web: 'email', textFallback: '✉️' },
  'call-outline': { ios: 'phone', android: 'phone', web: 'phone', textFallback: '📞' },
  'person-add-outline': { ios: 'person.badge.plus', android: 'person_add', web: 'person_add', textFallback: '👤+' },
  'log-in-outline': { ios: 'arrow.right.square', android: 'login', web: 'login', textFallback: '🔑' },
  'log-out-outline': { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout', textFallback: '🚪' },
  'person-circle-outline': { ios: 'person.circle', android: 'account_circle', web: 'account_circle', textFallback: '👤' },
  'wallet-outline': { ios: 'wallet.pass', android: 'account_balance_wallet', web: 'account_balance_wallet', textFallback: '💰' },
  'cube-outline': { ios: 'cube', android: 'inventory_2', web: 'inventory_2', textFallback: '📦' },
  'cube': { ios: 'cube.fill', android: 'inventory', web: 'inventory', textFallback: '📦' },
  'people-outline': { ios: 'person.3', android: 'group', web: 'group', textFallback: '👥' },
  'create-outline': { ios: 'square.and.pencil', android: 'edit', web: 'edit', textFallback: '✏️' },
  'headset-outline': { ios: 'headphones', android: 'headset', web: 'headset', textFallback: '🎧' },
  'heart': { ios: 'heart.fill', android: 'favorite', web: 'favorite', textFallback: '♥' },
  'heart-outline': { ios: 'heart', android: 'favorite_border', web: 'favorite_border', textFallback: '♡' },
  'truck-outline': { ios: 'shippingbox', android: 'local_shipping', web: 'local_shipping', textFallback: '🚚' },
  'refresh-outline': { ios: 'arrow.clockwise', android: 'autorenew', web: 'autorenew', textFallback: '🔄' },
  'shield-checkmark-outline': { ios: 'shield.fill', android: 'verified_user', web: 'verified_user', textFallback: '🛡️' },
  'chevron-down': { ios: 'chevron.down', android: 'expand_more', web: 'expand_more', textFallback: '∨' },
  'list-outline': { ios: 'list.bullet', android: 'format_list_bulleted', web: 'format_list_bulleted', textFallback: '☰' },
  'filter-outline': { ios: 'line.3.horizontal.decrease.circle', android: 'filter_list', web: 'filter_list', textFallback: '⚙️' },
  'eye-outline': { ios: 'eye', android: 'visibility', web: 'visibility', textFallback: '👁️' },
  'eye-off-outline': { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off', textFallback: '🙈' },
};

export function Icon({ name, size = 20, color = '#000000' }: IconProps) {
  const sym = symbolMap[name];

  if (!sym) {
    return <Text style={{ fontSize: size, color }}>•</Text>;
  }

  try {
    return (
      <SymbolView
        name={{
          ios: sym.ios as any,
          android: sym.android as any,
          web: sym.web as any,
        }}
        size={size}
        tintColor={color}
      />
    );
  } catch (e) {
    return <Text style={{ fontSize: size, color }}>{sym.textFallback}</Text>;
  }
}
