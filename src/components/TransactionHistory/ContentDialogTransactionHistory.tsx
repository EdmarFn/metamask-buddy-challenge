import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types/wallet";
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
  address: string | null;
}

export const ContentDialogTransactionHistory = ({ transactions, isLoading, address }: TransactionHistoryProps) => {
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const formatValue = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue < 0.001) return '< 0.001';
    return numValue.toFixed(6);
  };

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Pending';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!address) return null;

  return (
    <Card className="bg-gradient-card border-border shadow-card transition-all duration-700 ease-in-out">
      <CardHeader className="text-center pb-4">
        <CardDescription>
          Recent transactions for your wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.hash}
                className="border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setExpandedTx(expandedTx === tx.hash ? null : tx.hash)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {tx.type === 'incoming' ? (
                      <ArrowDownLeft className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {tx.type === 'incoming' ? 'Received' : 'Sent'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="text-lg font-bold">
                    {formatValue(tx.value)} ETH
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(tx.timestamp)}
                  </div>
                </div>

                {expandedTx === tx.hash && (
                  <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hash:</span>
                      <code className="font-mono text-xs">{tx.hash.slice(0, 10)}...</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas:</span>
                      <span>{tx.gas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block:</span>
                      <span>{tx.blockNumber || 'Pending'}</span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open("example.com", '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

