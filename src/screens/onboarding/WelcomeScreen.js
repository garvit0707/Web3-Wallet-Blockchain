import React from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar, Image,
} from 'react-native';
import { colors } from '../../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.hero}>
        <Text style={styles.logo}>🦊</Text>
        <Text style={styles.title}>Web3 Wallet</Text>
        <Text style={styles.subtitle}>
          Your secure gateway to{'\n'}the decentralized web
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('CreateWallet')}
          activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>Create a new wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('ImportWallet')}
          activeOpacity={0.85}>
          <Text style={styles.secondaryBtnText}>Import existing wallet</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        By continuing you agree to our Terms of Service
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  hero: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: { fontSize: 80, marginBottom: 20 },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});