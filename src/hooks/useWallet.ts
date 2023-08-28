import { useState, useCallback, useEffect } from 'react';
import { WalletState } from '@/types/wallet';
import { EthereumProvider } from '@/types/ethereum';
import { getWalletMetadata, isMetamaskAvailable } from '@/lib/utils';
import { transactionService } from '@/services/transactionService';

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
  transactions: null,
  isLoadingTransactions: false,
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
        transactions: null,
        isLoadingTransactions: false,
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

  const switchNetwork = useCallback(async (targetChainId: string) => {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    });
    await loadWalletData();
  }, []);

  const fetchTransactionHistory = useCallback(async () => {
    if (!walletState.chainId) return;
    
    if (walletState.isLoadingTransactions) {
      console.log('Already loading transactions, ignoring request');
      return;
    }

    setWalletState(prev => ({ ...prev, isLoadingTransactions: true }));

    try {
      const transactions = await transactionService.fetchTransactionHistory(
        walletState.address, 
        window.ethereum
      );
      setWalletState(prev => ({ 
        ...prev, 
        transactions,
        isLoadingTransactions: false 
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      setWalletState(prev => ({ 
        ...prev, 
        isLoadingTransactions: false 
      }));
      throw error;
    }
  }, [walletState.address, walletState.chainId]);

  return {
    ...walletState,
    isMetamaskInstalled,
    connect,
    disconnect,
    switchNetwork,
    fetchTransactionHistory
  };
};

function clearStoredWalletData() {
  localStorage.removeItem(STORAGE_KEYS.WALLET_CONNECTED);
};


