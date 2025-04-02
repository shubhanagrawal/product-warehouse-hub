
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  MoreHorizontal, 
  Eye, 
  Search, 
  ShoppingBag,
  CalendarIcon,
  X,
  Minus, 
} from 'lucide-react';
import { Order, Product } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const orderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email address"),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).min(1, "At least one item is required"),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

const Orders = () => {
  const { orders, products, addOrder, updateOrderStatus } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<Array<{productId: string; quantity: number}>>([{productId: '', quantity: 1}]);
  
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      items: [{ productId: '', quantity: 1 }],
    },
  });
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewClick = (order: Order) => {
    setCurrentOrder(order);
    setViewDialogOpen(true);
  };

  const handleStatusClick = (order: Order) => {
    setCurrentOrder(order);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = (status: Order['status']) => {
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, status);
      setStatusDialogOpen(false);
    }
  };

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'processing':
        return 'secondary';
      case 'shipped':
        return 'default';
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const availableProducts = products.filter(product => product.quantity > 0);

  const resetNewOrderForm = () => {
    form.reset({
      customerName: '',
      customerEmail: '',
      items: [{ productId: '', quantity: 1 }],
    });
    setOrderItems([{productId: '', quantity: 1}]);
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, {productId: '', quantity: 1}]);
    form.setValue('items', [...orderItems, {productId: '', quantity: 1}]);
  };

  const removeOrderItem = (index: number) => {
    if (orderItems.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "An order must have at least one item.",
        variant: "destructive",
      });
      return;
    }
    
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
    form.setValue('items', newItems);
  };

  const handleProductChange = (value: string, index: number) => {
    const newItems = [...orderItems];
    newItems[index].productId = value;
    setOrderItems(newItems);
    form.setValue(`items.${index}.productId`, value);
  };

  const handleQuantityChange = (value: number, index: number) => {
    const newItems = [...orderItems];
    newItems[index].quantity = value;
    setOrderItems(newItems);
    form.setValue(`items.${index}.quantity`, value);
  };

  const calculateTotal = () => {
    let total = 0;
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && item.quantity > 0) {
        total += product.price * item.quantity;
      }
    });
    return total;
  };

  const onSubmitOrder = (values: OrderFormValues) => {
    // Validate item quantities against available inventory
    const invalidItems = values.items.filter(item => {
      const product = products.find(p => p.id === item.productId);
      return product && item.quantity > product.quantity;
    });

    if (invalidItems.length > 0) {
      toast({
        title: "Inventory Error",
        description: "Some items exceed available inventory.",
        variant: "destructive",
      });
      return;
    }

    // Calculate total and prepare items array
    const orderItemsWithDetails = values.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        orderId: '', // Will be set by addOrder
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const totalAmount = orderItemsWithDetails.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Create a new order
    addOrder({
      userId: '1', // Default user ID
      customerName: values.customerName,
      customerEmail: values.customerEmail,
      status: 'pending',
      totalAmount,
      items: orderItemsWithDetails,
    });

    toast({
      title: "Order Created",
      description: `Order for ${values.customerName} has been created successfully.`,
    });

    resetNewOrderForm();
    setAddDialogOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer orders and shipments
            </p>
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) resetNewOrderForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Add a new order to the system.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitOrder)} className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        {...form.register('customerName')}
                      />
                      {form.formState.errors.customerName && (
                        <p className="text-sm text-destructive">{form.formState.errors.customerName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        {...form.register('customerEmail')}
                      />
                      {form.formState.errors.customerEmail && (
                        <p className="text-sm text-destructive">{form.formState.errors.customerEmail.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium">Order Items</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOrderItem}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Item
                      </Button>
                    </div>
                    
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex space-x-4 items-end">
                        <div className="flex-1 space-y-2">
                          <Label>Product</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => handleProductChange(value, index)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableProducts.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} (${product.price.toFixed(2)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="w-24 space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1, index)}
                          />
                        </div>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOrderItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    {form.formState.errors.items && (
                      <p className="text-sm text-destructive">
                        {Array.isArray(form.formState.errors.items)
                          ? "Please check your order items"
                          : form.formState.errors.items.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total Amount:</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Order</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Order Management</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.substring(6)}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => handleViewClick(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusClick(order)}>
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* View Order Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information about the order.
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Information</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Order ID:</span> #{currentOrder.id.substring(6)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Date:</span> {format(new Date(currentOrder.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {currentOrder.status}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> ${currentOrder.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer Information</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {currentOrder.customerName}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Email:</span> {currentOrder.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentOrder.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Total:
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${currentOrder.totalAmount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Status Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the current status of the order.
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="py-4 space-y-4">
              <div>
                <p className="text-sm mb-2">
                  <span className="font-medium">Order:</span> #{currentOrder.id.substring(6)}
                </p>
                <p className="text-sm mb-4">
                  <span className="font-medium">Current Status:</span> {currentOrder.status}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium">New Status:</p>
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Orders;
