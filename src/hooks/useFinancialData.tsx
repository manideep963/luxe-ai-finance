
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

      const { data, error } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
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
