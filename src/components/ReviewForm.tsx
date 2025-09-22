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
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">השאר ביקורת</CardTitle>
        <CardDescription>
          שתף את החוויה שלך עם חן כחלון
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reviewName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              שם
            </Label>
            <Input
              id="reviewName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="הכנס את שמך"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>דירוג</Label>
            <div className="flex items-center gap-1">
              {renderStars()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              ביקורת
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="ספר לנו על החוויה שלך..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            שלח ביקורת
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;