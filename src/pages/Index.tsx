
import { useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSignIcon, PiggyBankIcon, CreditCardIcon, ChartBarIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { StatCard } from "@/components/stats/StatCard";
import { TransactionList } from "@/components/transactions/TransactionList";
import { AIInsights } from "@/components/insights/AIInsights";
import { useToast } from "@/hooks/use-toast";

// Mock data - replace with real data from your backend
const transactions = [
  {
    id: "1",
    amount: 2500,
    type: "deposit" as const,
    status: "success" as const,
    date: "2024-03-20",
    description: "Monthly Salary",
  },
  {
    id: "2",
    amount: 85,
    type: "payment" as const,
    status: "pending" as const,
    date: "2024-03-19",
    description: "Netflix Subscription",
  },
  {
    id: "3",
    amount: 150,
    type: "withdrawal" as const,
    status: "failed" as const,
    date: "2024-03-18",
    description: "ATM Withdrawal",
  },
];

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Welcome back!",
      description: "Your portfolio has grown 2.3% since yesterday.",
    });
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
            Welcome back, John
          </h1>
          <p className="text-white/60 mt-2">Here's your financial overview</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Monthly Income"
            value="$8,250.00"
            change={{ value: 2.3, trend: "up" }}
            icon={DollarSignIcon}
          />
          <StatCard
            title="Total Savings"
            value="$35,238.68"
            change={{ value: 1.2, trend: "up" }}
            icon={PiggyBankIcon}
          />
          <StatCard
            title="Monthly Expenses"
            value="$4,320.50"
            change={{ value: 0.8, trend: "down" }}
            icon={CreditCardIcon}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Recent Transactions</span>
              </h2>
            </div>
            <TransactionList transactions={transactions} />
          </div>

          {/* AI Insights Column */}
          <div className="lg:col-span-1">
            <AIInsights />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
