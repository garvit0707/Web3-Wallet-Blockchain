web3 app: A mobile Web3 wallet app which Supports wallet creation, import, ETH balance display, and token transfers on the Goerli testnet.


Core features:
Create a new wallet (generates 12-word mnemonic)
Import wallet via mnemonic or private key
PIN-based app lock screen
View ETH balance (Goerli testnet, auto-refreshes every 30s)
Send ETH with confirmation step
Receive screen with QR code and address copy
Transaction history (pending / success / fail)
Encrypted private key storage (never leaves the device)


run comd:
npx react-native run-android

folder st:
src/
├── navigation/        
├── screens/
│   ├── onboarding/    
│   ├── auth/         
│   ├── dashboard/     
│   ├── send/          
│   └── receive/      
├── store/             
├── services/          
└── theme/ 
