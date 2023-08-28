import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '@/types/wallet';
import { EthereumProvider } from '@/types/ethereum';
import { getWalletMetadata, isMetamaskAvailable } from '@/lib/utils';

// Storage keys for persistence
const STORAGE_KEYS = {
  WALLET_CONNECTED: 'wallet_connected',
} as const;

const INITIAL_WALLET_STATE: WalletState = {
  address: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  chainId: null,
  balance: null,
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);

  const isMetamaskInstalled = isMetamaskAvailable(window);
  const ethereum: EthereumProvider = window.ethereum as EthereumProvider;

  const connect = useCallback(async () => {
    await loadWalletData();
  }, []);

  const disconnect = useCallback(() => {
    clearStoredWalletData();
    setWalletState(INITIAL_WALLET_STATE);
  }, []);

  async function loadWalletData() {
    if(walletState.isConnecting) {
      const errorMessage = 'Connection request already pending';
      setWalletState(prev => ({ ...prev, error: errorMessage }));
      console.error(errorMessage);
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      if(!isMetamaskInstalled) {
        throw new Error('MetaMask is not installed');
      }

      const { account, chainId, balance } = await getWalletMetadata(ethereum);

      localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, 'true');  

      setWalletState({
        address: account,
        chainId,
        balance,
        isConnected: true,
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      console.error('Wallet error when getting metadata of wallet:', error);
      setWalletState(prev => ({ ...prev, isConnecting: false, error: error?.message }));
    }	
  }

  useEffect(() => {
    const storedWalletData = localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED);
    if(storedWalletData) {
      loadWalletData();
    }
    ethereum.on('accountsChanged', (accounts: string[]) => {
      if(accounts.length > 0) {
        setWalletState(prev => ({ ...prev, address: accounts[0] }));
      } else {
        console.error('No account found');
        disconnect();
      }
    });
    ethereum.on('chainChanged', (chainId: string) => {
      if(chainId) {
        setWalletState(prev => ({ ...prev, chainId }));
      } else {
        console.error('No chain found');
        disconnect();
      }
    });
  }, []);

  return {
    ...walletState,
    isMetamaskInstalled,
    connect,
    disconnect,
    
  };
};

function clearStoredWalletData() {
  localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
};


