
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  BellIcon,
  CheckCircle2Icon,
  CalendarIcon
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { TransactionList, type Transaction, type TransactionType } from "@/components/transactions/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { v4 as uuidv4 } from 'uuid';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TransactionFilter = "all" | TransactionType;
type DateRange = "all" | "today" | "week" | "month" | "custom";

interface NewTransaction {
  description: string;
  amount: string;
  type: TransactionType;
  category: string;
  payment_method: string;
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
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    description: "",
    amount: "",
    type: "withdrawal",
    category: "Other",
    payment_method: "Cash",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false
  });

  const { data: transactions = [], isLoading, refetch } = useQuery({
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

  // Filter transactions based on search query and selected category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    const matchesType = filter === "all" || transaction.type === filter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleAddTransaction = async () => {
    try {
      setIsAddingTransaction(true);
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
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to add transactions",
          variant: "destructive"
        });
        return;
      }

      const newTransactionData = {
        id: uuidv4(),
        amount,
        type: newTransaction.type,
        status: "success" as const,
        date: new Date(newTransaction.date).toISOString(),
        description: newTransaction.description,
        category: newTransaction.category,
        payment_method: newTransaction.payment_method,
        tag: "personal" as const,
        user_id: user.id
      };

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert(newTransactionData);

      if (transactionError) {
        console.error('Transaction Error:', transactionError);
        throw transactionError;
      }

      // Update financial_data based on transaction type
      const { data: financialData } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (financialData) {
        const updates: any = {};
        
        if (newTransaction.type === 'deposit') {
          updates.total_savings = Number(financialData.total_savings) + amount;
        } else {
          updates.monthly_expenditure = Number(financialData.monthly_expenditure) + amount;
          updates.total_savings = Math.max(0, Number(financialData.total_savings) - amount);
        }

        const { error: updateError } = await supabase
          .from('financial_data')
          .update(updates)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      await refetch();

      toast({
        title: "Success",
        description: "Transaction added successfully"
      });

      setNewTransaction({
        description: "",
        amount: "",
        type: "withdrawal",
        category: "Other",
        payment_method: "Cash",
        date: new Date().toISOString().split("T")[0],
        isRecurring: false
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add transaction",
        variant: "destructive"
      });
    } finally {
      setIsAddingTransaction(false);
    }
  };

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
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-neon hover:bg-neon/90">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input
                    placeholder="Enter transaction description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <Select
                      value={newTransaction.type}
                      onValueChange={(value: TransactionType) => 
                        setNewTransaction(prev => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="withdrawal">Expense</SelectItem>
                        <SelectItem value="deposit">Income</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Select
                      value={newTransaction.category}
                      onValueChange={(value) => 
                        setNewTransaction(prev => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Payment Method</label>
                  <Select
                    value={newTransaction.payment_method}
                    onValueChange={(value) => 
                      setNewTransaction(prev => ({ ...prev, payment_method: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleAddTransaction} 
                  className="w-full"
                  disabled={isAddingTransaction}
                >
                  {isAddingTransaction ? 'Adding...' : 'Add Transaction'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

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
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading transactions...</div>
        ) : (
          <TransactionList 
            transactions={filteredTransactions}
            renderItem={(transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {transaction.description}
                      </h3>
                      <Badge variant={transaction.type === "deposit" ? "secondary" : "outline"}>
                        {transaction.type === "deposit" ? "Income" : "Expense"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <Badge variant="outline">{transaction.payment_method}</Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <p className={`text-2xl font-bold ${
                      transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2Icon className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from('transactions')
                                  .delete()
                                  .eq('id', transaction.id);

                                if (error) throw error;

                                await refetch();
                                
                                toast({
                                  title: "Success",
                                  description: "Transaction deleted successfully"
                                });
                              } catch (error: any) {
                                toast({
                                  title: "Error",
                                  description: error.message || "Failed to delete transaction",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            )}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
