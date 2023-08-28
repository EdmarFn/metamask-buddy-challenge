import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWalletContext } from "@/contexts/WalletContext";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useState } from "react";

interface NetworkOption {
  id: string;
  name: string;
}

interface NetworkSwitcherProps {
  networkOptions: NetworkOption[];
  chainId: string;
  onNetworkChange?: (newChainId: string) => void | undefined
}

export const NetworkSwitcher = ({ 
  networkOptions, 
  chainId, 
  onNetworkChange = (newChainId: string) => {}
}: NetworkSwitcherProps) => {
    const { switchNetwork, } = useWalletContext();

  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Add this line

  const handleNetworkChange = async (newChainId: string) => {
    if (newChainId === chainId) {
      return;
    }

    if(isSwitchingNetwork) {
      const toastVisible = toast({
        title: "Network Switch Failed",
        description: "A switch network is already in progress",
        variant: "destructive",
      });

      setTimeout(() => {
        toastVisible.dismiss();
      }, 1500);
      return;
    }

    try {
      setIsSwitchingNetwork(true);
      await switchNetwork(newChainId);
      onNetworkChange(newChainId);
      setIsOpen(false); // Close popover directly
      
      // Show success icon temporarily
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
      
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
    
  };

  // Determine which icon to show
  const getIcon = () => {
    return (
      <div className="relative w-3 h-3">
        <RefreshCw 
          className={`h-3 w-3 text-muted-foreground group-hover:text-primary transition-opacity duration-500 ease-in-out absolute inset-0 ${
            isSwitchingNetwork ? 'opacity-100' : 
            showSuccess ? 'opacity-0' : 'opacity-100'
          }`} 
        />
        <CheckCircle 
          className={`h-3 w-3 text-green-500 transition-opacity duration-500 ease-in-out absolute inset-0 ${
            showSuccess ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-1 hover:bg-muted/50 rounded-full transition-colors duration-200 group"
          title="Switch network"
        >
          {getIcon()}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-3" 
        align="end"
        sideOffset={8}
      >
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
  );
};
