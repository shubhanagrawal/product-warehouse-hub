
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { Package, ShoppingCart, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const { dashboardStats, products, orders } = useData();
  const { user } = useAuth();

  // Calculate net profit
  const netProfit = dashboardStats.monthlyRevenue - dashboardStats.monthlyExpenses;
  const isProfit = netProfit >= 0;

  // Prepare data for product category chart
  const categoryData = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { name: category, count: 0 };
    }
    acc[category].count += 1;
    return acc;
  }, {} as Record<string, { name: string; count: number }>);

  const productCategoryData = Object.values(categoryData);

  // Prepare data for order status chart
  const orderStatusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'pending').length },
    { name: 'Processing', value: orders.filter(o => o.status === 'processing').length },
    { name: 'Shipped', value: orders.filter(o => o.status === 'shipped').length },
    { name: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length },
  ].filter(item => item.value > 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  // Recent orders for activity feed
  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.lowStockProducts} products low in stock
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.pendingOrders} orders pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${dashboardStats.monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From {orders.filter(o => o.status !== 'cancelled').length} orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(netProfit).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                After ${dashboardStats.monthlyExpenses.toFixed(2)} in expenses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>Distribution of products by category</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productCategoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {orderStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-start">
                    <div className="mr-4 mt-1">
                      <span className={`flex h-2 w-2 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-500' :
                        order.status === 'processing' ? 'bg-blue-500' :
                        order.status === 'shipped' ? 'bg-purple-500' :
                        order.status === 'delivered' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}/>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          Order from {order.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ${order.totalAmount.toFixed(2)} - {order.items.length} items - Status: {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <p>No recent orders</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
