
import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Plus, 
  Search, 
  CalendarIcon,
  Warehouse,
  Building,
  Lightbulb,
  Wrench,
  Users,
  Tool,
  MoreHorizontal
} from 'lucide-react';
import { WarehouseExpense } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const Expenses = () => {
  const { expenses, addExpense } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'rent',
    date: new Date(),
  });

  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: 'rent',
      date: new Date(),
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category as any,
      date: formData.date,
    });
    resetForm();
    setAddDialogOpen(false);
  };

  const getCategoryIcon = (category: WarehouseExpense['category']) => {
    switch (category) {
      case 'rent':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'utilities':
        return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'staff':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'equipment':
        return <Tool className="h-4 w-4 text-purple-500" />;
      default:
        return <Warehouse className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate total expenses
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

  // Group expenses by category for summary
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const { category, amount } = expense;
    if (!acc[category]) acc[category] = 0;
    acc[category] += amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse Expenses</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all warehouse operating costs
            </p>
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Record a new warehouse expense.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Amount ($)
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Category</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => 
                          setFormData((prev) => ({ ...prev, category: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rent">Rent</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Date</Label>
                    <div className="col-span-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => 
                              date && setFormData((prev) => ({ ...prev, date }))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <Warehouse className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From {expenses.length} expense entries
              </p>
            </CardContent>
          </Card>
          
          {Object.entries(expensesByCategory)
            .sort(([, amountA], [, amountB]) => amountB - amountA)
            .slice(0, 3)
            .map(([category, amount], index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{category}</CardTitle>
                  {getCategoryIcon(category as any)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${amount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {((amount / totalExpenses) * 100).toFixed(1)}% of total expenses
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Expense Transactions</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getCategoryIcon(expense.category)}
                          <span className="ml-2 capitalize">{expense.category}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Expenses;
