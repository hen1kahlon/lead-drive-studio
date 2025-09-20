import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface ProfileData {
  image?: string;
  description?: string;
}

const ProfileSection = () => {
  const [profileData, setProfileData] = useState<ProfileData>({});

  useEffect(() => {
    // Clear old profile data and set new data
    localStorage.removeItem('profileData');
    
    const newProfileData = {
      image: '/chen-profile.jpg',
      description: '🚗 Love Drive Teach in Tel Aviv\n🚥 מורה נהיגה מוסמך\n📍 בת ים\n48 פוסטים • 210 עוקבים'
    };
    
    setProfileData(newProfileData);
    localStorage.setItem('profileData', JSON.stringify(newProfileData));

    // Listen for profile updates
    const handleProfileUpdate = () => {
      const saved = localStorage.getItem('profileData');
      if (saved) {
        setProfileData(JSON.parse(saved));
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {profileData.image && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img 
                      src={profileData.image} 
                      alt="חן כחלון - מורה נהיגה"
                      className="w-48 h-48 lg:w-56 lg:h-56 rounded-full object-cover border-4 border-primary shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/20 to-transparent"></div>
                  </div>
                </div>
              )}
              
              <div className="flex-1 text-center lg:text-right space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                  <User className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    חן כחלון
                  </h2>
                </div>
                
                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-semibold text-primary">
                    מורה נהיגה מוסמך ומשכיר רכבי הוראה
                  </h3>
                </div>
                
                {profileData.description && (
                  <div className="bg-surface/50 rounded-lg p-6 border border-primary/10">
                    <p className="text-lg leading-relaxed text-foreground whitespace-pre-line">
                      {profileData.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ProfileSection;