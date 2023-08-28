import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWallet } from "../hooks/useWallet";
import { useToast } from "../hooks/use-toast";
import { TransactionHistory } from "./TransactionHistory";
import { Transaction } from "@/types/wallet";
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Loader2, RefreshCw, History, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";

export const WalletCard = () => {
  const { toast } = useToast();

  const { 
    address, 
    isConnected, 
    isConnecting, 
    error, 
    chainId, 
    balance,
    connect, 
    disconnect,
    isLoadingTransactions, 
    isMetamaskInstalled,
    switchNetwork,
    fetchTransactionHistory,
    transactions
  } = useWallet();

  const [showWalletData, setShowWalletData] = useState(false);

  const handleConnect = async () => {
      await connect();
  };

  const handleDisconnect = () => {
    setShowWalletData(false);
    setTimeout(() => {
      disconnect();
    }, 300); // 300ms delay
  };

  useEffect(() => {
    if(isConnected) {
      setTimeout(() => {
        setShowWalletData(true);
      }, 300);
    }
  }, [isConnected]);

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const formatAddress = (addr: string): string => {
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const networkOptions = [
    { id: '0x1', name: 'Ethereum Mainnet' },
    { id: '0x5', name: 'Goerli Testnet' },
    { id: '0xaa36a7', name: 'Sepolia Testnet' },
    { id: '0x89', name: 'Polygon Mainnet' },
    { id: '0x13881', name: 'Mumbai Testnet' },
  ];

  const getChainName = (id: string): string => {
    const network = networkOptions.find(network => network.id === id);
    return network?.name || `Chain ${id}`;
  };

  const handleTransactionHistoryClick = async () => {     
    try {
      await fetchTransactionHistory();
      setShowTransactionHistory(true);
    } catch (error: any) {
      setShowTransactionHistory(false);
      console.error('Error fetching transaction history:', error);
      toast({
        title: "Loading Transaction History Failed",
        description: error.message || "Failed to fetch transaction history",
        variant: "destructive",
      });
    }
  };

  const handleNetworkChange = async (newChainId: string) => {
    if (newChainId !== chainId) {
      try {
        setIsSwitchingNetwork(true);
        
        await switchNetwork(newChainId);
        
        console.log('Successfully switched to network:', newChainId);
      } catch (error: any) {
        let errorMessage = 'Failed to switch network';
        
        if (error.code === 4001) {
          errorMessage = 'Network switch was rejected by user';
        } else if (error.code === 4902) {
          errorMessage = 'Network not found. Please add it to MetaMask first.';
        } else if (error.message?.includes('User rejected')) {
          errorMessage = 'Network switch was cancelled';
        } else if (error.message?.includes('already pending')) {
          errorMessage = 'Network switch already in progress';
        } else if (error.message) {
          errorMessage = error.message;
        }
       
        const toastVisible = toast({
          title: "Network Switch Failed",
          description: errorMessage,
          variant: "destructive",
        });

        setTimeout(() => {
          toastVisible.dismiss();
        }, 1500);

        console.error('Network switch error:', error);
      } finally {
        setIsSwitchingNetwork(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="bg-gradient-card border-border shadow-card transition-all duration-700 ease-in-out">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-crypto">
            <Wallet className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl font-bold">MetaMask Wallet</CardTitle>
          <CardDescription>
            Connect your MetaMask wallet to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!isMetamaskInstalled && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                MetaMask not detected. Please{" "}
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  install MetaMask <ExternalLink className="h-3 w-3" />
                </a>{" "}
                to continue.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Wallet Data with Smooth Transitions */}
          <div 
            className={`transition-all duration-500 ease-in-out transform ${
              showWalletData && isConnected && address
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            {isConnected && address && (
              <div className="space-y-3 rounded-lg bg-muted/30 p-4 transition-all duration-800 ease-out transform">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Status</span>
                  <Badge variant="default" className="bg-gradient-success text-white">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Address</span>
                  <code className="text-sm font-mono">{formatAddress(address)}</code>
                </div>
                
                {chainId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Network</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{getChainName(chainId)}</span>
                      
                      {/* Network switcher popover */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="p-1 hover:bg-muted/50 rounded-full transition-colors duration-200 group"
                            title="Switch network"
                          >
                            <RefreshCw className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="end">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Select Network</h4>
                            <div className="space-y-1">
                              {networkOptions.map((network) => (
                                <button
                                  key={network.id}
                                  onClick={() => handleNetworkChange(network.id)}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    network.id === chainId
                                      ? 'bg-primary text-primary-foreground'
                                      : 'hover:bg-muted'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span>{network.name}</span>
                                    {network.id === chainId && (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
                
                {balance && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Balance</span>
                    <span className="text-sm font-mono">{balance} ETH</span>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-200/50 hover:border-blue-300/70 transition-all duration-300"
                    onClick={handleTransactionHistoryClick}
                  >
                    {isLoadingTransactions ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading transactions...
                      </>
                    ) : (
                      <>
                        <History className="mr-2 h-4 w-4 text-blue-600" />
                        View Transaction History
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Connect/Disconnect Buttons */}
          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                onClick={handleConnect}
                disabled={!isMetamaskInstalled || isConnecting}
                className="flex-1 bg-gradient-crypto hover:shadow-glow transition-all duration-200"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                className="flex-1 transition-all duration-500 ease-in-out transform hover:scale-110 hover:bg-destructive hover:text-destructive-foreground active:scale-90 active:rotate-1"
              >
                Disconnect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Dialog */}
      <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Transaction History</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTransactionHistory(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            <TransactionHistory
              transactions={transactions}
              isLoading={isLoadingTransactions}
              address={address}
              chainId={chainId}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};