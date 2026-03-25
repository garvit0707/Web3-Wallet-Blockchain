import { createSlice } from '@reduxjs/toolkit';



const initialState = {
  isWalletCreated: false,
  isUnlocked: false,
  hasBiometrics: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setWalletCreated: (state, action) => 
        { 
            state.isWalletCreated = action.payload; 
        },
    setUnlocked: (state, action) => 
        { 
            state.isUnlocked = action.payload; 
        },
    setHasBiometrics: (state, action) => 
        { 
            state.hasBiometrics = action.payload; 
        },
  },
});



export const { setWalletCreated, setUnlocked, setHasBiometrics } = authSlice.actions;
export default authSlice.reducer;