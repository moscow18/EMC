export interface Department {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  name_ar?: string;
  specialty: string;
  department_id?: string;
  image_url?: string;
  experience_years: number;
  description?: string;
  education?: string;
  rating: number;
  review_count: number;
  consultation_fee: number;
  schedule: Record<string, string[]>;
  is_active: boolean;
  created_at: string;
  departments?: Department;
}

export interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email?: string;
  doctor_id?: string;
  department_id?: string;
  appointment_date: string;
  appointment_time: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  doctors?: Doctor;
  departments?: Department;
}

export interface Service {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  icon?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Offer {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  discount_percentage: number;
  original_price?: number;
  discounted_price?: number;
  image_url?: string;
  expiry_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  patient_name: string;
  rating: number;
  comment?: string;
  doctor_id?: string;
  is_approved: boolean;
  created_at: string;
  doctors?: Doctor;
}

export interface GalleryItem {
  id: string;
  title?: string;
  image_url: string;
  category?: string;
  sort_order: number;
  created_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}
