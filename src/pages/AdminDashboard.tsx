import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Lead, Review } from '../types';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'instructor' | 'student' | 'user';
  created_at: Date;
  email?: string;
  first_name?: string;
  last_name?: string;
}
import { Users, MessageSquare, Settings, Trash2, Mail, Phone, Calendar, Star, Download, Facebook, Instagram, MessageCircle, Save, Shield, Key, User, Upload, Camera, Music, Plus, Edit2, Check, X, Eye } from 'lucide-react';
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
  phone?: string;
  email?: string;
  notes?: string;
}

const AdminDashboard = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<any[]>([]);
  const [approvedTestimonials, setApprovedTestimonials] = useState<any[]>([]);
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
  
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastName, setNewAdminLastName] = useState('');
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/login');
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    // Load reviews and settings from localStorage
    const savedReviews = localStorage.getItem('reviews');
    const savedSocialMedia = localStorage.getItem('socialMedia');
    const savedProfile = localStorage.getItem('profileData');
    
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
    
    // Load leads and students from Supabase
    loadLeads();
    loadStudents();
    loadUserRoles();
    loadTestimonials();
  }, []);

  // Load localStorage data after authentication is confirmed
  useEffect(() => {
    if (loading || !user || !isAdmin) return;
    
    // Load data from localStorage only after authentication is confirmed
    const loadLocalData = () => {
      const savedSocialMedia = localStorage.getItem('socialMedia');
      const savedProfile = localStorage.getItem('profileData');
      
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
    };
    
    loadLocalData();
  }, [loading, user, isAdmin]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leads:', error);
        return;
      }

      if (data) {
        const leadsWithTypes = data.map(item => ({
          id: item.id,
          name: item.name,
          email: item.email || '',
          phone: item.phone || '',
          message: item.message || '',
          service: item.message?.includes('השכרת רכב') ? 'car-rental' as const : 'driving-lessons' as const,
          createdAt: new Date(item.created_at)
        }));
        setLeads(leadsWithTypes);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const { data: studentsData, error } = await supabase
        .from('students_real')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        return;
      }

      if (studentsData) {
        const students = studentsData.map(student => ({
          id: student.id,
          name: student.name,
          status: student.status,
          year: student.year,
          passed: student.passed,
          theory_test_passed: student.theory_test_passed,
          practical_test_passed: student.practical_test_passed,
          lessons_completed: student.lessons_completed,
          phone: student.phone || undefined,
          email: student.email || undefined,
          notes: student.notes || undefined
        }));
        setStudents(students);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadUserRoles = async () => {
    try {
      // First get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (rolesError) throw rolesError;
      
      // Group roles by user_id and get the highest priority role
      const userRoleMap = new Map<string, any>();
      const rolePriority = { 'admin': 3, 'instructor': 2, 'user': 1 };
      
      for (const role of rolesData || []) {
        const existing = userRoleMap.get(role.user_id);
        if (!existing || rolePriority[role.role as keyof typeof rolePriority] > rolePriority[existing.role as keyof typeof rolePriority]) {
          userRoleMap.set(role.user_id, role);
        }
      }
      
      // Then get profiles for each user
      const enrichedRoles: UserRole[] = [];
      
      for (const [userId, role] of userRoleMap) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', userId)
          .single();
          
        enrichedRoles.push({
          ...role,
          created_at: new Date(role.created_at),
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          email: '' // We can't get email from auth.users via API
        });
      }
      
      setUserRoles(enrichedRoles);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const loadTestimonials = async () => {
    try {
      // Load pending testimonials
      const { data: pendingData, error: pendingError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      if (pendingError) {
        console.error('Error loading pending testimonials:', pendingError);
      } else {
        setPendingTestimonials(pendingData || []);
      }

      // Load approved testimonials
      const { data: approvedData, error: approvedError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (approvedError) {
        console.error('Error loading approved testimonials:', approvedError);
      } else {
        setApprovedTestimonials(approvedData || []);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
    }
  };

  const approveTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "הביקורת אושרה ותופיע באתר",
      });

      loadTestimonials();
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה לאשר את הביקורת",
        variant: "destructive"
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "הצלחה",
        description: "הביקורת נמחקה",
      });

      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן היה למחוק את הביקורת",
        variant: "destructive"
      });
    }
  };

  const createNewAdmin = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: newAdminPassword,
        options: {
          data: {
            first_name: newAdminFirstName,
            last_name: newAdminLastName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Add admin role to the new user
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'admin'
          });

        if (roleError) throw roleError;

        toast({
          title: "הצלחה",
          description: "מנהל חדש נוצר בהצלחה",
        });

        // Clear form
        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminFirstName('');
        setNewAdminLastName('');
        
        // Reload user roles
        loadUserRoles();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה ביצירת מנהל חדש",
        variant: "destructive"
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First remove from user_roles table
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      toast({
        title: "הצלחה",
        description: "המשתמש הוסר מהמערכת",
      });

      loadUserRoles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהסרת המשתמש",
        variant: "destructive",
      });
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">טוען דشבורד...</div>
        </div>
      </div>
    );
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
                  <p className="text-sm text-muted-foreground">סך הביקורות</p>
                  <p className="text-3xl font-bold text-accent">{approvedTestimonials.length}</p>
                </div>
                <Star className="w-12 h-12 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">סך התלמידים</p>
                  <p className="text-3xl font-bold text-green-600">{students.length}</p>
                </div>
                <MessageSquare className="w-12 h-12 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
            <TabsTrigger value="leads" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">לידים</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">ביקורות</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3">
              <Users className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">תלמידים</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col items-center gap-1 sm:gap-2 h-auto py-3">
              <Settings className="w-5 h-5" />
              <span className="text-xs sm:text-sm font-medium">הגדרות</span>
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
                      כל הפניות שהתקבלו דרך הטופס באתר
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {leads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    עדיין לא התקבלו לידים
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שם</TableHead>
                        <TableHead>טלפון</TableHead>
                        <TableHead>אימייל</TableHead>
                        <TableHead>שירות</TableHead>
                        <TableHead>הודעה</TableHead>
                        <TableHead>תאריך</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leads.map((lead) => (
                        <TableRow 
                          key={lead.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsLeadDialogOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">{lead.name}</TableCell>
                          <TableCell>{lead.phone}</TableCell>
                          <TableCell>{lead.email}</TableCell>
                          <TableCell>
                            <Badge variant={lead.service === 'driving-lessons' ? 'default' : 'secondary'}>
                              {lead.service === 'driving-lessons' ? 'שיעורי נהיגה' : 'השכרת רכב'}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-48">
                            <div className="truncate" title={lead.message}>
                              {lead.message || 'אין הודעה'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lead.createdAt.toLocaleDateString('he-IL')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Lead Details Dialog */}
            <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>פרטי הליד</DialogTitle>
                  <DialogDescription>
                    פרטים מלאים של הפניה
                  </DialogDescription>
                </DialogHeader>
                {selectedLead && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">שם מלא</Label>
                        <p className="text-lg font-semibold">{selectedLead.name}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">תאריך יצירת קשר</Label>
                        <p className="text-lg">{selectedLead.createdAt.toLocaleDateString('he-IL')}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">אימייל</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <a 
                            href={`mailto:${selectedLead.email}`} 
                            className="text-primary hover:underline"
                          >
                            {selectedLead.email}
                          </a>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">טלפון</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <a 
                            href={`tel:${selectedLead.phone}`} 
                            className="text-primary hover:underline"
                          >
                            {selectedLead.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">סוג שירות</Label>
                        <div>
                          <Badge variant={selectedLead.service === 'driving-lessons' ? 'default' : 'secondary'} className="text-base">
                            {selectedLead.service === 'driving-lessons' ? 'שיעורי נהיגה' : 'השכרת רכב'}
                          </Badge>
                        </div>
                      </div>
                      
                      {selectedLead.message && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">הודעה</Label>
                          <div className="bg-muted p-4 rounded-md">
                            <p className="text-foreground whitespace-pre-wrap">{selectedLead.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between pt-4 border-t">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`mailto:${selectedLead.email}`, '_blank')}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          שלח מייל
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => window.open(`tel:${selectedLead.phone}`, '_blank')}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          התקשר
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
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
                      ביקורות שממתינות לאישור וביקורות מאושרות
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">ממתינות לאישור ({pendingTestimonials.length})</TabsTrigger>
                    <TabsTrigger value="approved">מאושרות ({approvedTestimonials.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="pending" className="space-y-4">
                    {pendingTestimonials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        אין ביקורות הממתינות לאישור
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingTestimonials.map((testimonial) => (
                          <Card key={testimonial.id} className="shadow-sm border-orange-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{testimonial.name}</h4>
                                    <div className="flex">
                                      {Array.from({ length: testimonial.rating }, (_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-foreground leading-relaxed mb-2">{testimonial.comment}</p>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(testimonial.created_at).toLocaleDateString('he-IL')}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => approveTestimonial(testimonial.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    אשר
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteTestimonial(testimonial.id)}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    דחה
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="approved" className="space-y-4">
                    {approvedTestimonials.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        אין ביקורות מאושרות
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {approvedTestimonials.map((testimonial) => (
                          <Card key={testimonial.id} className="shadow-sm border-green-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{testimonial.name}</h4>
                                    <div className="flex">
                                      {Array.from({ length: testimonial.rating }, (_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                                      ))}
                                    </div>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">מאושר</Badge>
                                  </div>
                                  <p className="text-foreground leading-relaxed mb-2">{testimonial.comment}</p>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(testimonial.created_at).toLocaleDateString('he-IL')}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteTestimonial(testimonial.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  מחק
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
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
                </div>
              </CardHeader>
              <CardContent>
                {students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    עדיין לא נוספו תלמידים
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>שם</TableHead>
                        <TableHead>שנה</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead>מבחן תיאוריה</TableHead>
                        <TableHead>מבחן מעשי</TableHead>
                        <TableHead>שיעורים</TableHead>
                        <TableHead>עבר מבחן</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>{student.year}</TableCell>
                          <TableCell>{student.status}</TableCell>
                          <TableCell>
                            <Badge variant={student.theory_test_passed ? 'default' : 'secondary'}>
                              {student.theory_test_passed ? 'עבר' : 'לא עבר'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.practical_test_passed ? 'default' : 'secondary'}>
                              {student.practical_test_passed ? 'עבר' : 'לא עבר'}
                            </Badge>
                          </TableCell>
                          <TableCell>{student.lessons_completed}</TableCell>
                          <TableCell>
                            <Badge variant={student.passed ? 'default' : 'secondary'}>
                              {student.passed ? 'כן' : 'לא'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    ניהול משתמשים
                  </CardTitle>
                  <CardDescription>
                    יצירת מנהלים חדשים וניהול הרשאות
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Create Admin Form */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">יצירת מנהל חדש</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">שם פרטי</Label>
                        <Input
                          id="firstName"
                          value={newAdminFirstName}
                          onChange={(e) => setNewAdminFirstName(e.target.value)}
                          placeholder="שם פרטי"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">שם משפחה</Label>
                        <Input
                          id="lastName"
                          value={newAdminLastName}
                          onChange={(e) => setNewAdminLastName(e.target.value)}
                          placeholder="שם משפחה"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">אימייל</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">סיסמה</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="סיסמה חזקה"
                      />
                    </div>
                    <Button 
                      onClick={createNewAdmin}
                      className="w-full"
                      disabled={!newAdminEmail || !newAdminPassword || !newAdminFirstName || !newAdminLastName}
                    >
                      צור מנהל חדש
                    </Button>
                  </div>
                  
                  {/* User List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">רשימת משתמשים</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {userRoles.map((userRole) => (
                        <div key={userRole.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex-1">
                            <p className="font-medium">{userRole.first_name} {userRole.last_name}</p>
                            <p className="text-sm text-muted-foreground">{userRole.role}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteUser(userRole.user_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    הגדרות אבטחה
                  </CardTitle>
                  <CardDescription>
                    ניהול והגדרות אבטחה למערכת
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                    <h4 className="font-semibold text-success mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      מערכת האבטחה מוכנה
                    </h4>
                    <ul className="text-sm space-y-2 text-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-success" />
                        <span><strong>אותנטיפיקציה:</strong> מערכת Supabase מאובטחת עם הצפנת JWT</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-success" />
                        <span><strong>הרשאות:</strong> Row Level Security (RLS) פעיל על כל הטבלאות</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-success" />
                        <span><strong>נתונים:</strong> מאוחסנים במסד נתונים מוצפן של Supabase</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 text-success" />
                        <span><strong>תקשורת:</strong> כל התקשורת מוצפנת HTTPS</span>
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
                        <CardTitle className="text-lg">סטטיסטיקות המערכת</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>מנהלים:</strong> {userRoles.filter(u => u.role === 'admin').length}</p>
                        <p><strong>משתמשים:</strong> {userRoles.length}</p>
                        <p><strong>לידים:</strong> {leads.length}</p>
                        <p><strong>ביקורות:</strong> {approvedTestimonials.length}</p>
                      </CardContent>
                    </Card>
                  </div>
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