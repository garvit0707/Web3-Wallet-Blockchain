import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert,
  ActivityIndicator, StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import {
  importWalletFromMnemonic,
  importWalletFromPrivateKey,
} from '../../services/walletService';
import {
  savePrivateKey, saveMnemonic,
  saveAddress, savePin, markWalletCreated,
} from '../../services/storageService';
import { useDispatch } from 'react-redux';
import { setAddress } from '../../store/slices/walletSlice';
import { setWalletCreated, setUnlocked } from '../../store/slices/authSlice';

const TABS = ['Mnemonic', 'Private Key'];

export default function ImportWalletScreen({ navigation }) {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [mnemonicInput, setMnemonicInput] = useState('');
  const [privateKeyInput, setPrivateKeyInput] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1);
  const [importedWallet, setImportedWallet] = useState(null);
  const [isImporting, setIsImporting] = useState(false); // loading state
  const [isSaving, setIsSaving] = useState(false);       // saving state

  const handleImport = async () => {
    const input = activeTab === 0 ? mnemonicInput.trim() : privateKeyInput.trim();
    if (!input) {
      Alert.alert('Error', activeTab === 0
        ? 'Please enter your recovery phrase.'
        : 'Please enter your private key.'
      );
      return;
    }

    // Show loading immediately
    setIsImporting(true);

    // Small delay so spinner renders before heavy work hits JS thread
    setTimeout(() => {
      try {
        let wallet;
        if (activeTab === 0) {
          wallet = importWalletFromMnemonic(input);
        } else {
          wallet = importWalletFromPrivateKey(input);
        }
        setImportedWallet(wallet);
        setIsImporting(false);
        setStep(2);
      } catch (e) {
        setIsImporting(false);
        Alert.alert('Import Failed', e.message);
      }
    }, 50);
  };

  const handleSaveWallet = async () => {
    if (pin.length < 4) {
      Alert.alert('Weak PIN', 'PIN must be at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN mismatch', 'PINs do not match.');
      return;
    }

    setIsSaving(true);

    try {
      await savePrivateKey(importedWallet.privateKey);
      if (importedWallet.mnemonic) {
        await saveMnemonic(importedWallet.mnemonic);
      }
      await saveAddress(importedWallet.address);
      await savePin(pin);
      await markWalletCreated();

      dispatch(setAddress(importedWallet.address));
      dispatch(setWalletCreated(true));
      dispatch(setUnlocked(true));
    } catch (e) {
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save wallet. Please try again.');
    }
  };

  // ── fuul sernne 
  if (isImporting) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingTitle}>Importing Wallet</Text>
        <Text style={styles.loadingSubtitle}>Verifying your recovery phrase...</Text>
      </View>
    );
  }

  if (isSaving) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingTitle}>Securing Wallet</Text>
        <Text style={styles.loadingSubtitle}>Encrypting and saving your keys...</Text>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Set a PIN</Text>

        {/* Success confirmation */}
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.successTitle}>Wallet found!</Text>
            <Text style={styles.successAddress} numberOfLines={1}>
              {importedWallet?.address}
            </Text>
          </View>
        </View>

        <Text style={styles.subtitle}>
          Set a PIN to lock your wallet. You'll need this every time you open the app.
        </Text>

        <Text style={styles.label}>Enter PIN (min 4 digits)</Text>
        <TextInput
          style={styles.input}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          placeholder="••••"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Confirm PIN</Text>
        <TextInput
          style={styles.input}
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="numeric"
          secureTextEntry
          maxLength={8}
          placeholder="••••"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity
          style={[styles.primaryBtn, isSaving && styles.btnDisabled]}
          onPress={handleSaveWallet}
          disabled={isSaving}>
          <Text style={styles.primaryBtnText}>Import Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Import Wallet</Text>
      <Text style={styles.subtitle}>
        Enter your recovery phrase or private key to restore your wallet.
      </Text>

      <View style={styles.tabRow}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 0 ? (
        <>
          <Text style={styles.label}>Recovery Phrase (12 or 24 words)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={mnemonicInput}
            onChangeText={setMnemonicInput}
            placeholder="Enter your 12 or 24 words separated by spaces..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <Text style={styles.wordCount}>
            {mnemonicInput.trim()
              ? `${mnemonicInput.trim().split(/\s+/).length} words entered`
              : '12 or 24 words required'}
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.label}>Private Key</Text>
          <TextInput
            style={styles.input}
            value={privateKeyInput}
            onChangeText={setPrivateKeyInput}
            placeholder="0x..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </>
      )}

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          🔒 Your keys never leave this device. We never transmit or store them on any server.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          // Validate before enabling
          activeTab === 0
            ? mnemonicInput.trim().split(/\s+/).length < 12 && styles.btnDisabled
            : !privateKeyInput.trim() && styles.btnDisabled,
        ]}
        onPress={handleImport}
        disabled={
          activeTab === 0
            ? mnemonicInput.trim().split(/\s+/).length < 12
            : !privateKeyInput.trim()
        }>
        <Text style={styles.primaryBtnText}>
          {activeTab === 0 ? 'Import with Recovery Phrase' : 'Import with Private Key'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  scroll: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 24, paddingBottom: 48 },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  back: { marginBottom: 24, marginTop: 8 },
  backText: { color: colors.primary, fontSize: 15 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '18',
    borderWidth: 1,
    borderColor: colors.success + '44',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  successIcon: {
    fontSize: 20,
    color: colors.success,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    marginBottom: 2,
  },
  successAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '700' },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  wordCount: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'right',
  },
  warningBox: {
    backgroundColor: '#0A1F2A',
    borderWidth: 1,
    borderColor: '#1A5F7A',
    borderRadius: 10,
    padding: 14,
    marginVertical: 20,
  },
  warningText: { color: '#5BA3C9', fontSize: 13, lineHeight: 20 },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});