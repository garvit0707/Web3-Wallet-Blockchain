import { ethers } from 'ethers';

const INFURA_KEY = 'c47ef36543ef4b84bf0a0302dd9cc17e';

export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(
    `https://goerli.infura.io/v3/${INFURA_KEY}`
  );
};

// creating wallet
export const createNewWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
  };
};

export const importWalletFromMnemonic = (mnemonic) => {
  try {
    const trimmed = mnemonic.trim().toLowerCase();
    {console.log("triimmed",trimmed)}
    const wallet = ethers.Wallet.fromMnemonic(trimmed);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: trimmed,
    };
  } catch (e) {
    throw new Error('Invalid mnemonic phrase. Please check and try again.');
  }
};


export const importWalletFromPrivateKey = (privateKey) => {
  try {
    const key = privateKey.trim();
    const wallet = new ethers.Wallet(key);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: null,
    };
  } catch (e) {
    throw new Error('Invalid private key. Please check and try again.');
  }
};


export const getEthBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    // v5 uses utils.formatEther
    return ethers.utils.formatEther(balance);
  } catch (e) {
    console.error('Balance fetch error:', e);
    return '0';
  }
};


export const sendEth = async (privateKey, toAddress, amount) => {
  try {
    const provider = getProvider();
    const wallet = new ethers.Wallet(privateKey, provider);

    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amount),
    });

    return {
      hash: tx.hash,
      status: 'pending',
    };
  } catch (e) {
    throw new Error(e.message || 'Transaction failed');
  }
};


export const waitForTransaction = async (txHash) => {
  try {
    const provider = getProvider();
    const receipt = await provider.waitForTransaction(txHash, 1);
    return receipt.status === 1 ? 'success' : 'fail';
  } catch (e) {
    return 'fail';
  }
};

export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};

export const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};