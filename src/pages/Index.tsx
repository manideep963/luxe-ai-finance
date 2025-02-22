
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSignIcon, 
  PiggyBankIcon, 
  CreditCardIcon,
  ChartBarIcon,
  BellIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  PlusIcon
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/stats/StatCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AIInsights } from "@/components/insights/AIInsights";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";

export default function Index() {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState({
    monthly_salary: 0,
    total_savings: 0,
    monthly_expenditure: 0,
    budget: 3000, // Example monthly budget
  });

  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ['monthly-financial-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setFinancialData(prev => ({
          ...prev,
          monthly_salary: data.monthly_salary,
          total_savings: data.total_savings,
          monthly_expenditure: data.monthly_expenditure,
        }));
      }
    },
  });

  // Weekly spending data based on actual transactions
  const calculateWeeklySpending = () => {
    if (!transactions) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = new Array(7).fill(0).map((_, index) => ({
      day: days[index],
      amount: 0
    }));

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate >= oneWeekAgo && transactionDate <= now) {
        const dayIndex = transactionDate.getDay();
        if (transaction.type === 'withdrawal') {
          weeklyData[dayIndex].amount += transaction.amount;
        }
      }
    });

    return weeklyData;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Financial Overview
          </h1>
          <p className="text-white/60 mt-2">Track your financial health and upcoming bills</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Monthly Income"
            value={`$${financialData.monthly_salary.toFixed(2)}`}
            change={{ value: 2.3, trend: "up" }}
            icon={DollarSignIcon}
          />
          <StatCard
            title="Total Savings"
            value={`$${financialData.total_savings.toFixed(2)}`}
            change={{ value: 5.2, trend: "up" }}
            icon={PiggyBankIcon}
          />
          <StatCard
            title="Monthly Expenses"
            value={`$${financialData.monthly_expenditure.toFixed(2)}`}
            change={{ value: 0.8, trend: "down" }}
            icon={CreditCardIcon}
          />
        </div>

        {/* Weekly Spending Trends */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Spending Trends</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calculateWeeklySpending()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00E6E6" 
                  strokeWidth={2}
                  dot={{ fill: '#00E6E6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Recent Transactions</span>
              </h2>
            </div>
            {isLoadingTransactions ? (
              <div>Loading transactions...</div>
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>

          <div className="lg:col-span-1">
            <AIInsights financialData={financialData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
