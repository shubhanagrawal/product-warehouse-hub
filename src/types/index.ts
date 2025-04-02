
// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Payment types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
}

// Warehouse expenses
export interface WarehouseExpense {
  id: string;
  description: string;
  amount: number;
  category: 'rent' | 'utilities' | 'maintenance' | 'staff' | 'equipment' | 'other';
  date: Date;
  createdAt: Date;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
}
