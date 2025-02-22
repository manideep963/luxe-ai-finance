
import { useState } from "react";
import { motion } from "framer-motion";
import { BellIcon, PlusIcon, CalendarIcon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
  type: "one-time" | "subscription";
  frequency?: "monthly" | "yearly";
  category: string;
  reminderSet: boolean;
}

const Bills = () => {
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([
    { 
      id: 1, 
      name: 'Netflix Subscription', 
      amount: 15.99, 
      dueDate: '2024-03-25',
      type: "subscription",
      frequency: "monthly",
      category: "Entertainment",
      reminderSet: true
    },
    { 
      id: 2, 
      name: 'Electricity Bill', 
      amount: 120.00, 
      dueDate: '2024-03-28',
      type: "one-time",
      category: "Utilities",
      reminderSet: false
    },
    { 
      id: 3, 
      name: 'Internet Service', 
      amount: 79.99, 
      dueDate: '2024-04-01',
      type: "subscription",
      frequency: "monthly",
      category: "Utilities",
      reminderSet: true
    }
  ]);

  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: '',
    type: 'one-time',
    frequency: 'monthly',
    category: 'Other'
  });

  const categories = [
    "Utilities",
    "Entertainment",
    "Insurance",
    "Rent/Mortgage",
    "Subscriptions",
    "Other"
  ];

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setBills(prev => [...prev, {
      id: prev.length + 1,
      name: newBill.name,
      amount: parseFloat(newBill.amount),
      dueDate: newBill.dueDate,
      type: newBill.type as "one-time" | "subscription",
      frequency: newBill.type === "subscription" ? newBill.frequency as "monthly" | "yearly" : undefined,
      category: newBill.category,
      reminderSet: false
    }]);

    setNewBill({
      name: '',
      amount: '',
      dueDate: '',
      type: 'one-time',
      frequency: 'monthly',
      category: 'Other'
    });

    toast({
      title: "Success",
      description: "New bill has been added",
    });
  };

  const toggleReminder = (billId: number) => {
    setBills(prev => prev.map(bill => {
      if (bill.id === billId) {
        const newReminderState = !bill.reminderSet;
        
        toast({
          title: newReminderState ? "Reminder Set" : "Reminder Removed",
          description: newReminderState 
            ? `You will be notified before ${bill.name} is due` 
            : `Reminder for ${bill.name} has been removed`,
        });
        
        return { ...bill, reminderSet: newReminderState };
      }
      return bill;
    }));
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedBills = [...bills].sort((a, b) => {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Upcoming Bills</h1>
            <p className="text-white/60 mt-2">Manage your bills and payment schedules</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-neon hover:bg-neon/90">
                <PlusIcon className="w-4 h-4 mr-2" />
                Add New Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bill</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Bill name"
                  value={newBill.name}
                  onChange={(e) => setNewBill(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newBill.amount}
                  onChange={(e) => setNewBill(prev => ({ ...prev, amount: e.target.value }))}
                />
                <Input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill(prev => ({ ...prev, dueDate: e.target.value }))}
                />
                <Select 
                  value={newBill.type}
                  onValueChange={(value) => setNewBill(prev => ({ ...prev, type: value }))}
                >
                  <option value="one-time">One-time Payment</option>
                  <option value="subscription">Subscription</option>
                </Select>
                {newBill.type === 'subscription' && (
                  <Select
                    value={newBill.frequency}
                    onValueChange={(value) => setNewBill(prev => ({ ...prev, frequency: value }))}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Select>
                )}
                <Select
                  value={newBill.category}
                  onValueChange={(value) => setNewBill(prev => ({ ...prev, category: value }))}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Select>
                <Button onClick={handleAddBill} className="w-full">
                  Add Bill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-6">
          {sortedBills.map(bill => {
            const daysUntilDue = getDaysUntilDue(bill.dueDate);
            
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-white">{bill.name}</h3>
                      <Badge variant={bill.type === "subscription" ? "secondary" : "outline"}>
                        {bill.type === "subscription" ? `${bill.frequency} subscription` : "one-time"}
                      </Badge>
                    </div>
                    <p className="text-white/60">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                    <Badge 
                      variant={daysUntilDue <= 3 ? "destructive" : "outline"}
                      className="mt-2"
                    >
                      {daysUntilDue <= 0 ? "Overdue" : `Due in ${daysUntilDue} days`}
                    </Badge>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline">{bill.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-3">
                    <p className="text-2xl font-bold text-white">${bill.amount.toFixed(2)}</p>
                    <Button 
                      variant={bill.reminderSet ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleReminder(bill.id)}
                      className="flex items-center space-x-2"
                    >
                      {bill.reminderSet ? (
                        <>
                          <CheckCircle2Icon className="w-4 h-4 mr-2" />
                          Reminder Set
                        </>
                      ) : (
                        <>
                          <BellIcon className="w-4 h-4 mr-2" />
                          Set Reminder
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bills;
