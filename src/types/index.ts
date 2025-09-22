export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: 'driving-lessons' | 'car-rental';
  licenseType?: 'B' | 'A' | 'A1' | 'A2';
  message?: string;
  createdAt: Date;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}