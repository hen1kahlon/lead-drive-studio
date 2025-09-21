import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Lead, Review } from '../types';
import { Users, MessageSquare, Settings, Trash2, Mail, Phone, Calendar, Star, Download, Facebook, Instagram, MessageCircle, Save, Shield, Key, User, Upload, Camera, Music, Plus, Edit2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import * as XLSX from 'xlsx';

interface SocialMedia {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
}

interface ProfileData {
  image?: string;
  description?: string;
}

interface Student {
  id: string;
  name: string;
  status: string;
  year: string;
  passed: boolean;
  theory_test_passed: boolean;
  practical_test_passed: boolean;
  lessons_completed: number;
  created_at: Date;
  updated_at: Date;
}

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia>({});
  const [tempSocialMedia, setTempSocialMedia] = useState<SocialMedia>({});
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [tempProfileData, setTempProfileData] = useState<ProfileData>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    year: '2024',
    status: 'בלימוד'
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    // Load data from localStorage (in real app, this would come from Supabase)
    const savedLeads = localStorage.getItem('leads');
    const savedReviews = localStorage.getItem('reviews');
    const savedSocialMedia = localStorage.getItem('socialMedia');
    const savedProfile = localStorage.getItem('profileData');
    
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
    if (savedSocialMedia) {
      const parsed = JSON.parse(savedSocialMedia);
      setSocialMedia(parsed);
      setTempSocialMedia(parsed);
    }
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfileData(parsed);
      setTempProfileData(parsed);
    }
    
    // Load students from Supabase
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students_real')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const studentsData = data?.map(student => ({
        ...student,
        created_at: new Date(student.created_at),
        updated_at: new Date(student.updated_at)
      })) || [];
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת התלמידים",
        variant: "destructive",
      });
    }
  };

  const addStudent = async () => {
    if (!newStudent.name.trim()) {
      toast({
        title: "שגיאה",
        description: "שם התלמיד הוא שדה חובה",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students_real')
        .insert([{
          name: newStudent.name,
          status: newStudent.status,
          year: newStudent.year,
          passed: newStudent.status === 'עבר'
        }])
        .select()
        .single();

      if (error) throw error;

      const studentData: Student = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      };

      setStudents([studentData, ...students]);
      setNewStudent({ name: '', year: '2024', status: 'בלימוד' });
      setShowAddStudent(false);
      
      toast({
        title: "הצלחה",
        description: "התלמיד נוסף בהצלחה",
      });
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהוספת התלמיד",
        variant: "destructive",
      });
    }
  };

  const updateStudentStatus = async (id: string, field: string, value: any) => {
    try {
      const updateData: any = { [field]: value };
      
      // Update status based on test results
      if (field === 'theory_test_passed' || field === 'practical_test_passed') {
        const student = students.find(s => s.id === id);
        if (student) {
          const updatedStudent = { ...student, [field]: value };
          if (updatedStudent.theory_test_passed && updatedStudent.practical_test_passed) {
            updateData.status = 'סיים בהצלחה';
            updateData.passed = true;
          } else {
            updateData.status = 'בתהליך לימוד';
            updateData.passed = false;
          }
        }
      }

      const { error } = await supabase
        .from('students_real')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setStudents(students.map(student => 
        student.id === id 
          ? { ...student, ...updateData, updated_at: new Date() }
          : student
      ));

      toast({
        title: "הצלחה",
        description: "הנתונים עודכנו בהצלחה",
      });
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הנתונים",
        variant: "destructive",
      });
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('students_real')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(students.filter(student => student.id !== id));
      
      toast({
        title: "הצלחה",
        description: "התלמיד נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת התלמיד",
        variant: "destructive",
      });
    }
  };

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

  const exportToExcel = (data: any[], filename: string, sheetName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const exportLeads = () => {
    const leadsData = leads.map(lead => ({
      'שם': lead.name,
      'אימייל': lead.email,
      'טלפון': lead.phone,
      'סוג שירות': lead.service === 'driving-lessons' ? 'שיעורי נהיגה' : 'השכרת רכב',
      'הודעה': lead.message || '',
      'תאריך': lead.createdAt.toLocaleDateString('he-IL')
    }));
    exportToExcel(leadsData, 'לידים', 'לידים');
  };

  const exportReviews = () => {
    const reviewsData = reviews.map(review => ({
      'שם': review.name,
      'דירוג': review.rating,
      'הערה': review.comment,
      'תאריך': review.createdAt.toLocaleDateString('he-IL')
    }));
    exportToExcel(reviewsData, 'ביקורות', 'ביקורות');
  };

  const saveSocialMedia = () => {
    setSocialMedia(tempSocialMedia);
    localStorage.setItem('socialMedia', JSON.stringify(tempSocialMedia));
    // Trigger header refresh by dispatching a custom event
    window.dispatchEvent(new CustomEvent('socialMediaUpdated'));
    
    toast({
      title: 'נשמר בהצלחה!',
      description: 'הגדרות הרשתות החברתיות עודכנו',
      variant: 'default'
    });
  };

  const saveProfileData = () => {
    setProfileData(tempProfileData);
    localStorage.setItem('profileData', JSON.stringify(tempProfileData));
    // Trigger profile update event
    window.dispatchEvent(new CustomEvent('profileUpdated'));
    
    toast({
      title: 'נשמר בהצלחה!',
      description: 'פרטי הפרופיל עודכנו',
      variant: 'default'
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileData({
          ...tempProfileData,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">דשבורד ניהול</h1>
          <p className="text-lg md:text-xl text-muted-foreground">ניהול לידים, ביקורות והגדרות האתר</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto p-1">
            <TabsTrigger value="leads" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">לידים</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">ביקורות</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
              <Users className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">תלמידים</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-success data-[state=active]:text-success-foreground">
              <User className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">פרופיל</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Facebook className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">רשתות</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3 data-[state=active]:bg-warning data-[state=active]:text-warning-foreground">
              <Shield className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">אבטחה</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      ניהול לידים
                    </CardTitle>
                    <CardDescription>
                      כל הפניות שהתקבלו דרך אתר האינטרנט
                    </CardDescription>
                  </div>
                  {leads.length > 0 && (
                    <Button onClick={exportLeads} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      ייצא לאקסל
                    </Button>
                  )}
                </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      ניהול ביקורות
                    </CardTitle>
                    <CardDescription>
                      כל הביקורות שהתקבלו מהתלמידים
                    </CardDescription>
                  </div>
                  {reviews.length > 0 && (
                    <Button onClick={exportReviews} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      ייצא לאקסל
                    </Button>
                  )}
                </div>
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

          <TabsContent value="students">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      ניהול תלמידים
                    </CardTitle>
                    <CardDescription>
                      כל התלמידים שלך - נוכחיים ובוגרים
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    הוסף תלמיד
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddStudent && (
                  <div className="mb-6 p-4 bg-muted rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">הוסף תלמיד חדש</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="studentName">שם מלא *</Label>
                        <Input
                          id="studentName"
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                          placeholder="הכנס שם מלא"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentStatus">סטטוס</Label>
                        <Select 
                          value={newStudent.status}
                          onValueChange={(value) => setNewStudent({ ...newStudent, status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר סטטוס" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="בלימוד">בלימוד</SelectItem>
                            <SelectItem value="עבר">עבר</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="studentYear">שנת לימוד</Label>
                        <Input
                          id="studentYear"
                          value={newStudent.year}
                          onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                          placeholder="הכנס שנת לימוד (למשל 2024)"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={addStudent} className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        שמור
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowAddStudent(false);
                          setNewStudent({ name: '', year: '2024', status: 'בלימוד' });
                        }}
                        className="flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        ביטול
                      </Button>
                    </div>
                  </div>
                )}

                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    עדיין לא נוספו תלמידים
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>שם</TableHead>
                              <TableHead>סטטוס</TableHead>
                              <TableHead>שנה</TableHead>
                              <TableHead>פעולות</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {students.map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                  {student.name}
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={student.passed ? 'passed' : 'learning'}
                                    onValueChange={(value) => {
                                      const passed = value === 'passed';
                                      const status = passed ? 'עבר' : 'בלימוד';
                                      updateStudentStatus(student.id, 'passed', passed);
                                      updateStudentStatus(student.id, 'status', status);
                                    }}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="learning">בלימוד</SelectItem>
                                      <SelectItem value="passed">עבר</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  {student.year}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deleteStudent(student.id)}
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

          <TabsContent value="profile">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  פרופיל אישי
                </CardTitle>
                <CardDescription>
                  הוסף תמונת פרופיל ותיאור אישי שיוצגו באתר
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      תמונת פרופיל
                    </Label>
                    <div className="flex flex-col items-center gap-4">
                      {tempProfileData.image ? (
                        <div className="relative">
                          <img 
                            src={tempProfileData.image} 
                            alt="תמונת פרופיל"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                            onClick={() => setTempProfileData({...tempProfileData, image: undefined})}
                          >
                            ×
                          </Button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2 w-full">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="profile-image"
                        />
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('profile-image')?.click()}
                          className="flex items-center gap-2 w-full sm:w-auto"
                        >
                          <Upload className="w-4 h-4" />
                          {tempProfileData.image ? 'שנה תמונה' : 'העלה תמונה'}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                          מומלץ: תמונה בגודל 400x400 פיקסלים
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      תיאור אישי
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="כתוב כאן על עצמך כמורה נהיגה ומשכיר רכבי הוראה..."
                      value={tempProfileData.description || ''}
                      onChange={(e) => setTempProfileData({...tempProfileData, description: e.target.value})}
                      rows={4}
                      className="resize-none"
                    />
                    <p className="text-sm text-muted-foreground">
                      התיאור יוצג באתר לצד תמונת הפרופיל
                    </p>
                  </div>
                </div>
                
                <Button onClick={saveProfileData} className="flex items-center gap-2 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  שמור פרופיל
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="w-5 h-5" />
                  ניהול רשתות חברתיות
                </CardTitle>
                <CardDescription>
                  הוסף קישורים לרשתות החברתיות שיוצגו בראש הדף
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      פייסבוק
                    </Label>
                    <Input
                      id="facebook"
                      type="url"
                      placeholder="https://facebook.com/yourprofile"
                      value={tempSocialMedia.facebook || ''}
                      onChange={(e) => setTempSocialMedia({...tempSocialMedia, facebook: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      אינסטגרם
                    </Label>
                    <Input
                      id="instagram"
                      type="url"
                      placeholder="https://instagram.com/yourprofile"
                      value={tempSocialMedia.instagram || ''}
                      onChange={(e) => setTempSocialMedia({...tempSocialMedia, instagram: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tiktok" className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      טיקטוק
                    </Label>
                    <Input
                      id="tiktok"
                      type="url"
                      placeholder="https://tiktok.com/@yourprofile"
                      value={tempSocialMedia.tiktok || ''}
                      onChange={(e) => setTempSocialMedia({...tempSocialMedia, tiktok: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      וואטסאפ
                    </Label>
                    <Input
                      id="whatsapp"
                      type="url"
                      placeholder="https://wa.me/972503250150"
                      value={tempSocialMedia.whatsapp || ''}
                      onChange={(e) => setTempSocialMedia({...tempSocialMedia, whatsapp: e.target.value})}
                    />
                  </div>
                </div>
                
                <Button onClick={saveSocialMedia} className="flex items-center gap-2 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  שמור שינויים
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    אבטחה וניהול
                  </CardTitle>
                  <CardDescription>
                    המלצות אבטחה וניהול המערכת
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <h4 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      המלצות אבטחה חשובות
                    </h4>
                    <ul className="text-sm space-y-2 text-foreground">
                      <li className="flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5 text-destructive" />
                        <span><strong>שנה את פרטי ההתחברות:</strong> כרגע המערכת משתמשת בfixed credentials (admin/admin). מומלץ להוסיף מסד נתונים לניהול משתמשים מאובטח.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5 text-destructive" />
                        <span><strong>הצפנת נתונים:</strong> כרגע הנתונים נשמרים ב-localStorage. מומלץ לעבור ל-Supabase לאחסון מאובטח.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5 text-destructive" />
                        <span><strong>HTTPS:</strong> ודא שהאתר פועל תמיד תחת HTTPS בפרודקשן.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Key className="w-4 h-4 mt-0.5 text-destructive" />
                        <span><strong>גיבויים:</strong> הגדר גיבויים אוטומטיים לנתונים החשובים.</span>
                      </li>
                    </ul>
                  </div>
                  
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
                      <CardTitle className="text-lg">שדרוגים מומלצים</CardTitle>
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;