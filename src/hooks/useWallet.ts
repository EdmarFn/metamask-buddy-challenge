import { useState, useCallback } from 'react';
import { WalletState } from '@/types/wallet';
import { EthereumProvider } from '@/types/ethereum';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    chainId: null,
    balance: null,
  });

  const isMetamaskInstalled = isMetamaskAvailable(window);
  const connect = useCallback(async () => {
    if(walletState.isConnecting) {
      const errorMessage = 'Connection request already pending';
      setWalletState(prev => ({ ...prev, error: errorMessage }));
      console.error(errorMessage);
      return;
    }

    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const { account, chainId, balance } = await getMetadataOfWallet(window.ethereum as EthereumProvider, isMetamaskInstalled);
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
  }, []);


  const disconnect = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      chainId: null,
      balance: null,
    });
  }, []);

  return {
    ...walletState,
    isMetamaskInstalled,
    connect,
    disconnect,
  };
};

function isMetamaskAvailable(window: Window): boolean {
  return window && window.ethereum && window.ethereum.isMetaMask;
}

async function getMetadataOfWallet(ethereum: EthereumProvider, isMetamaskInstalled = isMetamaskAvailable(window)) {
  if(!isMetamaskInstalled) {
    throw new Error('MetaMask is not installed');
  }

  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  }) as string[];

  const account = accounts[0];

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }

  const chainId = await ethereum.request({
    method: 'eth_chainId'
  }) as string;

  const balance = await ethereum.request({
    method: 'eth_getBalance',
    params: [account, 'latest']
  }) as string;

  return {
    account,
    chainId,
    balance,
  };
}