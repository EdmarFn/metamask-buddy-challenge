import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWallet } from "../hooks/useWallet";
import { useToast } from "../hooks/use-toast";
import { Wallet, ExternalLink, AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

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
    isMetamaskInstalled,
    switchNetwork
  } = useWallet();

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);

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

  const handleNetworkChange = async (newChainId: string) => {
    if (newChainId !== chainId) {
      try {
        setIsSwitchingNetwork(true);
        
        await switchNetwork(newChainId);
        
        // Success - close the popover (you might need to add state for this)
        console.log('Successfully switched to network:', newChainId);
      } catch (error: any) {
        // Handle different types of errors
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
            </div>
          )}

          <div className="flex gap-2">
            {!isConnected ? (
              <Button 
                onClick={connect}
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
                onClick={disconnect}
                className="flex-1 transition-all duration-700 ease-in-out transform hover:scale-110 hover:bg-destructive hover:text-destructive-foreground active:scale-90 active:rotate-1"
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