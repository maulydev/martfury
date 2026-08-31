import React, { useState, useEffect } from 'react';
import { Image, ImageProps, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const DEFAULT_PRODUCT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=600&auto=format&fit=crop';

export interface SafeImageProps extends ImageProps {
  fallbackUri?: string;
  name?: string;
}

export function getInitials(str?: string): string {
  if (!str) return 'MF';
  const words = str.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'MF';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function SafeImage({
  source,
  fallbackUri = DEFAULT_PRODUCT_PLACEHOLDER,
  name,
  onError,
  style,
  ...props
}: SafeImageProps) {
  const [isError, setIsError] = useState(false);

  const uri =
    source && typeof source === 'object' && 'uri' in source
      ? (source as { uri?: string }).uri
      : null;

  useEffect(() => {
    setIsError(false);
  }, [uri]);

  if (isError || !uri || uri.trim() === '') {
    if (name) {
      const initials = getInitials(name);
      return (
        <View style={[style, styles.initialsWrapper]}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
      );
    }
    return <Image {...props} style={style} source={{ uri: fallbackUri }} />;
  }

  return (
    <Image
      {...props}
      style={style}
      source={source}
      onError={(e) => {
        setIsError(true);
        if (onError) onError(e);
      }}
    />
  );
}

const styles = StyleSheet.create({
  initialsWrapper: {
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  initialsText: {
    color: '#999999',
    fontWeight: '900',
    fontSize: 28,
    letterSpacing: 1.5,
  },
});
