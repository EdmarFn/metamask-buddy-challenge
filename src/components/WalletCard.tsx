import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NetworkSwitcher } from "./NetworkSwitcher";
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Loader2, History, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import { ButtonViewTransactionHistory } from "./TransactionHistory/ButtonViewTransactionHistory";

export const WalletCard = () => {

  const { 
    address, 
    isConnected, 
    isConnecting, 
    error, 
    chainId, 
    balance,
    connect, 
    disconnect,
    isMetamaskInstalled,
  } = useWalletContext();

  const [showWalletData, setShowWalletData] = useState(false);

  const handleConnect = async () => {
      await connect();
  };

  const handleDisconnect = () => {
    setShowWalletData(false);
    setTimeout(() => {
      disconnect();
    }, 300);
  };

  useEffect(() => {
    if(isConnected) {
      setTimeout(() => {
        setShowWalletData(true);
      }, 300);
    }
  }, [isConnected]);

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
                      <NetworkSwitcher
                        networkOptions={networkOptions}
                        chainId={chainId}
                      />
                    </div>
                  </div>
                )}
                
                {balance && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Balance</span>
                    <span className="text-sm font-mono">{balance} ETH</span>
                  </div>
                )}
                
                {/* Replace the button with the enhanced component */}
                <ButtonViewTransactionHistory/>
              </div>
            )}
          </div>

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
    </div>
  );
};