import React, { useState, Component } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Share, ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import Clipboard from '@react-native-clipboard/clipboard';
import { colors } from '../../theme/colors';

// Error boundary to catch QR render crashes
class QRErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={qrFallbackStyle}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            QR unavailable
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const qrFallbackStyle = {
  width: 200,
  height: 200,
  backgroundColor: '#fff',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
};

let QRCode = null;
try {
  QRCode = require('react-native-qrcode-svg').default;
} catch (e) {
  console.warn('QRCode library not available:', e);
}

export default function ReceiveScreen() {
  const { address } = useSelector(s => s.wallet);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!address) return;
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!address) return;
    await Share.share({
      message: `My Ethereum wallet address:\n${address}`,
      title: 'My Wallet Address',
    });
  };

  const renderQR = () => {
    if (!address) {
      return (
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>Loading address...</Text>
        </View>
      );
    }

    if (!QRCode) {
      return (
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrPlaceholderText}>QR not available</Text>
        </View>
      );
    }

    return (
      <QRErrorBoundary>
        <QRCode
          value={address}
          size={200}
          backgroundColor="#FFFFFF"
          color="#000000"
        />
      </QRErrorBoundary>
    );
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Text style={styles.title}>Receive</Text>
      <Text style={styles.subtitle}>
        Share your address or QR code to receive ETH and tokens.
      </Text>

   
      <View style={styles.qrCard}>
        <View style={styles.networkTag}>
          <Text style={styles.networkTagText}>🟢 Goerli Testnet</Text>
        </View>

        <View style={styles.qrWrap}>
          {renderQR()}
        </View>

        <Text style={styles.scanHint}>Scan to send ETH to this wallet</Text>
      </View>

   
      <View style={styles.addressCard}>
        <Text style={styles.addressLabel}>Wallet Address</Text>
        <Text style={styles.addressText} selectable>
          {address || 'Loading...'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.copyBtn, !address && styles.btnDisabled]}
        onPress={handleCopy}
        disabled={!address}>
        <Text style={styles.copyBtnIcon}>{copied ? '✓' : '⎘'}</Text>
        <Text style={styles.copyBtnText}>
          {copied ? 'Address Copied!' : 'Copy Address'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.shareBtn, !address && styles.btnDisabled]}
        onPress={handleShare}
        disabled={!address}>
        <Text style={styles.shareBtnIcon}>↑</Text>
        <Text style={styles.shareBtnText}>Share Address</Text>
      </TouchableOpacity>

   
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          ⚠️ Only send Goerli testnet ETH to this address.
          Sending real ETH to a testnet address will result in permanent loss.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 24,
    lineHeight: 22,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    gap: 16,
  },
  networkTag: {
    backgroundColor: colors.success + '18',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  networkTagText: { fontSize: 12, color: colors.success, fontWeight: '600' },
  qrWrap: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  qrPlaceholderText: { color: '#999', fontSize: 13 },
  scanHint: { fontSize: 13, color: colors.textSecondary },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addressText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'monospace',
    lineHeight: 22,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  copyBtnIcon: { fontSize: 18, color: '#fff' },
  copyBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  shareBtnIcon: { fontSize: 18, color: colors.textPrimary },
  shareBtnText: { color: colors.textPrimary, fontSize: 16, fontWeight: '500' },
  warningBox: {
    backgroundColor: '#2A1A0A',
    borderWidth: 1,
    borderColor: colors.warning + '55',
    borderRadius: 10,
    padding: 14,
    width: '100%',
  },
  warningText: { color: colors.warning, fontSize: 13, lineHeight: 20 },
  btnDisabled: { opacity: 0.4 },
});