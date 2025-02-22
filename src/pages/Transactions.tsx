
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  PlusIcon,
  SearchIcon,
  Trash2Icon
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

  const [newTransaction, setNewTransaction] = useState<NewTransaction>({
    description: "",
    amount: "",
    type: "withdrawal",
    category: "Other",
    payment_method: "Cash",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false
  });

  const { data: transactions, isLoading, refetch } = useQuery({
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
        date: newTransaction.date,
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

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Type</label>
                    <select
                      value={newTransaction.type}
                      onChange={(e) => setNewTransaction(prev => ({ 
                        ...prev, 
                        type: e.target.value as TransactionType 
                      }))}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    >
                      <option value="withdrawal">Expense</option>
                      <option value="deposit">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Category</label>
                    <select
                      value={newTransaction.category}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 rounded-md border border-input bg-background"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                  <select
                    value={newTransaction.payment_method}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, payment_method: e.target.value }))}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                />
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
                className="glass-card p-4 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{transaction.description}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">
                        {transaction.category}
                      </Badge>
                      <Badge variant="outline">
                        {transaction.payment_method}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-lg font-semibold ${
                      transaction.type === 'deposit' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount)}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2Icon className="h-4 w-4" />
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
