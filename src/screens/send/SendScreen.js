import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Alert,
  ActivityIndicator, ScrollView, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { sendEth, isValidAddress, waitForTransaction } from '../../services/walletService';
import { loadPrivateKey } from '../../services/storageService';
import { addTransaction, updateTransactionStatus } from '../../store/slices/walletSlice';

const STEPS = { INPUT: 1, CONFIRM: 2, SENDING: 3, DONE: 4 };

export default function SendScreen({ navigation }) {
  const dispatch = useDispatch();
  const { address, balance } = useSelector(s => s.wallet);

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(STEPS.INPUT);
  const [txHash, setTxHash] = useState('');
  const [txStatus, setTxStatus] = useState('pending');
  const [error, setError] = useState('');

  const validateInput = () => {
    setError('');
    if (!toAddress.trim()) {
      setError('Please enter a recipient address.');
      return false;
    }
    if (!isValidAddress(toAddress.trim())) {
      setError('Invalid Ethereum address.');
      return false;
    }
    if (toAddress.toLowerCase() === address.toLowerCase()) {
      setError('Cannot send to your own address.');
      return false;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.');
      return false;
    }
    if (parseFloat(amount) > parseFloat(balance)) {
      setError('Insufficient balance.');
      return false;
    }
    return true;
  };

  const handleReview = () => {
    if (validateInput()) setStep(STEPS.CONFIRM);
  };

  const handleSend = async () => {
    setStep(STEPS.SENDING);
    try {
      const privateKey = await loadPrivateKey();
      if (!privateKey) throw new Error('Could not load wallet key.');

      const result = await sendEth(privateKey, toAddress.trim(), amount);
      setTxHash(result.hash);

      // Add to Redux as pending
      dispatch(addTransaction({
        hash: result.hash,
        from: address,
        to: toAddress.trim(),
        value: amount,
        status: 'pending',
        timestamp: Date.now(),
      }));

      setStep(STEPS.DONE);
      setTxStatus('pending');

      // Wait for confirmation in background
      waitForTransaction(result.hash).then(status => {
        setTxStatus(status);
        dispatch(updateTransactionStatus({ hash: result.hash, status }));
      });

    } catch (e) {
      Alert.alert('Transaction Failed', e.message);
      setStep(STEPS.CONFIRM);
    }
  };

  const handleReset = () => {
    setToAddress('');
    setAmount('');
    setTxHash('');
    setTxStatus('pending');
    setError('');
    setStep(STEPS.INPUT);
  };


  if (step === STEPS.SENDING) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.sendingTitle}>Broadcasting Transaction</Text>
        <Text style={styles.sendingSubtitle}>Sending to the Goerli network...</Text>
      </View>
    );
  }

  if (step === STEPS.DONE) {
    {console.log("the steps we have",step)}
    return (
      <View style={styles.centered}>
        <View style={[
          styles.doneIcon,
          txStatus === 'success' && styles.doneIconSuccess,
          txStatus === 'fail' && styles.doneIconFail,
        ]}>
          <Text style={styles.doneIconText}>
            {txStatus === 'pending' ? '⏳' : txStatus === 'success' ? '✓' : '✗'}
          </Text>
        </View>

        <Text style={styles.doneTitle}>
          {txStatus === 'pending' ? 'Transaction Sent!' :
           txStatus === 'success' ? 'Confirmed!' : 'Transaction Failed'}
        </Text>

        <Text style={styles.doneSubtitle}>
          {txStatus === 'pending'
            ? 'Waiting for network confirmation...'
            : txStatus === 'success'
            ? 'Your transaction was confirmed on-chain.'
            : 'Transaction was rejected by the network.'}
        </Text>

        {txHash ? (
          <View style={styles.hashBox}>
            <Text style={styles.hashLabel}>Transaction Hash</Text>
            <Text style={styles.hashValue} numberOfLines={2}>{txHash}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.primaryBtn} onPress={handleReset}>
          <Text style={styles.primaryBtnText}>Send Another</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.secondaryBtnText}>Back to Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === STEPS.CONFIRM) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <TouchableOpacity style={styles.back} onPress={() => setStep(STEPS.INPUT)}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Confirm Transaction</Text>

        <View style={styles.confirmCard}>
          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>From</Text>
            <Text style={styles.confirmValue} numberOfLines={1}>
              {address?.slice(0, 10)}...{address?.slice(-6)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.arrowWrap}>
            <Text style={styles.arrow}>↓</Text>
          </View>

          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>To</Text>
            <Text style={styles.confirmValue} numberOfLines={1}>
              {toAddress.slice(0, 10)}...{toAddress.slice(-6)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Amount</Text>
            <Text style={[styles.confirmValue, styles.confirmAmount]}>
              {amount} ETH
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Network</Text>
            <Text style={styles.confirmValue}>Goerli Testnet</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.confirmRow}>
            <Text style={styles.confirmLabel}>Gas fee</Text>
            <Text style={styles.confirmValue}>~0.001 ETH (est.)</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️  Double-check the recipient address. Transactions cannot be reversed.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSend}>
          <Text style={styles.primaryBtnText}>Confirm & Send</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleReset}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

 
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />

        <Text style={styles.title}>Send ETH</Text>

        <View style={styles.balanceHint}>
          <Text style={styles.balanceHintText}>
            Available: <Text style={styles.balanceHintValue}>{balance} ETH</Text>
          </Text>
        </View>

        <Text style={styles.label}>Recipient Address</Text>
        <TextInput
          style={[styles.input, error && toAddress && styles.inputError]}
          value={toAddress}
          onChangeText={(t) => { setToAddress(t); setError(''); }}
          placeholder="0x..."
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Amount (ETH)</Text>
        <View style={styles.amountRow}>
          <TextInput
            style={[styles.input, styles.amountInput, error && amount && styles.inputError]}
            value={amount}
            onChangeText={(t) => { setAmount(t); setError(''); }}
            placeholder="0.0"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={styles.maxBtn}
            onPress={() => setAmount(
              Math.max(0, parseFloat(balance) - 0.001).toFixed(6).toString()
            )}>
            <Text style={styles.maxBtnText}>MAX</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!toAddress || !amount) && styles.btnDisabled,
          ]}
          onPress={handleReview}
          disabled={!toAddress || !amount}>
          <Text style={styles.primaryBtnText}>Review Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    padding: 24,
    gap: 12,
  },
  back: { marginBottom: 24, marginTop: 8 },
  backText: { color: colors.primary, fontSize: 15 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  balanceHint: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  balanceHintText: { color: colors.textSecondary, fontSize: 13 },
  balanceHintValue: { color: colors.primary, fontWeight: '700' },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 8, marginTop: 8 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 15,
    flex: 1,
  },
  inputError: { borderColor: colors.danger },
  amountRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  amountInput: { flex: 1 },
  maxBtn: {
    backgroundColor: colors.primary + '22',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: colors.primary + '44',
  },
  maxBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: 8 },

  confirmCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  confirmLabel: { color: colors.textSecondary, fontSize: 14 },
  confirmValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  confirmAmount: { color: colors.primary, fontSize: 18, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border },
  arrowWrap: { alignItems: 'center', paddingVertical: 4 },
  arrow: { color: colors.textMuted, fontSize: 18 },

  warningBox: {
    backgroundColor: '#2A1A0A',
    borderWidth: 1,
    borderColor: colors.warning + '66',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  warningText: { color: colors.warning, fontSize: 13, lineHeight: 20 },


  doneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warning + '22',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  doneIconSuccess: { backgroundColor: colors.success + '22' },
  doneIconFail: { backgroundColor: colors.danger + '22' },
  doneIconText: { fontSize: 36 },
  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  doneSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  hashBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginTop: 8,
  },
  hashLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 6 },
  hashValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  secondaryBtnText: { color: colors.textPrimary, fontSize: 15 },
  cancelBtn: { padding: 16, alignItems: 'center', marginTop: 4 },
  cancelBtnText: { color: colors.danger, fontSize: 15 },
  btnDisabled: { opacity: 0.4 },
  sendingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sendingSubtitle: { fontSize: 14, color: colors.textSecondary },
});