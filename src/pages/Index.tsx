import { useEffect, useState } from "react";
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

// Weekly spending data example
const weeklySpendingData = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 180 },
  { day: 'Wed', amount: 150 },
  { day: 'Thu', amount: 220 },
  { day: 'Fri', amount: 180 },
  { day: 'Sat', amount: 250 },
  { day: 'Sun', amount: 170 }
];

// Upcoming bills example
const upcomingBills = [
  { id: 1, name: 'Netflix Subscription', amount: 15.99, dueDate: '2024-03-25' },
  { id: 2, name: 'Electricity Bill', amount: 120.00, dueDate: '2024-03-28' },
  { id: 3, name: 'Internet Service', amount: 79.99, dueDate: '2024-04-01' }
];

const Index = () => {
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState({
    monthly_salary: 0,
    total_savings: 0,
    monthly_expenditure: 0,
    net_worth: 150000, // Example value
    budget: 3000, // Example monthly budget
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
      setFinancialData(prev => ({
        ...prev,
        ...data
      }));
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
            title="Net Worth"
            value={`$${financialData.net_worth.toFixed(2)}`}
            change={{ value: 5.2, trend: "up" }}
            icon={TrendingUpIcon}
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

        {/* Weekly Spending Trends */}
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Spending Trends</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklySpendingData}>
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

        {/* Upcoming Bills */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Upcoming Bills</h3>
            <Button variant="outline" size="sm">
              <BellIcon className="w-4 h-4 mr-2" />
              Set Reminders
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingBills.map(bill => (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div>
                  <p className="text-white font-medium">{bill.name}</p>
                  <p className="text-white/60 text-sm">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${bill.amount.toFixed(2)}</p>
                  <Button variant="link" size="sm" className="text-neon">
                    Pay Now
                  </Button>
                </div>
              </div>
            ))}
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
