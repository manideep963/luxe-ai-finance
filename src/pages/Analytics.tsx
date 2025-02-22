
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BrainCircuitIcon, CalendarIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Mock data - replace with real data from your backend
const expenseCategories = [
  { name: "Housing", value: 2000, color: "#00E6E6" },
  { name: "Food", value: 800, color: "#F5A623" },
  { name: "Transport", value: 400, color: "#7C3AED" },
  { name: "Entertainment", value: 300, color: "#EC4899" },
  { name: "Others", value: 500, color: "#6366F1" },
];

const dateRanges = ["7D", "1M", "6M", "1Y", "ALL"];

export default function Analytics() {
  const [selectedRange, setSelectedRange] = useState("1M");
  
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-white">Loading analytics...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            Financial Analytics
          </motion.h1>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-white/60" />
            <div className="flex bg-white/5 rounded-lg p-1">
              {dateRanges.map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  className={`px-3 py-1 text-sm ${
                    selectedRange === range
                      ? "bg-neon/20 text-neon"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setSelectedRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Income Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { month: 'Jan', amount: financialData?.monthly_salary || 0 },
                { month: 'Feb', amount: (financialData?.monthly_salary || 0) * 1.02 },
                { month: 'Mar', amount: (financialData?.monthly_salary || 0) * 1.05 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="month" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip contentStyle={{ background: '#0D1119', border: '1px solid #ffffff20' }} />
                <Line type="monotone" dataKey="amount" stroke="#00E6E6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Expense Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Expense Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0D1119', border: '1px solid #ffffff20' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-6">
            <BrainCircuitIcon className="w-6 h-6 text-neon" />
            <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Spending Pattern</h4>
              <p className="text-white/60 text-sm">
                Your housing expenses are 15% higher than average. Consider reviewing your rental or mortgage options.
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Savings Opportunity</h4>
              <p className="text-white/60 text-sm">
                Based on your income, you could increase your monthly savings by optimizing entertainment expenses.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
