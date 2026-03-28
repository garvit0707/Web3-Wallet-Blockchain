import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Vibration,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../theme/colors';
import { verifyPin } from '../../services/storageService';
import { setUnlocked } from '../../store/slices/authSlice';

const PIN_LENGTH = 4;

// considerting the keypaid array's
const KEYPAD = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function LockScreen() {
  const dispatch = useDispatch();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleVerify(pin);
    }
  }, [pin]);

  const handleVerify = async (enteredPin) => {
    const isValid = await verifyPin(enteredPin);
    if (isValid) {
      setError('');
      dispatch(setUnlocked(true));
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin('');
      setShaking(true);
      Vibration.vibrate(400);

      setTimeout(() => setShaking(false), 500);

      if (newAttempts >= 5) {
        setError(`Too many attempts. Try again later.`);
      } else {
        setError(`Incorrect PIN. ${5 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleKeyPress = (key) => {
    if (key === '⌫') {
      setPin(prev => prev.slice(0, -1));
      setError('');
      return;
    }
    if (key === '') return;
    if (pin.length >= PIN_LENGTH) return;
    setPin(prev => prev + key);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={styles.top}>
        <Text style={styles.logo}>🔐</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Enter your PIN to unlock</Text>
      </View>

      <View style={[styles.dotsRow, shaking && styles.shake]}>
        {Array(PIN_LENGTH).fill(0).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < pin.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

    {console.log("error logssssss ------------------------",error)}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <Text style={styles.errorPlaceholder}> </Text>
      )}

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYPAD.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.key,
                  key === '' && styles.keyEmpty,
                  key === '⌫' && styles.keyBackspace,
                ]}
                onPress={() => handleKeyPress(key)}
                disabled={key === '' || attempts >= 5}
                activeOpacity={0.7}>
                <Text style={[
                  styles.keyText,
                  key === '⌫' && styles.keyBackspaceText,
                ]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  top: { alignItems: 'center', gap: 8 },
  logo: { fontSize: 48, marginBottom: 8 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // PIN dots
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 8,
  },
  shake: {
    marginLeft: 10,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: 'center',
    minHeight: 20,
  },
  errorPlaceholder: { minHeight: 20 },

  // Keypad
  keypad: { width: '100%', maxWidth: 300, gap: 12 },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  key: {
    flex: 1,
    height: 72,
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyBackspace: {
    backgroundColor: colors.surface,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  keyBackspaceText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
});