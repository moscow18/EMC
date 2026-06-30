-- ============================================
-- EMC - Egyptian Medical Clinic Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEPARTMENTS
-- ============================================
CREATE TABLE departments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- DOCTORS
-- ============================================
CREATE TABLE doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  specialty TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  image_url TEXT,
  experience_years INT DEFAULT 0,
  description TEXT,
  education TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  review_count INT DEFAULT 0,
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  schedule JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- APPOINTMENTS
-- ============================================
CREATE TABLE appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SERVICES
-- ============================================
CREATE TABLE services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0
);

-- ============================================
-- OFFERS
-- ============================================
CREATE TABLE offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  discount_percentage INT DEFAULT 0,
  original_price DECIMAL(10,2),
  discounted_price DECIMAL(10,2),
  image_url TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5) DEFAULT 5,
  comment TEXT,
  doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- GALLERY
-- ============================================
CREATE TABLE gallery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CONTACTS
-- ============================================
CREATE TABLE contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SETTINGS
-- ============================================
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SEED DATA
-- ============================================

-- Departments
INSERT INTO departments (name, name_ar, description, icon, sort_order) VALUES
('Cardiology', 'أمراض القلب', 'Expert cardiac care including diagnostics, interventional procedures, and preventive cardiology.', 'Heart', 1),
('Dentistry', 'طب الأسنان', 'Complete dental solutions from routine checkups to cosmetic dentistry and oral surgery.', 'Smile', 2),
('Dermatology', 'الأمراض الجلدية', 'Advanced skin care treatments, cosmetic procedures, and dermatological diagnostics.', 'Sparkles', 3),
('Pediatrics', 'طب الأطفال', 'Compassionate healthcare for children from newborns to adolescents.', 'Baby', 4),
('Orthopedics', 'جراحة العظام', 'Specialized bone, joint, and muscle care including sports medicine and rehabilitation.', 'Bone', 5),
('ENT', 'أنف وأذن وحنجرة', 'Ear, nose, and throat specialist care for all ages.', 'Ear', 6),
('Neurology', 'أمراض المخ والأعصاب', 'Expert diagnosis and treatment of nervous system disorders.', 'Brain', 7),
('Gynecology', 'أمراض النساء والتوليد', 'Comprehensive women''s health services and obstetric care.', 'HeartPulse', 8);

-- Doctors
INSERT INTO doctors (name, name_ar, specialty, department_id, experience_years, rating, review_count, consultation_fee, description) VALUES
('Dr. Ahmed Hassan', 'د. أحمد حسن', 'Cardiologist', (SELECT id FROM departments WHERE name='Cardiology'), 15, 4.9, 234, 500, 'Senior Consultant of Cardiology with extensive experience in interventional cardiology and cardiac catheterization.'),
('Dr. Sara Mohamed', 'د. سارة محمد', 'Dentist', (SELECT id FROM departments WHERE name='Dentistry'), 10, 4.8, 189, 350, 'Specialist in cosmetic dentistry, dental implants, and smile design.'),
('Dr. Khaled Ibrahim', 'د. خالد إبراهيم', 'Dermatologist', (SELECT id FROM departments WHERE name='Dermatology'), 12, 4.7, 312, 400, 'Expert in clinical and cosmetic dermatology, laser treatments, and skin rejuvenation.'),
('Dr. Mona El-Sayed', 'د. منى السيد', 'Pediatrician', (SELECT id FROM departments WHERE name='Pediatrics'), 18, 4.9, 456, 300, 'Highly experienced pediatrician specializing in childhood development and neonatal care.'),
('Dr. Omar Farid', 'د. عمر فريد', 'Orthopedic Surgeon', (SELECT id FROM departments WHERE name='Orthopedics'), 20, 4.8, 278, 600, 'Consultant orthopedic surgeon specialized in joint replacement and sports injuries.'),
('Dr. Fatma Ali', 'د. فاطمة علي', 'ENT Specialist', (SELECT id FROM departments WHERE name='ENT'), 8, 4.6, 145, 350, 'ENT specialist with focus on sinus surgery and hearing disorders.'),
('Dr. Youssef Nabil', 'د. يوسف نبيل', 'Neurologist', (SELECT id FROM departments WHERE name='Neurology'), 14, 4.7, 198, 550, 'Expert neurologist specializing in headache disorders, epilepsy, and neurodegenerative diseases.'),
('Dr. Nadia Kamal', 'د. نادية كمال', 'Gynecologist', (SELECT id FROM departments WHERE name='Gynecology'), 16, 4.9, 387, 450, 'Leading gynecologist and obstetrician with expertise in high-risk pregnancies.');

