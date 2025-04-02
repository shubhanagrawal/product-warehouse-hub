
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Receipt, 
  Search, 
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { Payment } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const Payments = () => {
  const { payments, orders } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null);
  
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
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment transaction to the system.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">This feature will be implemented in the next version.</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="button">Save Payment</Button>
              </DialogFooter>
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
