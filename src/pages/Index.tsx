
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/stats/StatCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AIInsights } from "@/components/insights/AIInsights";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useQuery } from "@tanstack/react-query";
import type { Transaction } from "@/components/transactions/TransactionList";

// Helper function to calculate weekly spending data
const calculateWeeklySpending = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days.map(day => ({
    day,
    amount: Math.floor(Math.random() * 1000) // Placeholder data - replace with actual data
  }));
};

export default function Index() {
  const { toast } = useToast();
  const { 
    financialData, 
    isLoading: isLoadingFinancial,
    updateFinancialData 
  } = useFinancialData();

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
      
      return (data || []).map(transaction => ({
        ...transaction,
        type: transaction.type as Transaction['type'],
        status: transaction.status as Transaction['status'],
        tag: transaction.tag as Transaction['tag']
      })) as Transaction[];
    },
  });

  if (isLoadingFinancial) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-white/60">Loading financial data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!financialData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-white/60">No financial data available. Please add your financial information.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Financial Overview
          </h1>
          <p className="text-white/60 mt-2">Track your financial health and upcoming bills</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Monthly Income"
            value={`$${financialData.monthly_salary.toFixed(2)}`}
            change={{ value: 2.3, trend: "up" }}
            icon={DollarSignIcon}
            isEditable
            onEdit={async (newValue) => {
              await updateFinancialData({ monthly_salary: newValue });
            }}
          />
          <StatCard
            title="Total Savings"
            value={`$${financialData.total_savings.toFixed(2)}`}
            change={{ value: 5.2, trend: "up" }}
            icon={PiggyBankIcon}
            isEditable
            onEdit={async (newValue) => {
              await updateFinancialData({ total_savings: newValue });
            }}
          />
          <StatCard
            title="Monthly Expenses"
            value={`$${financialData.monthly_expenditure.toFixed(2)}`}
            change={{ value: 0.8, trend: "down" }}
            icon={CreditCardIcon}
            isEditable
            onEdit={async (newValue) => {
              await updateFinancialData({ monthly_expenditure: newValue });
            }}
          />
        </div>

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