-- Services
INSERT INTO services (title, title_ar, description, icon, sort_order) VALUES
('Clinic Visit', 'زيارة العيادة', 'Book an in-person appointment with any of our expert doctors. Modern facilities and comfortable environment.', 'Stethoscope', 1),
('Telemedicine', 'الطب عن بُعد', 'Consult with our doctors online from the comfort of your home via video call.', 'Video', 2),
('Home Visit', 'زيارة منزلية', 'Our doctors can visit you at home for medical examinations and follow-ups.', 'Home', 3),
('Laboratory', 'المعمل', 'Complete laboratory services including blood tests, imaging, and diagnostic procedures.', 'FlaskConical', 4);

-- Offers
INSERT INTO offers (title, description, discount_percentage, original_price, discounted_price, expiry_date) VALUES
('Dental Cleaning Package', 'Professional dental cleaning and polishing with full dental examination.', 20, 500, 400, '2026-08-31'),
('Full Body Checkup', 'Comprehensive health checkup including blood tests, ECG, and doctor consultation.', 30, 2000, 1400, '2026-07-31'),
('Dermatology Consultation', 'Skin consultation with free skin analysis using advanced technology.', 15, 400, 340, '2026-09-15'),
('Pediatric Vaccination Package', 'Complete vaccination schedule for children with pediatrician consultation.', 25, 800, 600, '2026-08-15');

-- Reviews
INSERT INTO reviews (patient_name, rating, comment, doctor_id) VALUES
('Ahmed Mohamed', 5, 'Excellent doctor! Very professional and caring. The clinic is modern and clean.', (SELECT id FROM doctors WHERE name='Dr. Ahmed Hassan')),
('Fatma Ibrahim', 5, 'Dr. Sara is amazing. Best dental experience I have ever had. Highly recommended!', (SELECT id FROM doctors WHERE name='Dr. Sara Mohamed')),
('Mohamed Ali', 4, 'Great experience overall. The staff is friendly and the waiting time was minimal.', (SELECT id FROM doctors WHERE name='Dr. Khaled Ibrahim')),
('Nour El-Din', 5, 'Dr. Mona is wonderful with children. My kids love visiting her clinic.', (SELECT id FROM doctors WHERE name='Dr. Mona El-Sayed')),
('Heba Mahmoud', 5, 'Professional orthopedic care. Dr. Omar helped me recover from my knee injury quickly.', (SELECT id FROM doctors WHERE name='Dr. Omar Farid')),
('Karim Hassan', 4, 'Very knowledgeable ENT specialist. Solved my hearing issue efficiently.', (SELECT id FROM doctors WHERE name='Dr. Fatma Ali'));

-- Settings
INSERT INTO settings (key, value) VALUES
('clinic_name', 'EMC - Egyptian Medical Clinic'),
('phone', '+20 123 456 7890'),
('whatsapp', '+201234567890'),
('email', 'info@emc-clinic.com'),
('address', 'Cairo, Egypt - Nasr City, Abbas El-Akkad Street'),
('working_hours', 'Saturday - Thursday: 9:00 AM - 10:00 PM'),
('google_maps_embed', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.123!2d31.345!3d30.056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2zMzDCsDAzJzIyLjAiTiAzMcKwMjAnNDIuMCJF!5e0!3m2!1sen!2seg!4v1234567890');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read offers" ON offers FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON settings FOR SELECT USING (true);

-- Public insert for appointments & contacts
CREATE POLICY "Public insert appointments" ON appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Authenticated full access for admin
CREATE POLICY "Admin full access departments" ON departments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access doctors" ON doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access appointments" ON appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access offers" ON offers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access contacts" ON contacts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (auth.role() = 'authenticated');
