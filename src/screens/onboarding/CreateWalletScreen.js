import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
  TextInput, StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';
import { createNewWallet } from '../../services/walletService';
import {
  savePrivateKey, saveMnemonic,
  saveAddress, savePin, markWalletCreated,
} from '../../services/storageService';
import { useDispatch } from 'react-redux';
import { setAddress } from '../../store/slices/walletSlice';
import { setWalletCreated, setUnlocked } from '../../store/slices/authSlice';

export default function CreateWalletScreen({ navigation }) {
  const dispatch = useDispatch();

  const [step, setStep] = useState(1); // 1 = mnemonic, 2 = pin, 3 = loading
  const [wallet, setWallet] = useState(null);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  // useEffect(() => {
  //   // Generate wallet as soon as screen loads
  //   const generated = createNewWallet();
  //   setWallet(generated);
  // }, []);

  useEffect(() => {
  // Let the screen render first, then generate
  const timer = setTimeout(() => {
    const generated = createNewWallet();
    setWallet(generated);
  }, 50);
  return () => clearTimeout(timer);
}, []);
  const handleContinueToPin = () => {
    if (!acknowledged) {
      Alert.alert('Please confirm', 'You must confirm that you have saved your seed phrase.');
      return;
    }
    setStep(2);
  };

  const handleCreateWallet = async () => {
    if (pin.length < 4) {
      Alert.alert('Weak PIN', 'PIN must be at least 4 digits.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('PIN mismatch', 'PINs do not match. Please try again.');
      return;
    }

    setStep(3);

    try {
      await savePrivateKey(wallet.privateKey);
      await saveMnemonic(wallet.mnemonic);
      await saveAddress(wallet.address);
      await savePin(pin);
      console.log("this workss")
      await markWalletCreated();
      dispatch(setAddress(wallet.address));
      dispatch(setWalletCreated(true));
      dispatch(setUnlocked(true));

    } catch (e) {
      Alert.alert('Error', 'Failed to save wallet. Please try again.');
      console.log("eror caiught", e)
      setStep(2);
    }
  };

  // ── Step 3: saving ──
  if (step === 3) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Securing your wallet...</Text>
      </View>
    );
  }

  // ── Step 2: set PIN ──
  if (step === 2) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Set a PIN</Text>
        <Text style={styles.subtitle}>
          This PIN will lock your wallet. Don't forget it.
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

        <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateWallet}>
          <Text style={styles.primaryBtnText}>Create Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Step 1: show mnemonic ──
  // re
return (
  <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}>
    <StatusBar barStyle="light-content" backgroundColor={colors.background} />

    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
      <Text style={styles.backText}>← Back</Text>
    </TouchableOpacity>

    <Text style={styles.title}>Your Secret{'\n'}Recovery Phrase</Text>
    <Text style={styles.subtitle}>
      Write these 12 words down in order and store them somewhere safe.
      Never share them with anyone.
    </Text>

    <View style={styles.warningBox}>
      <Text style={styles.warningText}>
        ⚠️  Anyone with these words can access your wallet forever.
      </Text>
    </View>

    {/* Show spinner while wallet is generating */}
    {!wallet ? (
      <View style={styles.generatingBox}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.generatingText}>Generating secure wallet...</Text>
      </View>
    ) : (
      <View style={styles.mnemonicGrid}>
        {wallet.mnemonic.split(' ').map((word, index) => (
          <View key={index} style={styles.wordBox}>
            <Text style={styles.wordNumber}>{index + 1}</Text>
            <Text style={styles.wordText}>{word}</Text>
          </View>
        ))}
      </View>
    )}

    <TouchableOpacity
      style={[styles.checkRow, acknowledged && styles.checkRowActive]}
      onPress={() => setAcknowledged(!acknowledged)}
      activeOpacity={0.8}>
      <View style={[styles.checkbox, acknowledged && styles.checkboxChecked]}>
        {acknowledged && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={styles.checkLabel}>
        I have safely written down my recovery phrase
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.primaryBtn, (!acknowledged || !wallet) && styles.btnDisabled]}
      onPress={handleContinueToPin}
      disabled={!wallet}>
      <Text style={styles.primaryBtnText}>Continue</Text>
    </TouchableOpacity>
  </ScrollView>
);
  // );
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
  },
  generatingBox: {
  alignItems: 'center',
  paddingVertical: 48,
  gap: 16,
},
generatingText: {
  color: colors.textSecondary,
  fontSize: 14,
},
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 15,
  },
  back: { marginBottom: 24 },
  backText: { color: colors.primary, fontSize: 15 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#2A1A0A',
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  warningText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 20,
  },
  mnemonicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 10,
  },
  wordBox: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  wordNumber: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 4,
  },
  wordText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  checkRowActive: { borderColor: colors.primary },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 18,
    letterSpacing: 6,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});