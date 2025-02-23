
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FinancialData {
  monthly_salary: number;
  total_savings: number;
  monthly_expenditure: number;
}

export function useFinancialData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current month's transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfMonth.toISOString())
        .eq('type', 'withdrawal');

      if (transactionsError) throw transactionsError;

      // Calculate total monthly expenditure from transactions
      const monthlyExpenditure = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

      // Get financial data and update monthly expenditure
      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Update monthly_expenditure if it's different
      if (data.monthly_expenditure !== monthlyExpenditure) {
        const { error: updateError } = await supabase
          .from('financial_data')
          .update({ monthly_expenditure: monthlyExpenditure })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
        data.monthly_expenditure = monthlyExpenditure;
      }

      return data as FinancialData;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<FinancialData>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('financial_data')
        .upsert({
          user_id: user.id,
          ...financialData,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-data'] });
      toast({
        title: "Success",
        description: "Financial data updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update financial data",
      });
    },
  });

  return {
    financialData,
    isLoading,
    updateFinancialData: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
