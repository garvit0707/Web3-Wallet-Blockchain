import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, StatusBar,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { getEthBalance, shortenAddress } from '../../services/walletService';
import { loadPrivateKey } from '../../services/storageService';
import { setBalance, setLoading } from '../../store/slices/walletSlice';
import { setUnlocked, setWalletCreated } from '../../store/slices/authSlice';
import { clearWallet } from '../../store/slices/walletSlice';
import Clipboard from '@react-native-clipboard/clipboard';
// import { add } from 'react-native/types_generated/Libraries/Animated/AnimatedExports';

export default function DashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const { address, balance, tokens, transactions, isLoading } = useSelector(s => s.wallet);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchBalance = useCallback(async () => {
    console.log("the add we have iis --------------------------",address)
    if (!address) return;
    dispatch(setLoading(true));
    try {
      const bal = await getEthBalance(address);
      // Round to 6 decimal places
      dispatch(setBalance(parseFloat(bal).toFixed(6)));
    } catch (e) {
      console.error('Failed to fetch balance:', e);
    } finally {
      dispatch(setLoading(false));
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  };

  const handleCopyAddress = () => {
    Clipboard.setString(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLock = () => {
    dispatch(setUnlocked(false));
  };

  const getStatusColor = (status) => {
    if (status === 'success') return colors.success;
    if (status === 'fail') return colors.danger;
    return colors.warning;
  };

  const getStatusIcon = (status) => {
    if (status === 'success') return '✓';
    if (status === 'fail') return '✗';
    return '⏳';
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.txItem}>
      <View style={[styles.txIcon, { backgroundColor: getStatusColor(item.status) + '22' }]}>
        <Text style={[styles.txIconText, { color: getStatusColor(item.status) }]}>
          {item.from?.toLowerCase() === address?.toLowerCase() ? '↑' : '↓'}
        </Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txType}>
          {item.from?.toLowerCase() === address?.toLowerCase() ? 'Sent' : 'Received'}
        </Text>
        <Text style={styles.txAddress}>
          {item.from?.toLowerCase() === address?.toLowerCase()
            ? `To: ${shortenAddress(item.to)}`
            : `From: ${shortenAddress(item.from)}`}
        </Text>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>{parseFloat(item.value).toFixed(4)} ETH</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '22' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusIcon(item.status)} {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.networkBadge}>🟢 Goerli Testnet</Text>
            <Text style={styles.headerTitle}>My Wallet</Text>
          </View>
          <TouchableOpacity style={styles.lockBtn} onPress={handleLock}>
            <Text style={styles.lockIcon}>🔒</Text>
          </TouchableOpacity>
        </View>

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginVertical: 12 }}
            />
          ) : (
            <Text style={styles.balanceAmount}>
              {balance} <Text style={styles.balanceCurrency}>ETH</Text>
            </Text>
          )}

          <Text style={styles.balanceUsd}>Goerli Testnet — not real ETH</Text>

       
          <TouchableOpacity style={styles.addressRow} onPress={handleCopyAddress}>
            <Text style={styles.addressText}>{shortenAddress(address)}</Text>
            <Text style={styles.copyBtn}>{copied ? '✓ Copied' : '⎘ Copy'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Action Buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Send')}>
            <View style={styles.actionIconWrap}>
              <Text style={styles.actionIcon}>↑</Text>
            </View>
            <Text style={styles.actionLabel}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Receive')}>
            <View style={styles.actionIconWrap}>
              <Text style={styles.actionIcon}>↓</Text>
            </View>
            <Text style={styles.actionLabel}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={fetchBalance}>
            <View style={styles.actionIconWrap}>
              <Text style={styles.actionIcon}>↻</Text>
            </View>
            <Text style={styles.actionLabel}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tokens</Text>
          </View>

          <View style={styles.tokenItem}>
            <View style={styles.tokenIconWrap}>
              <Text style={styles.tokenIcon}>Ξ</Text>
            </View>
            <View style={styles.tokenInfo}>
              <Text style={styles.tokenName}>Ethereum</Text>
              <Text style={styles.tokenNetwork}>Goerli Testnet</Text>
            </View>
            <Text style={styles.tokenBalance}>{balance} ETH</Text>
          </View>
          {console.log("token we have is here",tokens)}
          {tokens.length === 0 && (
            <Text style={styles.emptyText}>No custom tokens added yet</Text>
          )}

          {tokens.map((token, i) => (
            <View key={i} style={styles.tokenItem}>
              <View style={[styles.tokenIconWrap, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.tokenIcon, { color: colors.primary }]}>
                  {token.symbol.slice(0, 2)}
                </Text>
              </View>
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenName}>{token.name}</Text>
                <Text style={styles.tokenNetwork}>{token.symbol}</Text>
              </View>
              <Text style={styles.tokenBalance}>{token.balance}</Text>
            </View>
          ))}
        </View>

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyTx}>
              <Text style={styles.emptyTxIcon}>📭</Text>
              <Text style={styles.emptyTxText}>No transactions yet</Text>
              <Text style={styles.emptyTxSub}>
                Send or receive ETH to see your history here
              </Text>
            </View>
          ) : (
            transactions.slice(0, 10).map((tx, i) => (
              <View key={i}>
                {renderTransaction({ item: tx })}
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  networkBadge: {
    fontSize: 12,
    color: colors.success,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lockBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: { fontSize: 18 },


  balanceCard: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  balanceCurrency: {
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  balanceUsd: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  addressText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  copyBtn: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: { fontSize: 22, color: '#fff', fontWeight: '700' },
  actionLabel: { fontSize: 13, color: colors.textSecondary },

  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  tokenIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIcon: { fontSize: 18, color: '#627EEA', fontWeight: '700' },
  tokenInfo: { flex: 1 },
  tokenName: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  tokenNetwork: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  tokenBalance: { fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    padding: 20,
  },


  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txIconText: { fontSize: 18, fontWeight: '700' },
  txInfo: { flex: 1 },
  txType: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  txAddress: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyTx: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  emptyTxIcon: { fontSize: 36, marginBottom: 12 },
  emptyTxText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  emptyTxSub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});