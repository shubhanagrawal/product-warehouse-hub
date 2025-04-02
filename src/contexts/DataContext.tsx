
import React, { createContext, useContext, useState } from 'react';
import { 
  Product, 
  Order, 
  Payment, 
  WarehouseExpense, 
  DashboardStats 
} from '@/types';
import { 
  mockProducts, 
  mockOrders, 
  mockPayments, 
  mockWarehouseExpenses, 
  mockDashboardStats 
} from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  
  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  
  // Expenses
  expenses: WarehouseExpense[];
  addExpense: (expense: Omit<WarehouseExpense, 'id' | 'createdAt'>) => void;
  
  // Dashboard
  dashboardStats: DashboardStats;
  refreshDashboardStats: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [expenses, setExpenses] = useState<WarehouseExpense[]>(mockWarehouseExpenses);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);

  // Product functions
  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setProducts([...products, newProduct]);
    toast({
      title: "Product added",
      description: `${newProduct.name} has been added to inventory.`,
    });
    refreshDashboardStats();
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(products.map(product => 
      product.id === id 
        ? { 
            ...product, 
            ...productData, 
            updatedAt: new Date() 
          } 
        : product
    ));
    toast({
      title: "Product updated",
      description: "Product information has been updated.",
    });
    refreshDashboardStats();
  };

  const deleteProduct = (id: string) => {
    const productName = products.find(p => p.id === id)?.name;
    setProducts(products.filter(product => product.id !== id));
    toast({
      title: "Product deleted",
      description: productName ? `${productName} has been removed from inventory.` : "Product has been removed.",
    });
    refreshDashboardStats();
  };

  // Order functions
  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newOrder: Order = {
      ...order,
      id: `order_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    
    setOrders([...orders, newOrder]);
    
    // Update product quantities
    const updatedProducts = [...products];
    for (const item of newOrder.items) {
      const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
      if (productIndex >= 0) {
        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          quantity: updatedProducts[productIndex].quantity - item.quantity,
          updatedAt: now,
        };
      }
    }
    
    setProducts(updatedProducts);
    toast({
      title: "Order created",
      description: `Order #${newOrder.id.substring(6)} has been created.`,
    });
    refreshDashboardStats();
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === id 
        ? { ...order, status, updatedAt: new Date() } 
        : order
    ));
    toast({
      title: "Order updated",
      description: `Order status has been updated to ${status}.`,
    });
    refreshDashboardStats();
  };

  // Payment functions
  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `payment_${Date.now()}`,
      createdAt: new Date(),
    };
    
    setPayments([...payments, newPayment]);
    toast({
      title: "Payment recorded",
      description: `Payment of $${newPayment.amount.toFixed(2)} has been recorded.`,
    });
    refreshDashboardStats();
  };

  // Expense functions
  const addExpense = (expense: Omit<WarehouseExpense, 'id' | 'createdAt'>) => {
    const newExpense: WarehouseExpense = {
      ...expense,
      id: `expense_${Date.now()}`,
      createdAt: new Date(),
    };
    
    setExpenses([...expenses, newExpense]);
    toast({
      title: "Expense recorded",
      description: `${newExpense.description} expense of $${newExpense.amount.toFixed(2)} has been recorded.`,
    });
    refreshDashboardStats();
  };

  // Dashboard functions
  const refreshDashboardStats = () => {
    // Update dashboard stats based on current data
    const updatedStats: DashboardStats = {
      totalProducts: products.length,
      lowStockProducts: products.filter(p => p.quantity < 50).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      monthlyRevenue: payments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      monthlyExpenses: expenses.reduce((sum, expense) => sum + expense.amount, 0),
    };
    
    setDashboardStats(updatedStats);
  };

  return (
    <DataContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      orders,
      addOrder,
      updateOrderStatus,
      payments,
      addPayment,
      expenses,
      addExpense,
      dashboardStats,
      refreshDashboardStats,
    }}>
      {children}
    </DataContext.Provider>
  );
};
