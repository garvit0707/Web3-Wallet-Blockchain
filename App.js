// import React from 'react';
// import { Provider } from 'react-redux';
// import 'react-native-gesture-handler';
// import 'react-native-get-random-values';
// import '@ethersproject/shims';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// import { store } from './src/store';
// import AppNavigator from './src/navigation/AppNavigator';

// export default function App() {
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <Provider store={store}>
//         <AppNavigator />
//       </Provider>
//     </GestureHandlerRootView>
//   );
// }

import 'react-native-get-random-values';
import '@ethersproject/shims';
import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadAddress, isWalletCreated as checkWalletCreated } from './src/services/storageService';
import { setAddress } from './src/store/slices/walletSlice';
import { setWalletCreated } from './src/store/slices/authSlice';

// Separate components m
function AppInner() {
  const dispatch = useDispatch();

  useEffect(() => {
    const rehydrate = async () => {
      const created = await checkWalletCreated();
      if (created) {
        const address = await loadAddress();
        if (address) dispatch(setAddress(address));
        dispatch(setWalletCreated(true));
      }
    };
    rehydrate();
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </GestureHandlerRootView>
  );
} 