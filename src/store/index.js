import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer:{
        wallet: walletReducer,
    auth: authReducer,
    }
})