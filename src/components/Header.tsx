import { Button } from '@/components/ui/button';
import { Car, LogOut, Settings, Menu, Phone, Mail, Facebook, Instagram, MessageCircle, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
}

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});

  useEffect(() => {
    const saved = localStorage.getItem('socialMedia');
    if (saved) {
      setSocialMedia(JSON.parse(saved));
    }

    // Listen for social media updates
    const handleSocialMediaUpdate = () => {
      const updated = localStorage.getItem('socialMedia');
      if (updated) {
        setSocialMedia(JSON.parse(updated));
      }
    };

    window.addEventListener('socialMediaUpdated', handleSocialMediaUpdate);
    return () => window.removeEventListener('socialMediaUpdated', handleSocialMediaUpdate);
  }, []);

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
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Car className="h-8 w-8" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">חן כחלון</h1>
              <p className="text-sm opacity-90">מורה נהיגה מוסמך</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">חן כחלון</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-primary-foreground hover:bg-primary-light"
            >
              השירותים
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-primary-foreground hover:bg-primary-light"
            >
              צור קשר
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-primary-foreground hover:bg-primary-light"
            >
              ביקורות
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-primary-light"
              asChild
            >
              <a href="tel:0503250150" aria-label="התקשר עכשיו">
                <Phone className="h-4 w-4 mr-2" />
                0503250150
              </a>
            </Button>
            
            {/* Social Media Icons */}
            <div className="flex items-center space-x-2">
              {socialMedia.facebook && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-light p-2"
                  onClick={() => window.open(socialMedia.facebook, '_blank')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
              )}
              {socialMedia.instagram && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-light p-2"
                  onClick={() => window.open(socialMedia.instagram, '_blank')}
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              )}
              {socialMedia.tiktok && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-light p-2"
                  onClick={() => window.open(socialMedia.tiktok, '_blank')}
                >
                  <Music className="h-4 w-4" />
                </Button>
              )}
              {socialMedia.whatsapp && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground hover:bg-primary-light p-2"
                  onClick={() => window.open(socialMedia.whatsapp, '_blank')}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-primary-foreground hover:bg-primary-light"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-primary-light">
            <nav className="flex flex-col space-y-2 pt-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="text-primary-foreground hover:bg-primary-light justify-start"
              >
                השירותים
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="text-primary-foreground hover:bg-primary-light justify-start"
              >
                צור קשר
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMobileMenuOpen(false);
                }}
                className="text-primary-foreground hover:bg-primary-light justify-start"
              >
                ביקורות
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-light justify-start w-full"
                asChild
              >
                <a href="tel:0503250150" aria-label="התקשר עכשיו">
                  <Phone className="h-4 w-4 mr-2" />
                  0503250150
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary-foreground hover:bg-primary-light justify-start w-full"
                onClick={() => window.location.href = 'mailto:hen1kahlon@gmail.com'}  
              >
                <Mail className="h-4 w-4 mr-2" />
                אימייל
              </Button>
              {isAdmin ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-primary-foreground hover:bg-primary-light justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    דשבורד
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-primary-foreground hover:bg-primary-light justify-start"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    יציאה
                  </Button>
                </>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    handleAdminClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-primary-foreground hover:bg-primary-light justify-start"
                >
                  כניסת מנהל
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;