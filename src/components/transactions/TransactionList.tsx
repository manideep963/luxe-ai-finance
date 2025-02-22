
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon, RepeatIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TransactionType = "deposit" | "withdrawal" | "payment";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: "success" | "pending" | "failed";
  date: string;
  description: string;
  tag: "personal" | "business" | "investment";
  category?: string;
  payment_method?: string;
  is_recurring?: boolean;
  recurrence_interval?: string;
  user_id?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onExport?: (format: "csv" | "pdf") => void;
  renderItem?: (transaction: Transaction) => React.ReactNode;
}

const statusVariants = {
  success: "border-green-500 bg-green-500/10 text-green-500",
  pending: "border-yellow-500 bg-yellow-500/10 text-yellow-500",
  failed: "border-red-500 bg-red-500/10 text-red-500",
};

const categoryIcons: Record<string, string> = {
  Food: "🍽️",
  Travel: "✈️",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Utilities: "⚡",
  Rent: "🏠",
  Other: "📦",
};

export function TransactionList({ 
  transactions,
  onExport,
  renderItem
}: TransactionListProps) {
  const defaultRenderItem = (transaction: Transaction) => (
    <motion.div
      key={transaction.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 hover:border-primary/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={cn(
            "p-2 rounded-full",
            transaction.type === "deposit" ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            {transaction.type === "deposit" && <ArrowDownIcon className="w-5 h-5 text-green-500" />}
            {transaction.type === "withdrawal" && <ArrowUpIcon className="w-5 h-5 text-red-500" />}
            {transaction.type === "payment" && <CreditCardIcon className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-foreground font-medium">{transaction.description}</p>
              {transaction.is_recurring && (
                <RepeatIcon className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground text-sm">
                {new Date(transaction.date).toLocaleDateString()}
              </span>
              {transaction.category && (
                <Badge variant="outline" className="text-xs">
                  {categoryIcons[transaction.category]} {transaction.category}
                </Badge>
              )}
              {transaction.payment_method && (
                <Badge variant="outline" className="text-xs">
                  💳 {transaction.payment_method}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={cn(
            "text-foreground font-medium",
            transaction.type === "deposit" ? "text-green-500" : "text-red-500"
          )}>
            {transaction.type === "deposit" ? "+" : "-"}${Math.abs(transaction.amount)}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "border",
              statusVariants[transaction.status]
            )}
          >
            {transaction.status}
          </Badge>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id}>
          {renderItem ? renderItem(transaction) : defaultRenderItem(transaction)}
        </div>
      ))}
    </div>
  );
}
