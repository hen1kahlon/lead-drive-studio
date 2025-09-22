import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '../hooks/use-toast';
import { Lead } from '../types';
import { Phone, Mail, User, MessageCircle } from 'lucide-react';

interface LeadFormProps {
  onLeadSubmit: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
}

const LeadForm = ({ onLeadSubmit }: LeadFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'driving-lessons' as 'driving-lessons' | 'car-rental',
    licenseType: 'B' as 'B' | 'A' | 'A1' | 'A2',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: 'שגיאה',
        description: 'אנא מלא את כל השדות הנדרשים',
        variant: 'destructive'
      });
      return;
    }

    onLeadSubmit(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      service: 'driving-lessons',
      licenseType: 'B',
      message: ''
    });

    toast({
      title: 'תודה!',
      description: 'פנייתך התקבלה בהצלחה. ניצור איתך קשר בקרוב',
      variant: 'default'
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="text-2xl">צור קשר עכשיו</CardTitle>
        <CardDescription className="text-primary-foreground/90">
          מלא את הפרטים ונחזור אליך בהקדם
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              שם מלא *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הכנס את שמך המלא"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              אימייל *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="הכנס את כתובת האימייל שלך"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              טלפון *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="050-123-4567"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>סוג השירות</Label>
            <RadioGroup
              value={formData.service}
              onValueChange={(value: 'driving-lessons' | 'car-rental') => 
                setFormData({ ...formData, service: value })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driving-lessons" id="lessons" />
                <Label htmlFor="lessons">שיעורי נהיגה</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="car-rental" id="rental" />
                <Label htmlFor="rental">השכרת רכב למורים</Label>
              </div>
            </RadioGroup>
          </div>
          {formData.service === 'driving-lessons' && (
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-medium">דרגת רישיון נהיגה</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="radio"
                    id="licenseB"
                    name="licenseType"
                    value="B"
                    checked={formData.licenseType === 'B'}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as 'B' | 'A' | 'A1' | 'A2' })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="licenseB" className="cursor-pointer text-sm">B (אוטומט)</Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="radio"
                    id="licenseA"
                    name="licenseType"
                    value="A"
                    checked={formData.licenseType === 'A'}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as 'B' | 'A' | 'A1' | 'A2' })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="licenseA" className="cursor-pointer text-sm">A</Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="radio"
                    id="licenseA1"
                    name="licenseType"
                    value="A1"
                    checked={formData.licenseType === 'A1'}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as 'B' | 'A' | 'A1' | 'A2' })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="licenseA1" className="cursor-pointer text-sm">A1</Label>
                </div>
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <input
                    type="radio"
                    id="licenseA2"
                    name="licenseType"
                    value="A2"
                    checked={formData.licenseType === 'A2'}
                    onChange={(e) => setFormData({ ...formData, licenseType: e.target.value as 'B' | 'A' | 'A1' | 'A2' })}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="licenseA2" className="cursor-pointer text-sm">A2</Label>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              הודעה נוספת
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="ספר לנו עוד על הצרכים שלך..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-accent hover:bg-accent-light text-accent-foreground font-bold py-3">
            שלח פנייה
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeadForm;