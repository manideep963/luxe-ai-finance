
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSignIcon, PiggyBankIcon, CreditCardIcon, ChartBarIcon, PlusIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/stats/StatCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AIInsights } from "@/components/insights/AIInsights";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Mock transactions data
const mockTransactions = [
  {
    id: "1",
    amount: 2500,
    type: "deposit" as const,
    status: "success" as const,
    date: "2024-03-20",
    description: "Monthly Salary",
    tag: "personal" as const,
  },
  {
    id: "2",
    amount: 85,
    type: "payment" as const,
    status: "pending" as const,
    date: "2024-03-19",
    description: "Netflix Subscription",
    tag: "personal" as const,
  },
  {
    id: "3",
    amount: 150,
    type: "withdrawal" as const,
    status: "failed" as const,
    date: "2024-03-18",
    description: "ATM Withdrawal",
    tag: "personal" as const,
  },
];

const Index = () => {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState({
    monthly_salary: 0,
    total_savings: 0,
    monthly_expenditure: 0
  });
  const [newExpenditure, setNewExpenditure] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFinancialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('financial_data')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch financial data",
      });
      return;
    }

    if (data) {
      setFinancialData(data);
    }
  };

  const handleAddExpenditure = async () => {
    if (!newExpenditure || loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const amount = parseFloat(newExpenditure);
      const newTotal = financialData.monthly_expenditure + amount;

      const { error } = await supabase
        .from('financial_data')
        .update({ monthly_expenditure: newTotal })
        .eq('user_id', user.id);

      if (error) throw error;

      setFinancialData(prev => ({
        ...prev,
        monthly_expenditure: newTotal
      }));

      toast({
        title: "Expenditure added",
        description: `Added $${amount} to your monthly expenditures.`,
      });

      setNewExpenditure("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

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
            Welcome back
          </h1>
          <p className="text-white/60 mt-2">Here's your financial overview</p>
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
            change={{ value: 1.2, trend: "up" }}
            icon={PiggyBankIcon}
          />
          <Dialog>
            <DialogTrigger asChild>
              <div>
                <StatCard
                  title="Monthly Expenses"
                  value={`$${financialData.monthly_expenditure.toFixed(2)}`}
                  change={{ value: 0.8, trend: "down" }}
                  icon={CreditCardIcon}
                />
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expenditure</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newExpenditure}
                    onChange={(e) => setNewExpenditure(e.target.value)}
                  />
                  <Button 
                    onClick={handleAddExpenditure}
                    disabled={loading}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
            <TransactionList transactions={mockTransactions} />
          </div>

          <div className="lg:col-span-1">
            <AIInsights financialData={financialData} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
