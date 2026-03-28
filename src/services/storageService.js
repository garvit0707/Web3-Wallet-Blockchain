import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PRIVATE_KEY: 'web3wallet_private_key',
  ADDRESS: 'web3wallet_address',
  MNEMONIC: 'web3wallet_mnemonic',
  PIN: 'web3wallet_pin',
  WALLET_CREATED: 'web3wallet_created',
};


export const savePrivateKey = async (privateKey) => {
  await Keychain.setGenericPassword(
    KEYS.PRIVATE_KEY,
    privateKey,
    {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: KEYS.PRIVATE_KEY,
    }
  );
};


export const loadPrivateKey = async () => {
  const creds = await Keychain.getGenericPassword({
    service: KEYS.PRIVATE_KEY,
  });
  return creds ? creds.password : null;
};


export const saveMnemonic = async (mnemonic) => {
  await Keychain.setGenericPassword(
    KEYS.MNEMONIC,
    mnemonic,
    {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: KEYS.MNEMONIC,
    }
  );
};


export const loadMnemonic = async () => {
  const creds = await Keychain.getGenericPassword({
    service: KEYS.MNEMONIC,
  });
  return creds ? creds.password : null;
};


export const savePin = async (pin) => {
  // Simple hash — in production use bcrypt or similar
  const hashed = pin.split('').reverse().join('') + pin.length + '##';
  await Keychain.setGenericPassword(
    KEYS.PIN,
    hashed,
    { service: KEYS.PIN }
  );
};


export const verifyPin = async (pin) => {
  const creds = await Keychain.getGenericPassword({ service: KEYS.PIN });
  if (!creds) return false;
  const hashed = pin.split('').reverse().join('') + pin.length + '##';
  return creds.password === hashed;
};

export const saveAddress = async (address) => {
  await AsyncStorage.setItem(KEYS.ADDRESS, address);
};

export const loadAddress = async () => {
  return await AsyncStorage.getItem(KEYS.ADDRESS);
};

export const markWalletCreated = async () => {
  await AsyncStorage.setItem(KEYS.WALLET_CREATED, 'true');
};

export const isWalletCreated = async () => {
  const val = await AsyncStorage.getItem(KEYS.WALLET_CREATED);
  return val === 'true';
};

export const clearAllData = async () => {
  await Keychain.resetGenericPassword({ service: KEYS.PRIVATE_KEY });
  await Keychain.resetGenericPassword({ service: KEYS.MNEMONIC });
  await Keychain.resetGenericPassword({ service: KEYS.PIN });
  await AsyncStorage.multiRemove([KEYS.ADDRESS, KEYS.WALLET_CREATED]);
};