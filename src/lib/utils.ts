import { EthereumProvider } from "@/types/ethereum";
import { WalletMetadata } from "@/types/wallet";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isMetamaskAvailable(window: Window): boolean {
  return Boolean(window?.ethereum?.isMetaMask);
}

export async function getWalletMetadata(
  ethereum: EthereumProvider
): Promise<WalletMetadata> {
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts'
  }) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found');
  }

  const account = accounts[0];
  const chainId = await ethereum.request({
    method: 'eth_chainId'
  }) as string;

  const balance = await ethereum.request({
    method: 'eth_getBalance',
    params: [account, 'latest']
  }) as string;

  return { account, chainId, balance };
}

