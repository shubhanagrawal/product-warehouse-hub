
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      setSubmitting(false);
      return;
    }
    
    const success = await login(email, password);
    
    if (!success) {
      setError('Invalid email or password');
    }
    
    setSubmitting(false);
  };

  // Demo accounts info
  const demoAccounts = [
    { email: 'john@example.com', password: 'password', role: 'Admin' },
    { email: 'jane@example.com', password: 'password', role: 'Manager' },
    { email: 'bob@example.com', password: 'password', role: 'Staff' },
  ];

  const setDemoAccount = (email: string) => {
    setEmail(email);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">WarehouseHub</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="px-0 text-xs font-normal h-auto" type="button">
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
              
              {error && (
                <div className="text-sm text-destructive mt-2">{error}</div>
              )}
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-muted-foreground mb-4 text-center">
              Demo accounts:
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {demoAccounts.map((account) => (
                <Button
                  key={account.email}
                  variant="outline"
                  type="button"
                  className="text-xs justify-between py-1"
                  onClick={() => setDemoAccount(account.email)}
                >
                  <span>{account.email}</span>
                  <span className="text-muted-foreground">{account.role}</span>
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
