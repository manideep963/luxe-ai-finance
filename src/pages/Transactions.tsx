
import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, TagIcon, FilterIcon, TrendingUpIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TransactionFilter = "all" | "business" | "personal" | "investment";

interface Transaction {
  id: string;
  amount: number;
  type: "deposit" | "withdrawal" | "payment";
  status: "success" | "pending" | "failed";
  date: string;
  description: string;
  tag: "personal" | "business" | "investment";
  category?: string;
}

export default function Transactions() {
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const { toast } = useToast();

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', filter],
    queryFn: async () => {
      const query = supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (filter !== 'all') {
        query.eq('tag', filter);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Error fetching transactions",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      return data as Transaction[];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-white">Transactions</h1>
          <div className="flex items-center space-x-4">
            <button className="glass-card p-2 hover:border-neon/30">
              <CalendarIcon className="w-5 h-5 text-white/70" />
            </button>
            <button className="glass-card p-2 hover:border-neon/30">
              <FilterIcon className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex space-x-4">
          {["all", "business", "personal", "investment"].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag as TransactionFilter)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                filter === tag
                  ? "glass-card bg-neon/20 text-neon"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span className="capitalize">{tag}</span>
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="text-white/60">Loading transactions...</div>
        ) : (
          <TransactionList transactions={transactions || []} />
        )}
      </div>
    </DashboardLayout>
  );
}
