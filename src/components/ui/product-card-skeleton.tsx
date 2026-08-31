import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from './skeleton';

type ProductCardSkeletonProps = {
  layout?: 'grid' | 'list';
  /** Match the real image height used by the grid it sits in (e.g. shop vs. home sections). */
  imageHeight?: number;
};

/**
 * Placeholder shaped like ProductCard's grid/list layout — drop into a
 * products grid/list while its data is still loading so the layout doesn't
 * jump once real products arrive.
 */
export function ProductCardSkeleton({ layout = 'grid', imageHeight = 140 }: ProductCardSkeletonProps) {
  if (layout === 'list') {
    return (
      <View style={styles.listCard}>
        <Skeleton width={80} height={80} borderRadius={8} />
        <View style={styles.listDetails}>
          <Skeleton width="30%" height={10} />
          <Skeleton width="70%" height={13} />
          <Skeleton width="40%" height={11} />
        </View>
        <Skeleton width={32} height={32} borderRadius={6} />
      </View>
    );
  }

  return (
    <View style={styles.gridCard}>
      <Skeleton height={imageHeight} borderRadius={0} />
      <View style={styles.gridInfo}>
        <Skeleton width="40%" height={10} />
        <Skeleton width="85%" height={13} />
        <Skeleton width="55%" height={11} />
        <Skeleton width="45%" height={16} />
        <Skeleton width="100%" height={34} borderRadius={4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gridCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  gridInfo: {
    padding: 10,
    gap: 8,
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  listDetails: {
    flex: 1,
    gap: 8,
  },
});
