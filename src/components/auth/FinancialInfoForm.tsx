
import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSignIcon, PiggyBankIcon, WalletIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FinancialInfoFormProps {
  userId: string;
  onComplete: () => void;
}

export function FinancialInfoForm({ userId, onComplete }: FinancialInfoFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    monthly_salary: "",
    total_savings: "",
    monthly_expenditure: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, verify that the profile exists and get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Not authenticated');

      // Wait for a short time to ensure profile is created by the trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      // Now create/update financial data
      const { error: financialError } = await supabase
        .from('financial_data')
        .upsert({
          user_id: user.id,
          monthly_salary: Number(formData.monthly_salary) || 0,
          total_savings: Number(formData.total_savings) || 0,
          monthly_expenditure: Number(formData.monthly_expenditure) || 0,
          updated_at: new Date().toISOString(),
        });

      if (financialError) throw financialError;

      toast({
        title: "Financial information saved!",
        description: "Your dashboard will now be personalized with these details.",
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving financial data:', error);
      toast({
        variant: "destructive",
        title: "Error saving financial information",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
        <p className="text-white/60">Let's personalize your financial dashboard</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <DollarSignIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="number"
              placeholder="Monthly Salary"
              value={formData.monthly_salary}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_salary: e.target.value }))}
              className="glass-input pl-12"
              required
            />
          </div>

          <div className="relative">
            <PiggyBankIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="number"
              placeholder="Total Savings"
              value={formData.total_savings}
              onChange={(e) => setFormData(prev => ({ ...prev, total_savings: e.target.value }))}
              className="glass-input pl-12"
              required
            />
          </div>

          <div className="relative">
            <WalletIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              type="number"
              placeholder="Average Monthly Expenditure"
              value={formData.monthly_expenditure}
              onChange={(e) => setFormData(prev => ({ ...prev, monthly_expenditure: e.target.value }))}
              className="glass-input pl-12"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-neon hover:bg-neon/90 text-midnight font-semibold"
          disabled={loading}
        >
          {loading ? "Saving..." : "Complete Setup"}
        </Button>
      </form>
    </motion.div>
  );
}
