
import { useState, useEffect } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  MoreHorizontal, 
  Receipt, 
  Search, 
  CreditCard,
  CheckCircle 
} from 'lucide-react';
import { Order, Payment } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

const Payments = () => {
  const { payments, orders, addPayment } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    orderId: '',
    amount: '',
    method: 'credit_card',
    transactionId: '',
  });
  
  // Unpaid and partially paid orders
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Filter orders that have no payment or partial payments
    const paidOrderIds = new Set();
    const orderTotals = new Map();
    const orderPayments = new Map<string, number>();
    
    // Get all order totals
    orders.forEach(order => {
      orderTotals.set(order.id, order.totalAmount);
    });
    
    // Sum up payments by order
    payments.forEach(payment => {
      if (payment.status === 'completed') {
        const currentAmount = orderPayments.get(payment.orderId) || 0;
        orderPayments.set(payment.orderId, currentAmount + payment.amount);
      }
    });
    
    // Find orders with no/partial payments
    const unpaidOrders = orders.filter(order => {
      const totalPaid = orderPayments.get(order.id) || 0;
      return totalPaid < order.totalAmount;
    });
    
    setAvailableOrders(unpaidOrders);
  }, [orders, payments]);
  
  // Filter payments based on search query
  const filteredPayments = payments.filter(
    (payment) =>
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewClick = (payment: Payment) => {
    setCurrentPayment(payment);
    setViewDialogOpen(true);
  };

  const getPaymentStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'bank_transfer':
        return <Receipt className="h-4 w-4 text-green-500" />;
      case 'cash':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getOrderByPayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return null;
    
    return orders.find(o => o.id === payment.orderId);
  };

  const getRemainingBalance = (orderId: string) => {
    if (!orderId) return 0;

    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;

    const paid = payments
      .filter(p => p.orderId === orderId && p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return Math.max(0, order.totalAmount - paid);
  };

  const resetForm = () => {
    setFormData({
      orderId: '',
      amount: '',
      method: 'credit_card',
      transactionId: '',
    });
  };

  const handleOrderSelection = (orderId: string) => {
    setFormData(prev => {
      const remaining = getRemainingBalance(orderId);
      return {
        ...prev,
        orderId,
        amount: remaining.toString(),
      };
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderId) {
      toast({
        title: "Validation Error",
        description: "Please select an order.",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    const remaining = getRemainingBalance(formData.orderId);
    if (amount > remaining) {
      toast({
        title: "Validation Error",
        description: `Amount exceeds the remaining balance of $${remaining.toFixed(2)}.`,
        variant: "destructive",
      });
      return;
    }
    
    // Create a new payment
    addPayment({
      orderId: formData.orderId,
      amount,
      method: formData.method as Payment['method'],
      status: 'completed',
      transactionId: formData.transactionId || `tr_${Date.now()}`,
    });
    
    toast({
      title: "Payment Recorded",
      description: `Payment of $${amount.toFixed(2)} has been recorded.`,
    });
    
    resetForm();
    setAddDialogOpen(false);
  };

  const getOrderCustomer = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    return order ? order.customerName : 'Unknown';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track payment transactions
            </p>
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleAddSubmit}>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                  <DialogDescription>
                    Add a new payment transaction to the system.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="order" className="text-right">
                      Order
                    </Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.orderId}
                        onValueChange={handleOrderSelection}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrders.length > 0 ? (
                            availableOrders.map((order) => (
                              <SelectItem key={order.id} value={order.id}>
                                #{order.id.substring(6)} - {order.customerName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>
                              No unpaid orders available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {formData.orderId && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="text-right text-sm text-muted-foreground col-span-1">
                        Order Details
                      </div>
                      <div className="col-span-3 text-sm">
                        <p><span className="font-medium">Customer:</span> {getOrderCustomer(formData.orderId)}</p>
                        <p><span className="font-medium">Remaining Balance:</span> ${getRemainingBalance(formData.orderId).toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  
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
                    <Label className="text-right">Payment Method</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.method}
                        onValueChange={(value) => 
                          setFormData((prev) => ({ ...prev, method: value as any }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="transactionId" className="text-right">
                      Transaction ID
                    </Label>
                    <Input
                      id="transactionId"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Record Payment</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Payment Transactions</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.transactionId || 'N/A'}
                      </TableCell>
                      <TableCell>#{payment.orderId.substring(6)}</TableCell>
                      <TableCell>{format(new Date(payment.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPaymentMethodIcon(payment.method)}
                          <span className="ml-2 capitalize">
                            {payment.method.replace('_', ' ')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewClick(payment)}>
                              <Receipt className="mr-2 h-4 w-4" />
                              View Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Payment Receipt Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Details of the payment transaction.
            </DialogDescription>
          </DialogHeader>
          {currentPayment && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Transaction Details</h3>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Transaction ID:</span> {currentPayment.transactionId || 'N/A'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {format(new Date(currentPayment.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Amount:</span> ${currentPayment.amount.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Method:</span>{' '}
                      <span className="capitalize">{currentPayment.method.replace('_', ' ')}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span>{' '}
                      <span className="capitalize">{currentPayment.status}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Order Information</h3>
                  <div className="space-y-1">
                    {(() => {
                      const order = getOrderByPayment(currentPayment.id);
                      if (!order) return <p className="text-sm">Order not found</p>;
                      
                      return (
                        <>
                          <p className="text-sm">
                            <span className="font-medium">Order ID:</span> #{order.id.substring(6)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Customer:</span> {order.customerName}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Items:</span> {order.items.length}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span>{' '}
                            <span className="capitalize">{order.status}</span>
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Payment {currentPayment.status === 'completed' ? 'Completed' : 'Status: ' + currentPayment.status}</p>
                    {currentPayment.status === 'completed' && (
                      <p className="text-xs text-muted-foreground">
                        This payment has been successfully processed.
                      </p>
                    )}
                  </div>
                  
                  {currentPayment.status === 'completed' && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Payments;
