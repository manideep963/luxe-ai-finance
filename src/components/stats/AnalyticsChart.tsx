
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type TimeFrame = "1D" | "7D" | "1M" | "6M" | "1Y";

interface AnalyticsChartProps {
  type: "spending" | "income";
  timeFrame: TimeFrame;
}

const COLORS = {
  Housing: "#00E6E6",
  Food: "#F5A623",
  Transport: "#7C3AED",
  Entertainment: "#EC4899",
  Subscriptions: "#6366F1",
  Others: "#64748B",
};

export function AnalyticsChart({ type, timeFrame }: AnalyticsChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', type, timeFrame],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const now = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case "1D":
          startDate.setDate(now.getDate() - 1);
          break;
        case "7D":
          startDate.setDate(now.getDate() - 7);
          break;
        case "1M":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "6M":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1Y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type === 'income' ? 'deposit' : 'withdrawal')
        .gte('date', startDate.toISOString())
        .lte('date', now.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;
      return transactions;
    },
  });

  const processTransactionData = () => {
    if (!data) return { trendData: [], spendingData: [] };

    // Process trend data
    const trendMap = new Map();
    data.forEach(transaction => {
      const date = new Date(transaction.date).toLocaleDateString('en-US', { weekday: 'short' });
      const current = trendMap.get(date) || 0;
      trendMap.set(date, current + Number(transaction.amount));
    });

    const trendData = Array.from(trendMap.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));

    // Process spending/income by category
    const categoryMap = new Map();
    data.forEach(transaction => {
      const category = transaction.category || 'Others';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Number(transaction.amount));
    });

    const spendingData = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    return { trendData, spendingData };
  };

  const { trendData, spendingData } = processTransactionData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3"
        >
          <p className="text-white font-medium">{label}</p>
          <p className="text-neon">${payload[0].value.toFixed(2)}</p>
        </motion.div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60">Loading chart data...</div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {type === "spending" ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Others} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#FF5A5A"
                  strokeWidth={2}
                  dot={{ fill: "#FF5A5A" }}
                  activeDot={{ r: 8, fill: "#FF7070" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff60" />
              <YAxis stroke="#ffffff60" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#00E6E6"
                strokeWidth={2}
                dot={{ fill: "#00E6E6" }}
                activeDot={{ r: 8, fill: "#00F2FE" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
