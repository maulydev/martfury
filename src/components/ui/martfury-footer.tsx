import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '@/constants/theme';

export function MartfuryFooter() {
  const [email, setEmail] = useState('');
  const { width } = useWindowDimensions();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        {/* Top Link Columns */}
        <View style={styles.columnsRow}>
          {/* Quick Links */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Quick Links</Text>
            <Text style={styles.linkItem}>FAQ</Text>
            <Text style={styles.linkItem}>Terms & Conditions</Text>
            <Text style={styles.linkItem}>Shipping</Text>
            <Text style={styles.linkItem}>Returns</Text>
            <Text style={styles.linkItem}>Privacy Policy</Text>
          </View>

          {/* Company */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Company</Text>
            <Text style={styles.linkItem}>About Us</Text>
            <Text style={styles.linkItem}>Affiliate Program</Text>
            <Text style={styles.linkItem}>Contact Us</Text>
            <Text style={styles.linkItem}>Careers</Text>
          </View>

          {/* Business */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Business</Text>
            <Text style={styles.linkItem}>Our Team</Text>
            <Text style={styles.linkItem}>Checkout</Text>
            <Text style={styles.linkItem}>My Account</Text>
            <Text style={styles.linkItem}>Shop</Text>
          </View>

          {/* Newsletter */}
          <View style={[styles.column, styles.newsletterColumn]}>
            <Text style={styles.columnTitle}>Newsletter</Text>
            <View style={styles.newsletterInputRow}>
              <TextInput
                style={styles.newsletterInput}
                placeholder="Email address"
                placeholderTextColor="#999999"
                value={email}
                onChangeText={setEmail}
              />
              <TouchableOpacity style={styles.subscribeButton}>
                <Text style={styles.subscribeButtonText}>SUBSCRIBE</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.newsletterSubtext}>
              Register now to get updates on promotions.
            </Text>
          </View>
        </View>

        {/* Bottom Copyright Bar */}
        <View style={styles.bottomBar}>
          <Text style={styles.copyrightText}>
            © 2026 Martfury. All Rights Reserved.
          </Text>
          <Text style={styles.paymentText}>
            We Use Secure Payment For: Visa / Mastercard / PayPal
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    paddingTop: 40,
    paddingBottom: 24,
    marginTop: 40,
    alignItems: 'center',
  },
  footerContent: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 20,
  },
  columnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 24,
    paddingBottom: 32,
  },
  column: {
    width: '48%',
    gap: 10,
  },
  newsletterColumn: {
    width: '100%',
    marginTop: 8,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 4,
  },
  linkItem: {
    fontSize: 13,
    color: '#666666',
  },
  newsletterInputRow: {
    flexDirection: 'row',
    height: 40,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  newsletterInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    backgroundColor: '#ffffff',
  },
  subscribeButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  newsletterSubtext: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  copyrightText: {
    fontSize: 12,
    color: '#888888',
  },
  paymentText: {
    fontSize: 12,
    color: '#888888',
  },
});
