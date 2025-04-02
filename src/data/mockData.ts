
import { 
  User, 
  Product, 
  Order, 
  Payment, 
  WarehouseExpense, 
  DashboardStats 
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'manager',
    createdAt: new Date('2023-02-20'),
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'staff',
    createdAt: new Date('2023-03-10'),
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ergonomic Chair',
    description: 'Comfortable office chair with lumbar support',
    price: 199.99,
    quantity: 45,
    category: 'Furniture',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-05'),
    updatedAt: new Date('2023-01-05'),
  },
  {
    id: '2',
    name: 'Standing Desk',
    description: 'Adjustable height desk for better posture',
    price: 349.99,
    quantity: 30,
    category: 'Furniture',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-10'),
    updatedAt: new Date('2023-01-10'),
  },
  {
    id: '3',
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 49.99,
    quantity: 100,
    category: 'Lighting',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '4',
    name: 'Laptop Stand',
    description: 'Elevate your laptop for better ergonomics',
    price: 39.99,
    quantity: 75,
    category: 'Accessories',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-20'),
    updatedAt: new Date('2023-01-20'),
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    description: 'Bluetooth mouse with ergonomic design',
    price: 29.99,
    quantity: 120,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-25'),
    updatedAt: new Date('2023-01-25'),
  },
  {
    id: '6',
    name: 'Keyboard',
    description: 'Mechanical keyboard with RGB lighting',
    price: 89.99,
    quantity: 60,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/400x300',
    createdAt: new Date('2023-01-30'),
    updatedAt: new Date('2023-01-30'),
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: '1',
    userId: '2',
    customerName: 'Alex Turner',
    customerEmail: 'alex@example.com',
    status: 'delivered',
    totalAmount: 249.98,
    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2023-03-05'),
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        productName: 'Ergonomic Chair',
        quantity: 1,
        price: 199.99,
      },
      {
        id: '2',
        orderId: '1',
        productId: '5',
        productName: 'Wireless Mouse',
        quantity: 1,
        price: 49.99,
      },
    ],
  },
  {
    id: '2',
    userId: '3',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    status: 'processing',
    totalAmount: 429.97,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-03-10'),
    items: [
      {
        id: '3',
        orderId: '2',
        productId: '2',
        productName: 'Standing Desk',
        quantity: 1,
        price: 349.99,
      },
      {
        id: '4',
        orderId: '2',
        productId: '4',
        productName: 'Laptop Stand',
        quantity: 2,
        price: 39.99,
      },
    ],
  },
  {
    id: '3',
    userId: '1',
    customerName: 'Michael Brown',
    customerEmail: 'michael@example.com',
    status: 'pending',
    totalAmount: 139.98,
    createdAt: new Date('2023-03-15'),
    updatedAt: new Date('2023-03-15'),
    items: [
      {
        id: '5',
        orderId: '3',
        productId: '3',
        productName: 'Desk Lamp',
        quantity: 1,
        price: 49.99,
      },
      {
        id: '6',
        orderId: '3',
        productId: '6',
        productName: 'Keyboard',
        quantity: 1,
        price: 89.99,
      },
    ],
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: '1',
    orderId: '1',
    amount: 249.98,
    method: 'credit_card',
    status: 'completed',
    transactionId: 'tr_123456',
    createdAt: new Date('2023-03-01'),
  },
  {
    id: '2',
    orderId: '2',
    amount: 429.97,
    method: 'bank_transfer',
    status: 'pending',
    transactionId: 'tr_234567',
    createdAt: new Date('2023-03-10'),
  },
  {
    id: '3',
    orderId: '3',
    amount: 139.98,
    method: 'credit_card',
    status: 'pending',
    transactionId: 'tr_345678',
    createdAt: new Date('2023-03-15'),
  },
];

// Mock Warehouse Expenses
export const mockWarehouseExpenses: WarehouseExpense[] = [
  {
    id: '1',
    description: 'Monthly rent',
    amount: 2500,
    category: 'rent',
    date: new Date('2023-03-01'),
    createdAt: new Date('2023-03-01'),
  },
  {
    id: '2',
    description: 'Electricity bill',
    amount: 450,
    category: 'utilities',
    date: new Date('2023-03-05'),
    createdAt: new Date('2023-03-05'),
  },
  {
    id: '3',
    description: 'Warehouse staff wages',
    amount: 3600,
    category: 'staff',
    date: new Date('2023-03-15'),
    createdAt: new Date('2023-03-15'),
  },
  {
    id: '4',
    description: 'Forklift repair',
    amount: 750,
    category: 'equipment',
    date: new Date('2023-03-20'),
    createdAt: new Date('2023-03-20'),
  },
  {
    id: '5',
    description: 'Cleaning service',
    amount: 300,
    category: 'maintenance',
    date: new Date('2023-03-25'),
    createdAt: new Date('2023-03-25'),
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalProducts: mockProducts.length,
  lowStockProducts: mockProducts.filter(p => p.quantity < 50).length,
  totalOrders: mockOrders.length,
  pendingOrders: mockOrders.filter(o => o.status === 'pending').length,
  monthlyRevenue: mockPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0),
  monthlyExpenses: mockWarehouseExpenses.reduce((sum, expense) => sum + expense.amount, 0),
};
