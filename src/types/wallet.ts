export interface WalletState {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  chainId: string | null;
  balance: string | null;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  nonce: number;
  blockNumber: number | null;
  timestamp: number | null;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'incoming' | 'outgoing';
}

export interface MetamaskError {
  code: number;
  message: string;
}

export type WalletAction = 
  | { type: 'CONNECT_START' }
  | { type: 'CONNECT_SUCCESS'; address: string; chainId: string }
  | { type: 'CONNECT_ERROR'; error: string }
  | { type: 'DISCONNECT' }
  | { type: 'UPDATE_BALANCE'; balance: string };

export interface WalletMetadata {
    account: string;
    chainId: string;
    balance: string;
}