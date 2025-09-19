import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Car, Users, Award, Phone, Mail, MapPin, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-driving.jpg';
import dashboardImage from '@/assets/dashboard.jpg';
import LeadForm from '../components/LeadForm';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import Header from '../components/Header';
import { Lead, Review } from '../types';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('leads');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('reviews');
    return saved ? JSON.parse(saved).map((r: any) => ({
      ...r,
      createdAt: new Date(r.createdAt)
    })) : [
      {
        id: '1',
        name: 'דני כהן',
        rating: 5,
        comment: 'חן הוא מורה נהיגה מעולה! סבלני, מקצועי ועוזר לרכוש ביטחון מאחורי ההגה. ממליץ בחום!',
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2', 
        name: 'שרה לוי',
        rating: 5,
        comment: 'תודה על כל הסבלנות והמקצועיות. עברתי בטיחה הודות לחן!',
        createdAt: new Date('2024-01-10')
      }
    ];
  });

  const handleLeadSubmit = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updatedLeads = [...leads, newLead];
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
  };

  const handleReviewSubmit = (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="מורה נהיגה מקצועי"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center text-primary-foreground">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              חן כחלון - מורה נהיגה מוסמך
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              שיעורי נהיגה מקצועיים והשכרת רכבים למורי נהיגה
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <Award className="w-5 h-5 mr-2" />
                מורה מוסמך
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <Star className="w-5 h-5 mr-2" />
                {averageRating.toFixed(1)} כוכבים
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-lg">
                <Users className="w-5 h-5 mr-2" />
                מאות תלמידים
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent hover:bg-accent-light text-accent-foreground text-lg px-8 py-4">
                <Phone className="w-5 h-5 mr-2" />
                0503250150
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4">
                <Mail className="w-5 h-5 mr-2" />
                hen1kahlon@gmail.com
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">השירותים שלנו</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              מציעים פתרונות מקצועיים ללימוד נהיגה והשכרת רכבים למורי נהיגה
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">שיעורי נהיגה</CardTitle>
                <CardDescription className="text-lg">
                  למידה מקצועית ובטוחה עם מורה מנוסה
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <img 
                  src={dashboardImage} 
                  alt="לוח מחוונים ברכב"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-primary" />
                    שיעורים גמישים לפי הזמנים שלך
                  </li>
                  <li className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-primary" />
                    הכשרה מקצועית ויסודית
                  </li>
                  <li className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    ליווי אישי עד לקבלת הרישיון
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-accent-foreground" />
                </div>
                <CardTitle className="text-2xl">השכרת רכבים למורים</CardTitle>
                <CardDescription className="text-lg">
                  רכבים מתאימים עם בקרות כפולות
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-surface-alt rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold mb-2">רכבים זמינים</h4>
                  <p className="text-3xl font-bold text-primary">5+</p>
                </div>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-center">
                    <Award className="w-4 h-4 mr-2 text-accent" />
                    רכבים חדשים ומתוחזקים
                  </li>
                  <li className="flex items-center">
                    <Car className="w-4 h-4 mr-2 text-accent" />
                    בקרות כפולות מקצועיות
                  </li>
                  <li className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-accent" />
                    תנאים גמישים ומחירים תחרותיים
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">צור קשר</h2>
            <p className="text-xl text-muted-foreground">
              מוכן להתחיל? צור איתנו קשר עוד היום
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="text-center lg:text-right">
                <h3 className="text-2xl font-bold mb-6">פרטי יצירת קשר</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center lg:justify-start space-x-4">
                    <Phone className="w-6 h-6 text-primary" />
                    <span className="text-lg">0503250150</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-4">
                    <Mail className="w-6 h-6 text-primary" />
                    <span className="text-lg">hen1kahlon@gmail.com</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary" />
                    <span className="text-lg">שירות באזור המרכז</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <h3 className="text-2xl font-bold mb-4">למה לבחור בחן?</h3>
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start">
                    <Award className="w-5 h-5 mr-3 text-primary mt-1" />
                    <span>מורה נהיגה מוסמך עם ניסיון רב שנים</span>
                  </li>
                  <li className="flex items-start">
                    <Users className="w-5 h-5 mr-3 text-primary mt-1" />
                    <span>מאות תלמידים עברו בהצלחה</span>
                  </li>
                  <li className="flex items-start">
                    <Car className="w-5 h-5 mr-3 text-primary mt-1" />
                    <span>רכבים מודרניים ובטוחים</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 text-primary mt-1" />
                    <span>גמישות בזמנים ומיקומים</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <LeadForm onLeadSubmit={handleLeadSubmit} />
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Reviews Section */}
      <section className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">מה אומרים עלינו</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({reviews.length} ביקורות)</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">ביקורות תלמידים</h3>
              <ReviewsList reviews={reviews} />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">השאר ביקורת</h3>
              <ReviewForm onReviewSubmit={handleReviewSubmit} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
