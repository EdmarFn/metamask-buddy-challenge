import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, History, X } from "lucide-react";
import { ContentDialogTransactionHistory } from "./ContentDialogTransactionHistory";
import { useState } from "react";

interface ButtonViewTransactionHistoryProps {
  transactions: any[] | null;
  isLoading: boolean;
  address: string | null;
  onFetchTransactions: () => Promise<void>;
}

export const ButtonViewTransactionHistory = ({ 
  transactions, 
  isLoading, 
  address, 
  onFetchTransactions 
}: ButtonViewTransactionHistoryProps) => {
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);

  const handleTransactionHistoryClick = async () => {     
    try {
      await onFetchTransactions();
      setShowTransactionHistory(true);
    } catch (error: any) {
      setShowTransactionHistory(false);
      console.error('Error fetching transaction history:', error);
    }
  };

  return (
    <>
      <div className="pt-2">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-200/50 hover:border-blue-300/70 transition-all duration-300"
          onClick={handleTransactionHistoryClick}
        >
          {isLoading ? (
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

      <Dialog open={showTransactionHistory} onOpenChange={setShowTransactionHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Transaction History</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
            <ContentDialogTransactionHistory
              transactions={transactions}
              isLoading={isLoading}
              address={address}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
