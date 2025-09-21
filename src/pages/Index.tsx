import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Music, Video, Triangle, Type, Facebook, Instagram, Mail, AtSign, Star, Car, Users, Award, Phone, MapPin, Clock } from 'lucide-react';
import heroImage from '@/assets/hero-driving.jpg';
import steeringWheelImage from '@/assets/steering-wheel-view.jpg';
import dashboardImage from '@/assets/dashboard.jpg';
import { supabase } from '@/integrations/supabase/client';

import LeadForm from '../components/LeadForm';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import ProfileSection from '../components/ProfileSection';
import Header from '../components/Header';
import { Lead, Review } from '../types';

interface Student {
  id: string;
  name: string;
  status: string;
  year: string;
  passed: boolean;
}

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

  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const { data, error } = await supabase
          .from('students_real')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const studentsData = data?.map(student => ({
          id: student.id,
          name: student.name,
          status: student.status,
          year: student.year,
          passed: student.passed
        })) || [];
        
        setStudents(studentsData);

        // Add reviews for students who passed
        const passedStudents = studentsData.filter(student => student.passed);
        const currentReviews = JSON.parse(localStorage.getItem('reviews') || '[]').map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt)
        }));
        
        // Check if we already have reviews from these students
        const existingReviewNames = currentReviews.map((r: any) => r.name);
        
        const studentReviews = [
          {
            name: "עמי דהן",
            rating: 5,
            comment: "חן הוא מורה נהיגה מעולה! בזכותו עברתי בפעם הראשונה. מורה סבלני ומקצועי שיודע איך להעביר ביטחון ולהכין לבחינה בצורה הטובה ביותר. ממליץ בחום!"
          },
          {
            name: "נועה כהן", 
            rating: 5,
            comment: "תודה רבה לחן על כל הסבלנות והמקצועיות! השיעורים היו ممוקדים ויעילים, והרגשתי מוכנה לבחינה. מורה נהיגה מהטובים שיש!"
          },
          {
            name: "יונתן לוי",
            rating: 4,
            comment: "מורה מצוין עם הרבה ניסיון. למד איתי בסבלנות ועזר לי להתגבר על החרדות שלי מנהיגה. עברתי בהצלחה הודות להדרכה המקצועית שלו."
          },
          {
            name: "מיכל אברהם",
            rating: 5,
            comment: "חן מורה נהיגה מדהים! השיעורים היו מעניינים ולא מלחיצים. הוא יודע בדיוק איך להכין תלמיד לבחינה ולתת לו את הביטחון הדרוש. המלצה חמה!"
          },
          {
            name: "דוד שמש",
            rating: 5,
            comment: "למדתי עם חן ועברתי בפעם הראשונה! מורה מקצועי, סבלני ועם הרבה ידע. השיעורים היו מובנים והתקדמתי מהר. תודה על הכל!"
          },
          {
            name: "רונית גולן",
            rating: 4,
            comment: "מורה נהיגה מעולה עם גישה אישית לכל תלמיד. חן עזר לי להבין את כל הכללים ולהרגיש בטוחה מאחורי ההגה. עברתי בהצלחה!"
          },
          {
            name: "אורי מזרחי",
            rating: 5,
            comment: "השיעורים עם חן היו הכי טובים! מורה מקצועי שיודע להסביר בבהירות ולהכין לבחינה בצורה מושלמת. עברתי ללא בעיות. תודה רבה!"
          },
          {
            name: "שירה כץ",
            rating: 5,
            comment: "חן הוא מורה נהיגה יוצא מן הכלל! סבלני, מקצועי ותמיד זמין לעזור. בזכותו עברתי את הבחינה ורכשתי ביטחון בנהיגה. ממליצה בחום!"
          },
          {
            name: "עומר ביטון",
            rating: 5,
            comment: "מורה נהיגה פנטסטי! חן לימד אותי מהבסיס ועזר לי להיות נהג בטוח ואחראי. השיעורים היו מעניינים והתקדמתי במהירות. עברתי בקלות!"
          },
          {
            name: "טל רוזן",
            rating: 4,
            comment: "למדתי עם חן והחוויה הייתה מעולה. מורה סבלני שמתאים את השיעורים לקצב של כל תלמיד. עזר לי להתמודד עם הפחדים ולעבור בהצלחה."
          },
          {
            name: "אבי כרמי",
            rating: 5,
            comment: "חן הוא מורה נהיגה מהמעלה הראשונה! ההוראה שלו ברורה ומקצועית, והוא תמיד דואג שהתלמיד ירגיש בטוח. עברתי בפעם הראשונה בזכותו!"
          },
          {
            name: "לירון אדרי",
            rating: 5,
            comment: "השיעורים עם חן היו חוויה נהדרת. מורה מקצועי ואמין שיודע להעביר את הידע בצורה הכי טובה. תודה על ההכנה המושלמת לבחינה!"
          },
          {
            name: "גיא שלום",
            rating: 4,
            comment: "מורה נהיגה איכותי עם הרבה ניסיון. חן עזר לי לבנות ביטחון בנהיגה ולהכין אותי בצורה מעולה לבחינה. המלצה חמה לכל מי שרוצה ללמוד נהיגה!"
          },
          {
            name: "מאיה קוגן",
            rating: 5,
            comment: "חן מורה נהיגה נפלא! ההוראה שלו מאוד מקצועית והוא תמיד מקפיד על הבטיחות. בזכותו עברתי את הבחינה בקלות ורכשתי ביטחון עצמי בנהיגה."
          },
          {
            name: "רועי פרידמן",
            rating: 5,
            comment: "למדתי עם חן ואני מאוד מרוצה! מורה סבלני ומקצועי שיודע איך להסביר בבהירות. השיעורים היו יעילים ומותאמים אישית. עברתי בהצלחה!"
          },
          {
            name: "יעל בן דוד",
            rating: 4,
            comment: "חן הוא מורה נהיגה מעולה עם גישה חמה ומקצועית. עזר לי להתגבר על הפחדים ולרכוש ביטחון בנהיגה. עברתי את הבחינה והכל בזכותו!"
          },
          {
            name: "אלעד חזן",
            rating: 5,
            comment: "מורה נהיגה יוצא דופן! חן מלמד בסבלנות רבה ויודע איך להתאים את השיעורים לכל תלמיד. בזכות ההכנה המעולה עברתי בפעם הראשונה!"
          },
          {
            name: "נטע גרוס",
            rating: 5,
            comment: "השיעורים עם חן היו הכי טובים! מורה מקצועי ונעים שיודע להעביר את החומר בצורה ברורה ומעניינת. עברתי בהצלחה ואני ממליצה עליו לכולם!"
          },
          {
            name: "יוסי אלבז",
            rating: 4,
            comment: "חן מורה נהיגה מצוין! למד איתי בסבלנות ועזר לי להבין את כל העקרונות החשובים. ההכנה הייתה מושלמת ועברתי את הבחינה בקלות."
          },
          {
            name: "ליאת שמואלי",
            rating: 5,
            comment: "מורה נהיגה פנטסטי! חן יודע בדיוק איך לגרום לתלמיד להרגיש בטוח ומוכן. השיעורים היו מעניינים והתקדמתי מהר. תודה על הכל!"
          }
        ];

        // Add reviews only for passed students who don't already have reviews
        const newReviews = [];
        let reviewIndex = 0;
        
        for (const student of passedStudents) {
          if (!existingReviewNames.includes(student.name) && reviewIndex < studentReviews.length) {
            const review = {
              id: `student-${student.id}-${Date.now()}`,
              name: student.name,
              rating: studentReviews[reviewIndex].rating,
              comment: studentReviews[reviewIndex].comment,
              createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000) // Random date within last 90 days
            };
            newReviews.push(review);
            reviewIndex++;
          }
        }

        if (newReviews.length > 0) {
          const updatedReviews = [...newReviews, ...currentReviews];
          setReviews(updatedReviews);
          localStorage.setItem('reviews', JSON.stringify(updatedReviews));
        }

      } catch (error) {
        console.error('Error loading students:', error);
        setStudents([]);
      }
    };

    loadStudents();
  }, []);

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
      <section className="relative bg-primary overflow-hidden driving-background">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={steeringWheelImage} 
            alt="נוף מתוך הרכב - הגה ודרך"
            className="w-full h-full object-cover opacity-100 contrast-125 saturate-110"
          />
          <div className="hero-vignette"></div>
          <div className="road-animation"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center text-primary-foreground">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              חן כחלון - מורה נהיגה מוסמך
            </h1>
            <p className="text-xl md:text-2xl mb-8 font-semibold text-white shadow-lg bg-primary-dark/30 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
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
              <Dialog>
                <DialogTrigger asChild>
                  <Badge variant="secondary" className="px-4 py-2 text-lg cursor-pointer hover:bg-secondary-foreground hover:text-secondary transition-colors">
                    <Users className="w-5 h-5 mr-2" />
                    {students.length > 0 ? `${students.length} תלמידים` : 'התלמידים שלי'}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto bg-background border border-border">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">התלמידים שלי</DialogTitle>
                    <DialogDescription className="text-center">
                      רשימת התלמידים שלימדתי ומלמד כיום
                    </DialogDescription>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium">{students.filter(s => s.passed).length} עוברים</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">{students.filter(s => !s.passed).length} לומדים</span>
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="grid gap-4 mt-6">
                    {students.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        עדיין לא נוספו תלמידים
                      </div>
                    ) : (
                      students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${student.passed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                              <h4 className="font-semibold text-foreground">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">{student.status}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{student.year}</p>
                            <p className={`text-xs ${student.passed ? 'text-green-600' : 'text-yellow-600'}`}>
                              {student.passed ? 'עבר בהצלחה' : 'בלימוד'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex justify-center mb-6">
              <Button 
                size="lg" 
                variant="success"
                asChild
                className="text-lg px-8 py-4 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <a href="tel:0503250150" aria-label="התקשר עכשיו">
                  <Phone className="w-5 h-5 mr-2" />
                  התקשר עכשיו
                </a>
              </Button>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex justify-center flex-wrap gap-3 md:gap-6">
              <a
                href="mailto:hen1kahlon@gmail.com"
                className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full md:hover:bg-red-500 transition-all duration-300 inline-flex items-center justify-center md:hover:scale-110 md:hover:shadow-xl md:hover:shadow-red-500/40"
                aria-label="Gmail"
              >
                <AtSign className="h-6 w-6 md:h-8 md:w-8" color="#EA4335" />
              </a>
              <a
                href="https://wa.me/972503250150"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full md:hover:bg-green-500 transition-all duration-300 inline-flex items-center justify-center md:hover:scale-110 md:hover:shadow-xl md:hover:shadow-green-500/40"
                aria-label="וואטסאפ"
              >
                <MessageCircle className="h-6 w-6 md:h-8 md:w-8" color="#25D366" />
              </a>
              <a
                href="https://www.tiktok.com/@hen_driver?_t=8oOXewPWjMm&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full md:hover:bg-white transition-all duration-300 inline-flex items-center justify-center md:hover:scale-110 md:hover:shadow-xl md:hover:shadow-white/40"
                aria-label="טיקטוק"
              >
                <span className="text-[10px] md:text-sm font-bold text-white md:group-hover:text-black">TikTok</span>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61554332618880&mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full md:hover:bg-blue-600 transition-all duration-300 inline-flex items-center justify-center md:hover:scale-110 md:hover:shadow-xl md:hover:shadow-blue-600/40"
                aria-label="פייסבוק"
              >
                <Facebook className="h-6 w-6 md:h-8 md:w-8" color="#1877F2" />
              </a>
              <a
                href="https://instagram.com/hen_driver"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full md:hover:bg-gradient-to-r md:hover:from-purple-500 md:hover:to-pink-500 transition-all duration-300 inline-flex items-center justify-center md:hover:scale-110 md:hover:shadow-xl md:hover:shadow-pink-500/40"
                aria-label="אינסטגרם"
              >
                <Instagram className="h-6 w-6 md:h-8 md:w-8" color="#E4405F" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">השירותים שלנו</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              פתרונות מקצועיים ללימוד נהיגה והשכרת רכבים למורי נהיגה
            </p>
          </div>
          
          {/* Service Categories with Tabs */}
          <Tabs defaultValue="students" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                לתלמידים
              </TabsTrigger>
              <TabsTrigger value="instructors" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                למורי נהיגה
              </TabsTrigger>
            </TabsList>

            <TabsContent value="students">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4">שיעורי נהיגה לתלמידים</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  למד נהיגה בצורה מקצועית ובטוחה עם מורה מנוסה
                </p>
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  התחל ללמוד נהיגה
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="instructors">
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl p-8 text-center mb-8">
                <div className="mx-auto w-20 h-20 bg-accent rounded-full flex items-center justify-center mb-6">
                  <Car className="w-10 h-10 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-accent mb-4">השכרת רכבים למורי נהיגה</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  השכר רכבים מקצועיים עם בקרות כפולות לעבודה
                </p>
                <Button 
                  size="lg" 
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-accent hover:bg-accent-light text-accent-foreground"
                >
                  השכר רכב להוראה
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
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

      {/* Profile Section */}
      <ProfileSection />

      <Separator />

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">צור קשר</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              מוכן להתחיל? צור איתנו קשר עוד היום
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="text-center lg:text-right">
                <h3 className="text-2xl font-bold mb-6">פרטי יצירת קשר</h3>
                <div className="space-y-4">
                  <a href="tel:0503250150" className="flex items-center justify-center lg:justify-start space-x-4 hover:text-primary transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                    <span className="text-lg">0503250150</span>
                  </a>
                  <a href="mailto:hen1kahlon@gmail.com" className="flex items-center justify-center lg:justify-start space-x-4 hover:text-primary transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                    <span className="text-lg">hen1kahlon@gmail.com</span>
                  </a>
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
      <section id="reviews" className="py-16 bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">מה אומרים עלינו</h2>
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
