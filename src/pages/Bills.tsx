
import { useState } from "react";
import { motion } from "framer-motion";
import { BellIcon, PlusIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Bill {
  id: number;
  name: string;
  amount: number;
  dueDate: string;
}

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([
    { id: 1, name: 'Netflix Subscription', amount: 15.99, dueDate: '2024-03-25' },
    { id: 2, name: 'Electricity Bill', amount: 120.00, dueDate: '2024-03-28' },
    { id: 3, name: 'Internet Service', amount: 79.99, dueDate: '2024-04-01' }
  ]);

  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: ''
  });

  const handleAddBill = () => {
    if (!newBill.name || !newBill.amount || !newBill.dueDate) return;

    setBills(prev => [...prev, {
      id: prev.length + 1,
      name: newBill.name,
      amount: parseFloat(newBill.amount),
      dueDate: newBill.dueDate
    }]);

    setNewBill({ name: '', amount: '', dueDate: '' });
  };

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
                <Button onClick={handleAddBill} className="w-full">
                  Add Bill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-6">
          {bills.map(bill => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{bill.name}</h3>
                  <p className="text-white/60">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${bill.amount.toFixed(2)}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <BellIcon className="w-4 h-4 mr-2" />
                    Set Reminder
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bills;
