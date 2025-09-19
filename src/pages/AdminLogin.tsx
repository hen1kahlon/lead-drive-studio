import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Lock, User } from 'lucide-react';
import Header from '../components/Header';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(credentials.username, credentials.password)) {
      toast({
        title: 'התחברות הצליחה',
        description: 'ברוך הבא לדשבורד',
        variant: 'default'
      });
      navigate('/admin');
    } else {
      toast({
        title: 'שגיאה',
        description: 'שם משתמש או סיסמה שגויים',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              כניסת מנהל
            </CardTitle>
            <CardDescription>
              הכנס את פרטי ההתחברות כדי לגשת לדשבורד
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  שם משתמש
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="admin"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  סיסמה
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="admin"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full">
                התחבר
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-surface rounded-lg">
              <h4 className="font-semibold mb-2">פרטי כניסה לדוגמה:</h4>
              <p className="text-sm text-muted-foreground">
                שם משתמש: <code className="bg-surface-alt px-1 rounded">admin</code><br />
                סיסמה: <code className="bg-surface-alt px-1 rounded">admin</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;