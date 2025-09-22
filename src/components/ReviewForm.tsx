import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Review } from '../types';
import { Star, User, MessageCircle } from 'lucide-react';

interface ReviewFormProps {
  onReviewSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const ReviewForm = ({ onReviewSubmit }: ReviewFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.comment) {
      toast({
        title: 'שגיאה',
        description: 'אנא מלא את כל השדות',
        variant: 'destructive'
      });
      return;
    }

    onReviewSubmit(formData);
    setFormData({
      name: '',
      rating: 5,
      comment: ''
    });

    toast({
      title: 'תודה!',
      description: 'הביקורת שלך נשלחה לאישור ותופיע באתר לאחר אישור מנהל',
      variant: 'default'
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 cursor-pointer transition-colors ${
          i < formData.rating 
            ? 'fill-accent text-accent' 
            : 'text-muted-foreground hover:text-accent'
        }`}
        onClick={() => setFormData({ ...formData, rating: i + 1 })}
      />
    ));
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md border-0 bg-background/95 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-primary">השאר ביקורת</CardTitle>
        <CardDescription className="text-muted-foreground">
          שתף את החוויה שלך עם חן כחלון
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reviewName" className="text-base font-medium flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              שם מלא *
            </Label>
            <Input
              id="reviewName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הכנס את שמך המלא"
              className="h-12 text-base border-2 focus:border-primary"
              required
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">דירוג השירות</Label>
            <div className="flex items-center gap-2 justify-center p-4 bg-muted/50 rounded-lg">
              {renderStars()}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment" className="text-base font-medium flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              הודעה נוספת
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="ספר לנו עוד על הצרכים שלך..."
              rows={4}
              className="text-base border-2 focus:border-primary resize-none"
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            שלח ביקורת
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;