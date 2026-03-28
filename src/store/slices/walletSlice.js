import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  address: null,
  balance: '0',
  tokens: [],
  transactions: [],
  isLoading: false,
};

const walletSlice = createSlice({
     name: 'wallet',
     initialState,
     reducers: {
        setAddress: (state,action) => {
            state.address = action.payload
        },
        setBalance: (state,action) =>{
            state.balance = action.payload;
        },
        setTokens: (state, action) => { state.tokens = action.payload; },
        addTransaction: (state, action) => { state.transactions.unshift(action.payload); },
        updateTransactionStatus: (state, action) => {
      const tx = state.transactions.find(t => t.hash === action.payload.hash);
      if (tx) tx.status = action.payload.status;
    },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    clearWallet: () => initialState,
     } 
})

export const {
  setAddress, setBalance, setTokens,
  addTransaction, updateTransactionStatus,
  setLoading, clearWallet,
} = walletSlice.actions;

export default walletSlice.reducer;