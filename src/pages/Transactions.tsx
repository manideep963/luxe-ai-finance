import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CalendarIcon, 
  FilterIcon, 
  DownloadIcon, 
  PlusIcon,
  SearchIcon,
  SlidersHorizontalIcon
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { TransactionList, type TransactionType } from "@/components/transactions/TransactionList";
import type { Transaction } from "@/components/transactions/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';

type TransactionFilter = "all" | TransactionType;
type DateRange = "all" | "today" | "week" | "month" | "custom";

interface NewTransaction {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  paymentMethod: string;
  date: string;
  isRecurring: boolean;
}

const categories = [
  "Food",
  "Travel",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Rent",
  "Other"
];

const paymentMethods = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Bank Transfer",
  "Digital Wallet"
];

export default function Transactions() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    description: "",
    amount: "",
    type: "withdrawal",
    category: "Other",
    paymentMethod: "Cash",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false
  });

  const { data: transactions, isLoading, refetch } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const calculateMonthlySummary = () => {
    if (!transactions) return null;

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const currentDate = new Date();
      return (
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const categoryTotals = monthlyTransactions.reduce((acc, t) => {
      if (t.category) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      total: totalSpending,
      topCategories: sortedCategories,
      chartData: Object.entries(categoryTotals).map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalSpending) * 100
      }))
    };
  };

  const monthlySummary = calculateMonthlySummary();

  const handleAddTransaction = async () => {
    try {
      const amount = parseFloat(newTransaction.amount);
      if (!newTransaction.description || isNaN(amount)) {
        toast({
          title: "Invalid Input",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const newTransactionData = {
        id: uuidv4(),
        amount,
        type: newTransaction.type,
        status: "success" as const,
        date: newTransaction.date,
        description: newTransaction.description,
        category: newTransaction.category,
        paymentMethod: newTransaction.paymentMethod,
        tag: "personal" as const,
        user_id: user.id
      };

      const { error } = await supabase
        .from('transactions')
        .insert(newTransactionData);

      if (error) throw error;

      const { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!financialError && financialData) {
        const updates: any = {};
        
        if (newTransaction.type === 'deposit') {
          updates.total_savings = financialData.total_savings + amount;
          updates.monthly_salary = financialData.monthly_salary + amount;
        } else {
          updates.monthly_expenditure = financialData.monthly_expenditure + amount;
        }

        await supabase
          .from('financial_data')
          .update(updates)
          .eq('user_id', user.id);
      }

      await refetch();

      toast({
        title: "Transaction Added",
        description: "Your transaction has been recorded successfully"
      });

      setNewTransaction({
        description: "",
        amount: "",
        type: "withdrawal",
        category: "Other",
        paymentMethod: "Cash",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    toast({
      title: "Export Started",
      description: `Your transactions are being exported in ${format.toUpperCase()} format`
    });
    // Implement actual export logic here
  };

  const COLORS = ['#34D399', '#3B82F6', '#F97316', '#8B5CF6', '#A855F7'];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-2">Manage and track your financial activities</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction(prev => ({ 
                        ...prev, 
                        type: e.target.value as TransactionType 
                      }))}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    >
                      <option value="withdrawal">Expense</option>
                      <option value="deposit">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <select
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
                <Button onClick={handleAddTransaction} className="w-full">
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {monthlySummary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 lg:col-span-2"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">Monthly Summary</h2>
              <div className="space-y-4">
                <p className="text-2xl font-bold text-foreground">
                  Total Spending: ${monthlySummary.total.toFixed(2)}
                </p>
                <div className="space-y-2">
                  {monthlySummary.topCategories.map(([category, amount], index) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {index + 1}. {category}
                      </span>
                      <span className="text-foreground font-medium">
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-foreground mb-4">Spending Breakdown</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={monthlySummary.chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                    >
                      {monthlySummary.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid gap-4 md:flex md:items-center md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 rounded-md border border-input bg-background"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="flex items-center space-x-2"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>CSV</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="flex items-center space-x-2"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading transactions...</div>
        ) : (
          <TransactionList 
            transactions={filteredTransactions}
            onExport={handleExport}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
