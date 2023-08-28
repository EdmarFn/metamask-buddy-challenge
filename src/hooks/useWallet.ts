import { useState, useCallback } from 'react';
import { WalletState } from '@/types/wallet';

function isMetamaskInstalled(window: Window): boolean {
  return window && window.ethereum && window.ethereum.isMetaMask;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    chainId: null,
    balance: null,
  });

  const flagMetamaskInstalled = isMetamaskInstalled(window);

  // TODO: Implement wallet connection
  const connect = useCallback(async () => {
    // Implementation needed:
    // 1. Check if MetaMask is installed
    // 2. Request account access using eth_requestAccounts
    // 3. Get account address and chain ID
    // 4. Get account balance using eth_getBalance 
    // 5. Update wallet state
    // 6. Handle errors appropriately
    
    console.log('Connect wallet - TO BE IMPLEMENTED');
  }, []);

  // TODO: Implement wallet disconnection
  const disconnect = useCallback(() => {
    // Implementation needed:
    // Reset wallet state to initial values
    
    console.log('Disconnect wallet - TO BE IMPLEMENTED');
  }, []);

  return {
    ...walletState,
    flagMetamaskInstalled,
    connect,
    disconnect,
  };
};