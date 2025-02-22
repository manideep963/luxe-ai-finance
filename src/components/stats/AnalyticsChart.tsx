
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
    queryKey: ['financial-data', type, timeFrame],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_data")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  const spendingData = [
    { name: "Housing", value: 2000 },
    { name: "Food", value: 800 },
    { name: "Transport", value: 400 },
    { name: "Entertainment", value: 300 },
    { name: "Subscriptions", value: 200 },
    { name: "Others", value: 500 },
  ];

  const trendData = [
    { date: "Mon", amount: 120 },
    { date: "Tue", amount: 180 },
    { date: "Wed", amount: 150 },
    { date: "Thu", amount: 220 },
    { date: "Fri", amount: 300 },
    { date: "Sat", amount: 250 },
    { date: "Sun", amount: 180 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3"
        >
          <p className="text-white font-medium">{label}</p>
          <p className="text-neon">${payload[0].value}</p>
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
          <ResponsiveContainer width="100%" height={300}>
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
                    fill={COLORS[entry.name as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
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
