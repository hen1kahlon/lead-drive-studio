import { Button } from '@/components/ui/button';
import { Car, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin');
    } else {
      navigate('/admin/login');
    }
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <Car className="h-8 w-8" />
          <div>
            <h1 className="text-xl font-bold">חן כחלון</h1>
            <p className="text-sm opacity-90">מורה נהיגה מוסמך</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-4">
          {isAdmin ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/admin')}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <Settings className="h-4 w-4 mr-2" />
                דשבורד
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <LogOut className="h-4 w-4 mr-2" />
                יציאה
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAdminClick}
              className="text-primary-foreground hover:bg-primary-light"
            >
              כניסת מנהל
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;