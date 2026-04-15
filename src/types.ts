export type UserRole = 'customer' | 'barber' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  imageUrl?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
export type BookingType = 'salon' | 'home';

export interface Booking {
  id: string;
  customerId: string;
  barberId: string;
  serviceId: string;
  date: string; // ISO date
  time: string; // HH:mm
  status: BookingStatus;
  type: BookingType;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
}

export interface BarberLocation {
  barberId: string;
  lat: number;
  lng: number;
  lastUpdated: string;
}

export interface BarberSchedule {
  barberId: string;
  date: string; // YYYY-MM-DD
  slots: {
    time: string; // HH:mm
    available: boolean;
  }[];
}
