
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment";
  status: "success" | "pending" | "failed";
  date: string;
  description: string;
}

const statusColors = {
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glass-card p-4 hover:border-neon/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-neon/10 to-purple/10">
                {transaction.type === "deposit" && "↓"}
                {transaction.type === "withdrawal" && "↑"}
                {transaction.type === "payment" && "→"}
              </div>
              <div>
                <p className="text-white font-medium">{transaction.description}</p>
                <p className="text-white/60 text-sm">{transaction.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-white font-medium">
                {transaction.type === "deposit" ? "+" : "-"}${Math.abs(transaction.amount)}
              </span>
              <Badge className={statusColors[transaction.status]}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
