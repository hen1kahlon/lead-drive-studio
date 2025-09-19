import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import { Lead, Review } from '../types';
import { Users, MessageSquare, Settings, Trash2, Mail, Phone, Calendar, Star } from 'lucide-react';
import Header from '../components/Header';

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Load data from localStorage (in real app, this would come from Supabase)
    const savedLeads = localStorage.getItem('leads');
    const savedReviews = localStorage.getItem('reviews');
    
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads).map((lead: any) => ({
        ...lead,
        createdAt: new Date(lead.createdAt)
      })));
    }
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews).map((review: any) => ({
        ...review,
        createdAt: new Date(review.createdAt)
      })));
    }
  }, []);

  const deleteLead = (id: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== id);
    setLeads(updatedLeads);
    localStorage.setItem('leads', JSON.stringify(updatedLeads));
  };

  const deleteReview = (id: string) => {
    const updatedReviews = reviews.filter(review => review.id !== id);
    setReviews(updatedReviews);
    localStorage.setItem('reviews', JSON.stringify(updatedReviews));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-accent text-accent' : 'text-muted-foreground'
        }`}
      />
    ));
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">דשבורד ניהול</h1>
          <p className="text-xl text-muted-foreground">ניהול לידים, ביקורות והגדרות האתר</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">סך הלידים</p>
                  <p className="text-3xl font-bold text-primary">{leads.length}</p>
                </div>
                <Users className="w-12 h-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ביקורות</p>
                  <p className="text-3xl font-bold text-accent">{reviews.length}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">דירוג ממוצע</p>
                  <p className="text-3xl font-bold text-success">
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : 'N/A'
                    }
                  </p>
                </div>
                <Star className="w-12 h-12 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              לידים
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              ביקורות
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              הגדרות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  ניהול לידים
                </CardTitle>
                <CardDescription>
                  כל הפניות שהתקבלו דרך אתר האינטרנט
                </CardDescription>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    עדיין לא התקבלו פניות
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>שם</TableHead>
                          <TableHead>אימייל</TableHead>
                          <TableHead>טלפון</TableHead>
                          <TableHead>סוג שירות</TableHead>
                          <TableHead>תאריך</TableHead>
                          <TableHead>פעולות</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="font-medium">{lead.name}</TableCell>
                            <TableCell>
                              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Mail className="w-4 h-4" />
                                {lead.email}
                              </a>
                            </TableCell>
                            <TableCell>
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                                <Phone className="w-4 h-4" />
                                {lead.phone}
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant={lead.service === 'driving-lessons' ? 'default' : 'secondary'}>
                                {lead.service === 'driving-lessons' ? 'שיעורי נהיגה' : 'השכרת רכב'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {lead.createdAt.toLocaleDateString('he-IL')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteLead(lead.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  ניהול ביקורות
                </CardTitle>
                <CardDescription>
                  כל הביקורות שהתקבלו מהתלמידים
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    עדיין לא התקבלו ביקורות
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{review.name}</h4>
                                <div className="flex items-center gap-1">
                                  {renderStars(review.rating)}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {review.createdAt.toLocaleDateString('he-IL')}
                                </span>
                              </div>
                              <p className="text-foreground">{review.comment}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteReview(review.id)}
                              className="ml-4"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  הגדרות האתר
                </CardTitle>
                <CardDescription>
                  ניהול הגדרות כלליות ותצורת האתר
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">פרטי יצירת קשר</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>שם:</strong> חן כחלון</p>
                      <p><strong>טלפון:</strong> 0503250150</p>
                      <p><strong>אימייל:</strong> hen1kahlon@gmail.com</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">סטטיסטיקות האתר</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p><strong>סך הלידים:</strong> {leads.length}</p>
                      <p><strong>סך הביקורות:</strong> {reviews.length}</p>
                      <p><strong>דירוג ממוצע:</strong> {
                        reviews.length > 0 
                          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : 'N/A'
                      }</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">הודעה חשובה</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <p className="text-foreground">
                        <strong>לתפעול מלא של המערכת:</strong> כדי לשמור נתונים באופן קבוע ולהוסיף תכונות כמו אותנטיפיקציה מתקדמת, 
                        מסד נתונים מרכזי ושליחת מיילים אוטומטיים, מומלץ להתחבר לSupabase.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;