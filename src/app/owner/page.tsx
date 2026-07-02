'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Plus, Trash2, ArrowUpRight, 
  ArrowDownRight, PieChart, Loader2, Globe, HeartPulse, Stethoscope, 
  Tag, MapPin, Users, Building, Pencil, UserPlus, Check, X, AlertCircle, Key,
  Download, Upload, Save, Volume2, Play, Database, FileText, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { playNotificationSound } from '@/lib/audio';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
  id: string;
  patient_name: string;
  phone: string;
  email?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  doctor_id?: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface Doctor {
  id: string;
  name: string;
  name_ar?: string;
  specialty: string;
  experience_years: number;
  consultation_fee: number;
  rating: number;
  is_active: boolean;
  education?: string;
  description?: string;
  image_url?: string;
  schedule?: Record<string, string[]>;
}

interface Offer {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  discount_percentage: number;
  original_price: number;
  discounted_price: number;
  expiry_date?: string;
  is_active: boolean;
}

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  phone: string;
  is_active: boolean;
}

interface Receptionist {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  branch_id: string;
  is_active: boolean;
}

export default function OwnerDashboard() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const isAr = lang === 'ar';
  
  // Navigation Tabs: 'overview' | 'doctors' | 'offers' | 'branches' | 'receptionists' | 'settings_backup'
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'offers' | 'branches' | 'receptionists' | 'settings_backup'>('overview');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dbDoctors, setDbDoctors] = useState<Doctor[]>([]);
  const [dbOffers, setDbOffers] = useState<Offer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form States
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'other' });
  const [addingExpense, setAddingExpense] = useState(false);

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [savingDoctor, setSavingDoctor] = useState(false);
  interface DoctorFormState {
    name: string;
    name_ar: string;
    specialty: string;
    experience_years: number;
    consultation_fee: number;
    rating: number;
    is_active: boolean;
    education: string;
    description: string;
    image_url: string;
    schedule: Record<string, string[]>;
  }

  const [doctorForm, setDoctorForm] = useState<DoctorFormState>({
    name: '', name_ar: '', specialty: '', experience_years: 0,
    consultation_fee: 0, rating: 4.5, is_active: true, education: '', description: '', image_url: '',
    schedule: {}
  });

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '', title_ar: '', description: '', discount_percentage: 0,
    original_price: 0, discounted_price: 0, expiry_date: '', is_active: true
  });

  const [branchForm, setBranchForm] = useState({ name: '', name_ar: '', address: '', address_ar: '', phone: '', is_active: true });
  const [addingBranch, setAddingBranch] = useState(false);

  const [staffForm, setStaffForm] = useState({ name: '', email: '', phone: '', password: '', branch_id: '', is_active: true });
  const [addingStaff, setAddingStaff] = useState(false);
  
  // Receptionist Edit State
  const [editingStaff, setEditingStaff] = useState<Receptionist | null>(null);

  // Schedule Builder States
  const [schedDays, setSchedDays] = useState<string[]>([]);
  const [schedStartTime, setSchedStartTime] = useState('10:00');
  const [schedEndTime, setSchedEndTime] = useState('18:00');
  const [schedInterval, setSchedInterval] = useState(60);

  // Backup & Restore States
  const [showBackupWarning, setShowBackupWarning] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [backupError, setBackupError] = useState('');

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(1.0);
  const [soundType, setSoundType] = useState('double_beep');

  // Owner credentials form
  const [ownerPasswordForm, setOwnerPasswordForm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Load Everything
  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch appointments
      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      if (appts) setAppointments(appts);

      // 2. Fetch doctors
      const { data: docs } = await supabase
        .from('doctors')
        .select('*')
        .order('name', { ascending: true });
      if (docs) setDbDoctors(docs);

      // 3. Fetch offers
      const { data: offs } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (offs) setDbOffers(offs);

      // 4. Fetch expenses
      const { data: exps, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false });

      if (!expErr && exps) {
        setExpenses(exps);
      } else {
        const localExps = localStorage.getItem('emc_owner_expenses');
        if (localExps) {
          setExpenses(JSON.parse(localExps));
        } else {
          const defaultExps: Expense[] = [
            { id: '1', title: 'إيجار المقر الرئيسي / Office Rent', amount: 15000, category: 'rent', expense_date: '2026-06-01' },
            { id: '2', title: 'مرتبات الأطباء والموظفين / Salaries', amount: 35000, category: 'salaries', expense_date: '2026-06-25' },
            { id: '3', title: 'فواتير المياه والكهرباء / Utilities', amount: 3000, category: 'utilities', expense_date: '2026-06-10' },
          ];
          setExpenses(defaultExps);
          localStorage.setItem('emc_owner_expenses', JSON.stringify(defaultExps));
        }
      }

      // 5. Load Branches from LocalStorage
      const localBranches = localStorage.getItem('emc_branches');
      if (localBranches) {
        setBranches(JSON.parse(localBranches));
      } else {
        const defaultBranches: Branch[] = [
          { id: 'b1', name: 'Nasr City Branch', name_ar: 'فرع مدينة نصر', address: 'Abbas El-Akkad St, Cairo', address_ar: 'شارع عباس العقاد، القاهرة', phone: '+20 123 456 7890', is_active: true },
          { id: 'b2', name: 'Heliopolis Branch', name_ar: 'فرع مصر الجديدة', address: 'Merghany St, Heliopolis', address_ar: 'شارع المرغني، مصر الجديدة', phone: '+20 123 456 7891', is_active: true },
          { id: 'b3', name: 'New Cairo Branch', name_ar: 'فرع التجمع الخامس', address: '90th Street, New Cairo', address_ar: 'شارع التسعين، التجمع الخامس', phone: '+20 123 456 7892', is_active: true }
        ];
        setBranches(defaultBranches);
        localStorage.setItem('emc_branches', JSON.stringify(defaultBranches));
      }

      // 6. Load Receptionists from LocalStorage
      const localStaff = localStorage.getItem('emc_receptionists');
      if (localStaff) {
        setReceptionists(JSON.parse(localStaff));
      } else {
        const defaultStaff: Receptionist[] = [
          { id: 'r1', name: 'مريم ياسين', email: 'mariam@emc.com', phone: '01012345678', password: '123', branch_id: 'b2', is_active: true },
          { id: 'r2', name: 'عمرو خالد', email: 'amr.k@emc.com', phone: '01112345679', password: '123', branch_id: 'b1', is_active: true },
          { id: 'r3', name: 'سهيلة أحمد', email: 'sohaila@emc.com', phone: '01212345680', password: '123', branch_id: 'b3', is_active: true }
        ];
        setReceptionists(defaultStaff);
        localStorage.setItem('emc_receptionists', JSON.stringify(defaultStaff));
      }

      // Check last backup warning
      const lastBackup = localStorage.getItem('emc_last_backup_date');
      if (!lastBackup) {
        setShowBackupWarning(true);
      } else {
        const diffDays = (Date.now() - Number(lastBackup)) / (1000 * 60 * 60 * 24);
        if (diffDays >= 7) {
          setShowBackupWarning(true);
        }
      }

      // Check sound settings
      const storedSoundEnabled = localStorage.getItem('emc_notifications_sound_enabled');
      setSoundEnabled(storedSoundEnabled === null ? true : storedSoundEnabled === 'true');
      const storedVolume = localStorage.getItem('emc_notifications_volume');
      setSoundVolume(storedVolume ? Number(storedVolume) : 1.0);
      const storedSoundType = localStorage.getItem('emc_notification_sound');
      setSoundType(storedSoundType || 'double_beep');

      const savedOwnerPass = localStorage.getItem('emc_owner_password') || 'EMC_Owner_2026!#';
      setOwnerPasswordForm(savedOwnerPass);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Summary Metrics calculations
  const getDoctorFee = (docId?: string) => {
    if (!docId) return 300;
    const doc = dbDoctors.find(d => d.id === docId);
    return doc ? Number(doc.consultation_fee) : 300;
  };

  const getDoctorName = (docId?: string) => {
    if (!docId) return isAr ? 'طبيب عام' : 'General Practitioner';
    const doc = dbDoctors.find(d => d.id === docId);
    return doc ? (isAr ? doc.name_ar || doc.name : doc.name) : (isAr ? 'طبيب عام' : 'General Practitioner');
  };

  const activeBookings = appointments.filter(a => a.status === 'confirmed' || a.status === 'completed');
  const totalRevenue = activeBookings.reduce((sum, appt) => sum + getDoctorFee(appt.doctor_id), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  // Expense Handlers
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;

    setAddingExpense(true);
    const amountNum = parseFloat(expenseForm.amount);
    const expenseItem = {
      title: expenseForm.title,
      amount: amountNum,
      category: expenseForm.category,
      expense_date: new Date().toISOString().split('T')[0]
    };

    try {
      const { error } = await supabase.from('expenses').insert([expenseItem]);
      if (error) {
        // Local fallback
        const updated = [
          { id: Math.random().toString(), ...expenseItem },
          ...expenses
        ];
        setExpenses(updated);
        localStorage.setItem('emc_owner_expenses', JSON.stringify(updated));
      } else {
        loadData();
      }
      setExpenseForm({ title: '', amount: '', category: 'other' });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingExpense(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المصروف؟' : 'Are you sure you want to delete this expense?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) {
        const updated = expenses.filter(e => e.id !== id);
        setExpenses(updated);
        localStorage.setItem('emc_owner_expenses', JSON.stringify(updated));
      } else {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Doctor photo file upload converter
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoctorForm((p: any) => ({ ...p, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Doctor Handlers
  const openDoctorModal = (doc?: Doctor) => {
    if (doc) {
      setEditingDoctor(doc);
      setDoctorForm({
        name: doc.name,
        name_ar: doc.name_ar || '',
        specialty: doc.specialty,
        experience_years: doc.experience_years,
        consultation_fee: doc.consultation_fee,
        rating: doc.rating,
        is_active: doc.is_active,
        education: doc.education || '',
        description: doc.description || '',
        image_url: doc.image_url || '',
        schedule: doc.schedule || {}
      });
    } else {
      setEditingDoctor(null);
      setDoctorForm({
        name: '', name_ar: '', specialty: '', experience_years: 5,
        consultation_fee: 300, rating: 4.8, is_active: true, education: '', description: '', image_url: '',
        schedule: {}
      });
    }
    setSchedDays([]);
    setSchedStartTime('10:00');
    setSchedEndTime('18:00');
    setSchedInterval(60);
    setDoctorModalOpen(true);
  };

  const generateSlots = (startTimeStr: string, endTimeStr: string, intervalMin = 60) => {
    const slots = [];
    const [startH, startM] = startTimeStr.split(':').map(Number);
    const [endH, endM] = endTimeStr.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    
    const end = new Date();
    end.setHours(endH, endM, 0, 0);
    
    while (current <= end) {
      let hours = current.getHours();
      const minutes = current.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const hourStr = hours < 10 ? '0' + hours : hours;
      slots.push(`${hourStr}:${minutesStr} ${ampm}`);
      
      current.setMinutes(current.getMinutes() + intervalMin);
    }
    return slots;
  };

  const handleApplySchedule = () => {
    if (schedDays.length === 0) {
      alert(isAr ? 'يرجى اختيار يوم واحد على الأقل.' : 'Please select at least one day.');
      return;
    }
    const generated = generateSlots(schedStartTime, schedEndTime, schedInterval);
    if (generated.length === 0) {
      alert(isAr ? 'يرجى إدخال مواعيد صحيحة.' : 'Please choose valid times.');
      return;
    }
    const updatedSchedule = { ...doctorForm.schedule };
    schedDays.forEach(day => {
      updatedSchedule[day] = generated;
    });
    setDoctorForm((p: any) => ({ ...p, schedule: updatedSchedule }));
    alert(isAr ? 'تم تطبيق المواعيد على الأيام المختارة!' : 'Schedule applied to selected days!');
  };

  const handleRemoveDaySchedule = (day: string) => {
    const updatedSchedule = { ...doctorForm.schedule };
    delete updatedSchedule[day];
    setDoctorForm((p: any) => ({ ...p, schedule: updatedSchedule }));
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDoctor(true);
    try {
      if (editingDoctor) {
        await supabase.from('doctors').update(doctorForm).eq('id', editingDoctor.id);
      } else {
        await supabase.from('doctors').insert([doctorForm]);
      }
      loadData();
      setDoctorModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الطبيب؟' : 'Are you sure you want to delete this doctor?')) return;
    try {
      await supabase.from('doctors').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Offer Handlers
  const openOfferModal = (offer?: Offer) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm({
        title: offer.title,
        title_ar: offer.title_ar || '',
        description: offer.description,
        discount_percentage: offer.discount_percentage,
        original_price: offer.original_price,
        discounted_price: offer.discounted_price,
        expiry_date: offer.expiry_date || '',
        is_active: offer.is_active
      });
    } else {
      setEditingOffer(null);
      setOfferForm({
        title: '', title_ar: '', description: '', discount_percentage: 10,
        original_price: 100, discounted_price: 90, expiry_date: '', is_active: true
      });
    }
    setOfferModalOpen(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingOffer(true);
    try {
      if (editingOffer) {
        await supabase.from('offers').update(offerForm).eq('id', editingOffer.id);
      } else {
        await supabase.from('offers').insert([offerForm]);
      }
      loadData();
      setOfferModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingOffer(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا العرض؟' : 'Delete this offer?')) return;
    try {
      await supabase.from('offers').delete().eq('id', id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Branch Handlers
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name || !branchForm.name_ar) return;

    setAddingBranch(true);
    const newBranch: Branch = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      name: branchForm.name,
      name_ar: branchForm.name_ar,
      address: branchForm.address,
      address_ar: branchForm.address_ar,
      phone: branchForm.phone,
      is_active: branchForm.is_active
    };

    const updated = [...branches, newBranch];
    setBranches(updated);
    localStorage.setItem('emc_branches', JSON.stringify(updated));
    setBranchForm({ name: '', name_ar: '', address: '', address_ar: '', phone: '', is_active: true });
    setAddingBranch(false);
  };

  const handleDeleteBranch = (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا الفرع؟ جميع الموظفين المعينين هنا سيفقدون فرعهم.' : 'Delete this branch? Associated staff assignments will reset.')) return;
    const updated = branches.filter(b => b.id !== id);
    setBranches(updated);
    localStorage.setItem('emc_branches', JSON.stringify(updated));
    
    // Reset staff assignments to that branch
    const updatedStaff = receptionists.map(r => r.branch_id === id ? { ...r, branch_id: '' } : r);
    setReceptionists(updatedStaff);
    localStorage.setItem('emc_receptionists', JSON.stringify(updatedStaff));
  };

  // Receptionist Staff Handlers
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.password) return;

    setAddingStaff(true);
    if (editingStaff) {
      // Editing Mode
      const updated = receptionists.map(r => r.id === editingStaff.id ? {
        ...r,
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        password: staffForm.password,
        branch_id: staffForm.branch_id,
        is_active: staffForm.is_active
      } : r);
      setReceptionists(updated);
      localStorage.setItem('emc_receptionists', JSON.stringify(updated));
      setEditingStaff(null);
      alert(isAr ? 'تم تعديل بيانات موظف الاستقبال بنجاح!' : 'Receptionist details updated successfully!');
    } else {
      // Adding Mode
      const newStaff: Receptionist = {
        id: 'r_' + Math.random().toString(36).substr(2, 9),
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        password: staffForm.password,
        branch_id: staffForm.branch_id,
        is_active: staffForm.is_active
      };

      const updated = [...receptionists, newStaff];
      setReceptionists(updated);
      localStorage.setItem('emc_receptionists', JSON.stringify(updated));
    }
    setStaffForm({ name: '', email: '', phone: '', password: '', branch_id: '', is_active: true });
    setAddingStaff(false);
  };

  const handleEditStaff = (r: Receptionist) => {
    setEditingStaff(r);
    setStaffForm({
      name: r.name,
      email: r.email,
      phone: r.phone || '',
      password: r.password || '',
      branch_id: r.branch_id || '',
      is_active: r.is_active
    });
  };

  const handleDeleteStaff = (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا الموظف؟' : 'Delete this staff member?')) return;
    const updated = receptionists.filter(r => r.id !== id);
    setReceptionists(updated);
    localStorage.setItem('emc_receptionists', JSON.stringify(updated));
    if (editingStaff && editingStaff.id === id) {
      setEditingStaff(null);
      setStaffForm({ name: '', email: '', phone: '', password: '', branch_id: '', is_active: true });
    }
  };

  const handleTransferStaff = (staffId: string, targetBranchId: string) => {
    const updated = receptionists.map(r => r.id === staffId ? { ...r, branch_id: targetBranchId } : r);
    setReceptionists(updated);
    localStorage.setItem('emc_receptionists', JSON.stringify(updated));
    alert(isAr ? 'تم نقل الموظف للفرع الجديد بنجاح!' : 'Staff member transferred successfully!');
  };

  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? (isAr ? branch.name_ar : branch.name) : (isAr ? 'غير محدد' : 'Not assigned');
  };

  const handleSaveOwnerPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPasswordForm) return;
    localStorage.setItem('emc_owner_password', ownerPasswordForm);
    alert(isAr ? 'تم تحديث كلمة مرور المالك بنجاح!' : 'Owner password updated successfully!');
  };

  const handleSaveSoundSettings = () => {
    localStorage.setItem('emc_notifications_sound_enabled', String(soundEnabled));
    localStorage.setItem('emc_notifications_volume', String(soundVolume));
    localStorage.setItem('emc_notification_sound', soundType);
    if (soundEnabled) {
      playNotificationSound(soundType, soundVolume);
    }
    alert(isAr ? 'تم حفظ إعدادات الصوت بنجاح!' : 'Sound settings saved successfully!');
  };

  const handleDownloadBackup = async () => {
    setBackupStatus(isAr ? 'جاري تصدير البيانات...' : 'Exporting data...');
    setBackupError('');
    try {
      const [appts, docs, offs, depts, servs, revs, gall, conts, sett] = await Promise.all([
        supabase.from('appointments').select('*'),
        supabase.from('doctors').select('*'),
        supabase.from('offers').select('*'),
        supabase.from('departments').select('*'),
        supabase.from('services').select('*'),
        supabase.from('reviews').select('*'),
        supabase.from('gallery').select('*'),
        supabase.from('contacts').select('*'),
        supabase.from('settings').select('*')
      ]);

      const backupObj = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        database: {
          appointments: appts.data || [],
          doctors: docs.data || [],
          offers: offs.data || [],
          departments: depts.data || [],
          services: servs.data || [],
          reviews: revs.data || [],
          gallery: gall.data || [],
          contacts: conts.data || [],
          settings: sett.data || []
        },
        local: {
          expenses: JSON.parse(localStorage.getItem('emc_owner_expenses') || '[]'),
          branches: JSON.parse(localStorage.getItem('emc_branches') || '[]'),
          receptionists: JSON.parse(localStorage.getItem('emc_receptionists') || '[]'),
          ownerPassword: localStorage.getItem('emc_owner_password') || 'EMC_Owner_2026!#'
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `emc_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      localStorage.setItem('emc_last_backup_date', Date.now().toString());
      setShowBackupWarning(false);
      setBackupStatus(isAr ? 'تم تحميل النسخة الاحتياطية بنجاح! يرجى حفظها في Google Drive.' : 'Backup downloaded successfully! Please save it in Google Drive.');
    } catch (err: any) {
      console.error(err);
      setBackupError(isAr ? 'فشل تصدير النسخة الاحتياطية.' : 'Failed to export backup.');
    } finally {
      setTimeout(() => setBackupStatus(''), 6000);
    }
  };

  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(isAr ? 'تحذير: استعادة النسخة الاحتياطية ستقوم بدمج/تحديث كافة البيانات الحالية. هل أنت متأكد؟' : 'Warning: Restoring will merge/overwrite existing data. Continue?')) {
      e.target.value = '';
      return;
    }

    setBackupStatus(isAr ? 'جاري قراءة ملف النسخة الاحتياطية...' : 'Reading backup file...');
    setBackupError('');

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.database || !backupData.local) {
        throw new Error(isAr ? 'ملف نسخة احتياطية غير صالح.' : 'Invalid backup file format.');
      }

      setBackupStatus(isAr ? 'جاري استعادة جداول قاعدة البيانات...' : 'Restoring database tables...');
      
      // Upsert database tables
      const tables = ['departments', 'doctors', 'appointments', 'services', 'offers', 'reviews', 'gallery', 'contacts', 'settings'];
      for (const table of tables) {
        const data = backupData.database[table];
        if (data && data.length > 0) {
          const { error } = await supabase.from(table).upsert(data);
          if (error) throw error;
        }
      }

      setBackupStatus(isAr ? 'جاري استعادة الإعدادات المحلية للمتصفح...' : 'Restoring local settings...');

      // Save Local Storage
      if (backupData.local.expenses) {
        localStorage.setItem('emc_owner_expenses', JSON.stringify(backupData.local.expenses));
        setExpenses(backupData.local.expenses);
      }
      if (backupData.local.branches) {
        localStorage.setItem('emc_branches', JSON.stringify(backupData.local.branches));
        setBranches(backupData.local.branches);
      }
      if (backupData.local.receptionists) {
        localStorage.setItem('emc_receptionists', JSON.stringify(backupData.local.receptionists));
        setReceptionists(backupData.local.receptionists);
      }
      if (backupData.local.ownerPassword) {
        localStorage.setItem('emc_owner_password', backupData.local.ownerPassword);
        setOwnerPasswordForm(backupData.local.ownerPassword);
      }

      localStorage.setItem('emc_last_backup_date', Date.now().toString());
      setShowBackupWarning(false);
      
      setBackupStatus(isAr ? 'تمت استعادة كافة البيانات بنجاح وتحديث اللوحة!' : 'All data restored successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setBackupError(err.message || (isAr ? 'فشل استيراد النسخة الاحتياطية. تأكد من صحة الملف.' : 'Failed to restore backup.'));
    } finally {
      e.target.value = '';
    }
  };

  const categoriesMap: Record<string, string> = {
    salaries: isAr ? 'مرتبات' : 'Salaries',
    rent: isAr ? 'إيجار' : 'Rent',
    equipment: isAr ? 'صيانة وأجهزة' : 'Equipment',
    utilities: isAr ? 'فواتير ومرافق' : 'Utilities',
    other: isAr ? 'أخرى' : 'Other',
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-gray-500 text-sm font-bold">{isAr ? 'جاري تحميل لوحة التحكم...' : 'Loading Executive Dashboard...'}</p>
      </div>
    );
  }

  // Calculate SVG donut segments
  const calculateDonutSegments = () => {
    const grouped: Record<string, number> = { salaries: 0, rent: 0, utilities: 0, equipment: 0, other: 0 };
    expenses.forEach(e => {
      if (grouped[e.category] !== undefined) grouped[e.category] += Number(e.amount);
      else grouped.other += Number(e.amount);
    });

    const total = Object.values(grouped).reduce((a, b) => a + b, 0) || 1;
    let accumulatedPercent = 0;
    const colors: Record<string, string> = {
      salaries: '#0070CD',
      rent: '#F59E0B',
      utilities: '#10B981',
      equipment: '#EF4444',
      other: '#6B7280'
    };

    return Object.entries(grouped).map(([cat, val]) => {
      const percentage = (val / total) * 100;
      const startPercent = accumulatedPercent;
      accumulatedPercent += percentage;
      return {
        category: cat,
        value: val,
        percentage,
        color: colors[cat],
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset: `${100 - startPercent + 25}`
      };
    });
  };

  const donutSegments = calculateDonutSegments();

  return (
    <div className="space-y-8 relative" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Decorative Glow Circles */}
      <div className="absolute top-10 start-10 w-72 h-72 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-40 end-10 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      {/* Title & Lang bar */}
      <div className="relative overflow-hidden bg-white/80 border border-slate-100 p-6 sm:p-8 rounded-[32px] shadow-sm backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
        <div className="absolute top-0 start-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full pointer-events-none" />
        <div className="text-start relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black tracking-wide uppercase mb-3">
            <Building className="w-3.5 h-3.5" />
            {isAr ? 'لوحة المالك الرسمية' : 'OFFICIAL OWNER CONTROL'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A1A2E] leading-tight">
            {isAr ? 'مركز قيادة وإدارة عيادة EMC' : 'EMC Clinic Executive Command Center'}
          </h2>
          <p className="text-xs text-gray-500 mt-2 font-medium max-w-2xl leading-relaxed">
            {isAr 
              ? 'تابع المؤشرات المالية الكلية للعيادة، راقب النفقات والإيرادات، وتحكم في بيانات الأطباء والفروع والموظفين في مكان واحد وبأعلى دقة.' 
              : 'Monitor real-time cashflow, track active bookings, manage receptionist logs, and configure doctors profiles.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-black transition-all text-slate-700 shadow-sm cursor-pointer hover:border-slate-300"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-slate-100/50 p-2 rounded-2xl border border-slate-200/60 shadow-inner flex flex-wrap gap-1">
        {[
          { id: 'overview', label: isAr ? 'التقرير المالي' : 'Financials', icon: PieChart },
          { id: 'doctors', label: isAr ? 'إدارة الأطباء' : 'Doctors', icon: Stethoscope },
          { id: 'offers', label: isAr ? 'إدارة العروض' : 'Offers', icon: Tag },
          { id: 'branches', label: isAr ? 'الفروع' : 'Branches', icon: MapPin },
          { id: 'receptionists', label: isAr ? 'الاستقبال والموظفين' : 'Receptionists', icon: Users },
          { id: 'settings_backup', label: isAr ? 'الإعدادات والنسخ' : 'Backup & Config', icon: Key },
        ].map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${
                active 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]' 
                  : 'text-gray-655 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-gray-400'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      
      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Executive Analytics Metrics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
            
            {/* Inflow Revenue */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-start hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-16 h-16 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <span className="text-gray-500 text-xs font-black uppercase tracking-wider block mb-1">
                {isAr ? 'إجمالي الإيرادات' : 'Inflow Revenue'}
              </span>
              <div className="text-3xl font-black text-[#1A1A2E] tracking-tight">{totalRevenue} EGP</div>
              <div className="text-xs text-emerald-600 font-bold mt-2.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> {activeBookings.length} {isAr ? 'حجز نشط' : 'bookings'}
              </div>
            </div>

            {/* Outflow Expenses */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-start hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-16 h-16 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <span className="text-gray-500 text-xs font-black uppercase tracking-wider block mb-1">
                {isAr ? 'إجمالي المصاريف' : 'Outflow Expenses'}
              </span>
              <div className="text-3xl font-black text-[#1A1A2E] tracking-tight">{totalExpenses} EGP</div>
              <div className="text-xs text-red-500 font-bold mt-2.5 flex items-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> {expenses.length} {isAr ? 'معاملة صرف' : 'expenses'}
              </div>
            </div>

            {/* Net Profit */}
            <div className="bg-gradient-to-br from-blue-50 to-[#E6F0FA] border border-blue-100/50 rounded-3xl p-5 shadow-sm text-start xl:col-span-2 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <span className="text-primary text-xs font-black uppercase tracking-wider block mb-1">
                {isAr ? 'صافي الأرباح الكلية' : 'Net Profit Margin'}
              </span>
              <div className={`text-4xl font-black tracking-tight ${netProfit >= 0 ? 'text-primary' : 'text-red-600'}`}>{netProfit} EGP</div>
              <span className="text-xs text-blue-700/80 font-medium block mt-2.5">
                {isAr ? 'إيرادات الكشوفات والخدمات مطروحاً منها المصاريف' : 'Total clinic revenue minus administrative outflows'}
              </span>
            </div>

            {/* Active Doctors */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-start hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <span className="text-gray-500 text-xs font-black uppercase tracking-wider block mb-1">
                {isAr ? 'طاقم الأطباء' : 'Clinic Doctors'}
              </span>
              <div className="text-3xl font-black text-[#1A1A2E] tracking-tight">{dbDoctors.length}</div>
              <span className="text-xs text-gray-500 font-medium block mt-2.5">
                {isAr ? 'أطباء نشطين بالعيادة' : 'Active medical consultants'}
              </span>
            </div>

            {/* Receptionists */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-start hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 end-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              <span className="text-gray-500 text-xs font-black uppercase tracking-wider block mb-1">
                {isAr ? 'موظفي الاستقبال' : 'Receptionists'}
              </span>
              <div className="text-3xl font-black text-[#1A1A2E] tracking-tight">{receptionists.length}</div>
              <span className="text-xs text-gray-500 font-medium block mt-2.5">
                {isAr ? 'مسؤولين عن الفروع' : 'Assigned workspace staff'}
              </span>
            </div>
          </div>

          {/* Interactive SVG Analytical Charts (Figma Style) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start">
              <h3 className="text-sm font-bold text-gray-800 mb-4">{isAr ? 'منحنى نمو الإيرادات' : 'Revenue Growth Analytics'}</h3>
              <div className="w-full h-64 flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 500 200">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0070CD" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#0070CD" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="50" y1="20" x2="480" y2="20" stroke="#F3F4F6" strokeWidth="1" />
                  <line x1="50" y1="70" x2="480" y2="70" stroke="#F3F4F6" strokeWidth="1" />
                  <line x1="50" y1="120" x2="480" y2="120" stroke="#F3F4F6" strokeWidth="1" />
                  <line x1="50" y1="170" x2="480" y2="170" stroke="#F3F4F6" strokeWidth="1" />
                  
                  {/* Chart Path Area */}
                  <path d="M 50 170 Q 150 90, 250 120 T 450 40 L 450 170 L 50 170 Z" fill="url(#chartGrad)" />
                  {/* Chart Line */}
                  <path d="M 50 170 Q 150 90, 250 120 T 450 40" fill="none" stroke="#0070CD" strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* Interactive dots */}
                  <circle cx="150" cy="115" r="5" fill="#FFFFFF" stroke="#0070CD" strokeWidth="2.5" className="cursor-pointer" />
                  <circle cx="280" cy="112" r="5" fill="#FFFFFF" stroke="#0070CD" strokeWidth="2.5" className="cursor-pointer" />
                  <circle cx="450" cy="40" r="5" fill="#FFFFFF" stroke="#0070CD" strokeWidth="2.5" className="cursor-pointer" />

                  {/* Labels */}
                  <text x="45" y="175" className="text-[10px] fill-gray-400 font-bold" textAnchor="end">0</text>
                  <text x="45" y="125" className="text-[10px] fill-gray-400 font-bold" textAnchor="end">10K</text>
                  <text x="45" y="75" className="text-[10px] fill-gray-400 font-bold" textAnchor="end">25K</text>
                  <text x="45" y="25" className="text-[10px] fill-gray-400 font-bold" textAnchor="end">50K</text>

                  <text x="150" y="192" className="text-[10px] fill-gray-400 font-semibold" textAnchor="middle">{isAr ? 'أسبوع 1' : 'Week 1'}</text>
                  <text x="280" y="192" className="text-[10px] fill-gray-400 font-semibold" textAnchor="middle">{isAr ? 'أسبوع 2' : 'Week 2'}</text>
                  <text x="450" y="192" className="text-[10px] fill-gray-400 font-semibold" textAnchor="middle">{isAr ? 'أسبوع 3' : 'Week 3'}</text>
                </svg>
              </div>
            </div>

            {/* Expenses Donut Chart */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800 mb-4">{isAr ? 'توزيع المصاريف الإدارية' : 'Expense Category Distribution'}</h3>
                <div className="space-y-2.5">
                  {donutSegments.map(seg => (
                    <div key={seg.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-gray-600 font-medium">{categoriesMap[seg.category]}</span>
                      </div>
                      <span className="font-bold text-gray-900">{seg.value} EGP ({Math.round(seg.percentage)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-36 h-36 shrink-0 relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Empty base circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3F4F6" strokeWidth="3" />
                  
                  {/* Dynamic segments */}
                  {donutSegments.map((seg, i) => (
                    <circle
                      key={i}
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="3.5"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-500 ease-out"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-gray-400 block font-bold">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-xs font-black text-gray-800">{totalExpenses} EGP</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Expense Recorder */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start">
              <h3 className="text-base font-bold mb-4 text-[#1A1A2E] flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {isAr ? 'تسجيل مصروف إداري جديد' : 'New Expense Entry'}
              </h3>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'بيان النفقة / المصروف' : 'Description'}</label>
                  <input
                    type="text" required
                    placeholder={isAr ? 'مثال: فاتورة الكهرباء لشهر يونيو' : 'e.g., Internet bill'}
                    value={expenseForm.title}
                    onChange={e => setExpenseForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block font-bold">{isAr ? 'المبلغ بالجنيه' : 'Amount (EGP)'}</label>
                    <input
                      type="number" required
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-655 mb-1 block font-bold">{isAr ? 'التصنيف' : 'Category'}</label>
                    <select
                      value={expenseForm.category}
                      onChange={e => setExpenseForm(p => ({ ...p, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                    >
                      <option value="salaries">{isAr ? 'مرتبات' : 'Salaries'}</option>
                      <option value="rent">{isAr ? 'إيجار' : 'Rent'}</option>
                      <option value="equipment">{isAr ? 'صيانة وأجهزة' : 'Equipment'}</option>
                      <option value="utilities">{isAr ? 'فواتير ومرافق' : 'Utilities'}</option>
                      <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit" disabled={addingExpense}
                  className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
                >
                  {addingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{isAr ? 'تسجيل الآن' : 'Save Expense'}</span>
                </button>
              </form>
            </div>

            {/* Inflows & Outflows Ledger */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start">
              <h3 className="text-base font-bold mb-4 text-[#1A1A2E] flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                {isAr ? 'دفتر المعاملات والتدفقات المالية' : 'Transaction Log'}
              </h3>
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                <table className="w-full text-xs sm:text-sm text-start">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-500">
                      <th className="py-2.5 px-3 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                      <th className="py-2.5 px-3 text-start">{isAr ? 'المعاملة / البيان' : 'Item'}</th>
                      <th className="py-2.5 px-3 text-start">{isAr ? 'النوع' : 'Type'}</th>
                      <th className="py-2.5 px-3 text-end">{isAr ? 'القيمة' : 'Value'}</th>
                      <th className="py-2.5 px-3 text-center">{isAr ? 'إجراء' : 'Delete'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Inflows */}
                    {activeBookings.map((appt) => (
                      <tr key={appt.id} className="hover:bg-gray-50/40 text-gray-700">
                        <td className="py-3 px-3 text-[11px] text-gray-400">{appt.appointment_date}</td>
                        <td className="py-3 px-3 font-semibold">
                          <span>{isAr ? `كشف: ${appt.patient_name}` : `Patient: ${appt.patient_name}`}</span>
                          <span className="block text-[10px] text-emerald-600">{getDoctorName(appt.doctor_id)}</span>
                        </td>
                        <td className="py-3 px-3 text-emerald-600 font-bold text-xs">
                          {isAr ? 'دخول / كشف' : 'Inflow / Consultation'}
                        </td>
                        <td className="py-3 px-3 text-end text-emerald-600 font-bold">+{getDoctorFee(appt.doctor_id)} EGP</td>
                        <td className="py-3 px-3 text-center text-gray-400">—</td>
                      </tr>
                    ))}

                    {/* Outflows */}
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/40 text-gray-700">
                        <td className="py-3 px-3 text-[11px] text-gray-400">{exp.expense_date}</td>
                        <td className="py-3 px-3 font-semibold">{exp.title}</td>
                        <td className="py-3 px-3 text-red-500 font-semibold text-xs">
                          {categoriesMap[exp.category] || exp.category}
                        </td>
                        <td className="py-3 px-3 text-end text-red-500 font-bold">-{exp.amount} EGP</td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Doctors Tab */}
      {activeTab === 'doctors' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">{isAr ? 'الأطباء المسجلين بالعيادة' : 'Manage Staff Doctors'}</h3>
              <p className="text-xs text-gray-500">{isAr ? 'تعديل بيانات الكشوفات، الخبرات، والأسعار الخاصة بكل طبيب.' : 'Update consultation fees, specialities and details.'}</p>
            </div>
            <button
              onClick={() => openDoctorModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة طبيب جديد' : 'Add New Doctor'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base text-start">
              <thead>
                <tr className="border-b border-slate-200 text-gray-650 font-bold bg-slate-50/50">
                  <th className="py-3 px-4">{isAr ? 'الاسم' : 'Name'}</th>
                  <th className="py-3 px-4">{isAr ? 'التخصص' : 'Specialty'}</th>
                  <th className="py-3 px-4">{isAr ? 'سعر الكشف' : 'Consultation Fee'}</th>
                  <th className="py-3 px-4">{isAr ? 'الخبرة' : 'Experience'}</th>
                  <th className="py-3 px-4">{isAr ? 'التقييم' : 'Rating'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'خيارات' : 'Options'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dbDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-3">
                      {doc.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={doc.image_url} alt={doc.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {doc.name.charAt(0)}
                        </div>
                      )}
                      <span>{isAr ? doc.name_ar || doc.name : doc.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{doc.specialty}</td>
                    <td className="py-3 px-4 text-primary font-bold">{doc.consultation_fee} EGP</td>
                    <td className="py-3 px-4 text-gray-500">{doc.experience_years} {isAr ? 'سنة خبرة' : 'years'}</td>
                    <td className="py-3 px-4 font-bold text-amber-500">★ {doc.rating}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${doc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {doc.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مغلق' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDoctorModal(doc)}
                          className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoctor(doc.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Offers Tab */}
      {activeTab === 'offers' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A2E]">{isAr ? 'العروض الترويجية والخصومات' : 'Clinic Special Offers'}</h3>
              <p className="text-xs text-gray-500">{isAr ? 'إدارة كوبونات وعروض الكشوفات وباقات التحاليل والأسنان بالعيادة.' : 'Create, edit, and deactivate promotions.'}</p>
            </div>
            <button
              onClick={() => openOfferModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة عرض جديد' : 'Create New Offer'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbOffers.map((off) => (
              <div key={off.id} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-5 hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {off.discount_percentage}% {isAr ? 'خصم' : 'OFF'}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => openOfferModal(off)} className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteOffer(off.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <h4 className="font-extrabold text-base text-[#1A1A2E] mb-1">{isAr ? off.title_ar || off.title : off.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{off.description}</p>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-lg font-black text-primary">{off.discounted_price} EGP</span>
                    <span className="text-xs text-gray-400 line-through">{off.original_price} EGP</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 pt-2 border-t border-gray-100/50">
                    <span>{off.expiry_date ? `${isAr ? 'تنتهي في:' : 'Expires:'} ${off.expiry_date}` : ''}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${off.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {off.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مغلق' : 'Inactive')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Branches Tab */}
      {activeTab === 'branches' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Branch Form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start h-fit">
            <h3 className="text-base font-bold mb-4 text-[#1A1A2E] flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              {isAr ? 'إضافة فرع جديد للعيادة' : 'Register New Branch'}
            </h3>
            <form onSubmit={handleAddBranch} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Branch Name (English) *</label>
                <input
                  type="text" required placeholder="e.g., Heliopolis Branch"
                  value={branchForm.name} onChange={e => setBranchForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white text-start"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">اسم الفرع (بالعربية) *</label>
                <input
                  type="text" required placeholder="مثال: فرع مصر الجديدة"
                  value={branchForm.name_ar} onChange={e => setBranchForm(p => ({ ...p, name_ar: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white text-right" dir="rtl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Address (English)</label>
                <input
                  type="text" placeholder="Merghany Street"
                  value={branchForm.address} onChange={e => setBranchForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white text-start"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">العنوان بالتفصيل (بالعربية)</label>
                <input
                  type="text" placeholder="شارع المرغني، بجوار محطة المترو"
                  value={branchForm.address_ar} onChange={e => setBranchForm(p => ({ ...p, address_ar: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white text-right" dir="rtl"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'رقم الهاتف للفرع' : 'Branch Phone Number'}</label>
                <input
                  type="text" placeholder="+20..."
                  value={branchForm.phone} onChange={e => setBranchForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white text-start"
                />
              </div>
              <button
                type="submit" disabled={addingBranch}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                {addingBranch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isAr ? 'تسجيل الفرع' : 'Register Branch'}</span>
              </button>
            </form>
          </div>

          {/* Branches List */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start space-y-6">
            <h3 className="text-base font-bold text-[#1A1A2E]">{isAr ? 'فروع العيادة النشطة' : 'Clinic Branches'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map(b => {
                const staffCount = receptionists.filter(r => r.branch_id === b.id).length;
                return (
                  <div key={b.id} className="border border-gray-100 bg-gray-50/50 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-extrabold text-base text-gray-800">{isAr ? b.name_ar : b.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          {b.is_active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'مغلق' : 'Inactive')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{isAr ? b.address_ar || b.address : b.address}</span>
                      </p>
                      <p className="text-xs text-gray-400 mb-4">{isAr ? 'رقم الفرع:' : 'Phone:'} {b.phone}</p>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-[11px] text-gray-600 font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                        {staffCount} {isAr ? 'موظفين بالاستقبال' : 'staff members'}
                      </span>
                      <button
                        onClick={() => handleDeleteBranch(b.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Receptionists Tab */}
      {activeTab === 'receptionists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Staff Form */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start h-fit">
            <h3 className="text-base font-bold mb-4 text-[#1A1A2E] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              {editingStaff ? (isAr ? 'تعديل بيانات موظف الاستقبال' : 'Edit Receptionist Account') : (isAr ? 'تسجيل موظف استقبال جديد' : 'Add Receptionist Account')}
            </h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'اسم الموظف بالكامل' : 'Staff Name'}</label>
                <input
                  type="text" required placeholder={isAr ? 'مثال: سهى أحمد' : 'e.g., Jane Doe'}
                  value={staffForm.name} onChange={e => setStaffForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                <input
                  type="email" required placeholder="name@emc.com"
                  value={staffForm.email} onChange={e => setStaffForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  dir="ltr"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'رقم الموبايل' : 'Phone Number'}</label>
                  <input
                    type="text" placeholder="01........."
                    value={staffForm.phone} onChange={e => setStaffForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'كلمة المرور للدخول' : 'Security Password'}</label>
                  <input
                    type="password" required placeholder="••••••••"
                    value={staffForm.password} onChange={e => setStaffForm(p => ({ ...p, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">{isAr ? 'فرع التعيين والعمل' : 'Branch Assignment'}</label>
                <select
                  value={staffForm.branch_id}
                  onChange={e => setStaffForm(p => ({ ...p, branch_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-sm outline-none focus:border-primary focus:bg-white transition-all text-start"
                >
                  <option value="">{isAr ? 'اختر الفرع للتعيين...' : 'Select branch assignment...'}</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{isAr ? b.name_ar : b.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit" disabled={addingStaff}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
              >
                {addingStaff ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{editingStaff ? (isAr ? 'حفظ البيانات المحدثة' : 'Save changes') : (isAr ? 'تسجيل الموظف وتعيينه' : 'Save & Assign')}</span>
              </button>
              {editingStaff && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingStaff(null);
                    setStaffForm({ name: '', email: '', phone: '', password: '', branch_id: '', is_active: true });
                  }}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  {isAr ? 'إلغاء التعديل' : 'Cancel Edit'}
                </button>
              )}
            </form>
          </div>

          {/* Staff Table */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-start space-y-6">
            <h3 className="text-base font-bold text-[#1A1A2E]">{isAr ? 'موظفي استقبال الفروع الحاليين' : 'Receptionist List'}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base text-start">
                <thead>
                  <tr className="border-b border-slate-200 text-gray-655 font-bold bg-slate-50/50">
                    <th className="py-3 px-3">{isAr ? 'الموظف' : 'Name'}</th>
                    <th className="py-3 px-3">{isAr ? 'معلومات الاتصال' : 'Contacts'}</th>
                    <th className="py-3 px-3">{isAr ? 'الفرع المعين به' : 'Assigned Branch'}</th>
                    <th className="py-3 px-3 text-center">{isAr ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {receptionists.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-semibold text-gray-800">{r.name}</td>
                      <td className="py-3 px-3 text-gray-600">
                        <span className="block">{r.email}</span>
                        <span className="block text-[10px] text-gray-400">{r.phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={r.branch_id}
                          onChange={(e) => handleTransferStaff(r.id, e.target.value)}
                          className="px-3 py-1.5 bg-primary/10 text-primary border-0 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 cursor-pointer outline-none text-start"
                        >
                          <option value="" className="text-gray-500">{isAr ? 'غير معين بفرع' : 'Not assigned'}</option>
                          {branches.map(b => (
                            <option key={b.id} value={b.id} className="text-gray-800">{isAr ? b.name_ar : b.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditStaff(r)}
                          className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-all"
                          title={isAr ? 'تعديل البيانات' : 'Edit details'}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(r.id)}
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                          title={isAr ? 'حذف الموظف' : 'Delete staff'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Settings & Backup Tab */}
      {activeTab === 'settings_backup' && (
        <div className="space-y-8 text-right" dir="rtl">
          
          {/* Backup Reminder Banner */}
          {showBackupWarning && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-850 shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-amber-900">{isAr ? 'تنبيه أمني: لم تقم بعمل نسخة احتياطية للبيانات مؤخراً!' : 'Security Alert: No recent data backup!'}</h4>
                  <p className="text-xs text-amber-700 mt-1">{isAr ? 'لحماية بيانات العيادة وحجوزاتها من الفقدان غير المتوقع، نوصي بتحميل نسخة احتياطية دورية وحفظها في Google Drive.' : 'To prevent unexpected data loss, we recommend taking a periodic backup and uploading it to Google Drive.'}</p>
                </div>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تحميل النسخة الاحتياطية الآن' : 'Download Backup Now'}</span>
              </button>
            </div>
          )}

          {/* Messages */}
          {backupStatus && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{backupStatus}</span>
            </div>
          )}
          {backupError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start">
            
            {/* Backup & Restore Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-800">{isAr ? 'النسخ الاحتياطي واستعادة البيانات' : 'Data Backup & Restore'}</h3>
                  <p className="text-xs text-gray-400">{isAr ? 'حفظ وتأمين بيانات العيادة محلياً وعلى درايف' : 'Secure and retrieve clinic data'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Card */}
                <div className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">{isAr ? 'تصدير نسخة احتياطية' : 'Export Backup'}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isAr 
                      ? 'قم بتحميل ملف يحتوي على كافة بيانات العيادة (الحجوزات، الأطباء، العروض، موظفي الاستقبال، والمصاريف المالية) وحفظه بشكل آمن على جهازك أو رفعه لحسابك في Google Drive.' 
                      : 'Download a JSON file containing all clinic records, appointments, staff accounts, and expenses to store locally or upload to Google Drive.'}
                  </p>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تنزيل ملف النسخة الاحتياطية' : 'Download Backup File'}</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="border border-gray-100 bg-gray-50/50 p-6 rounded-2xl space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">{isAr ? 'استعادة نسخة احتياطية' : 'Restore Backup'}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {isAr 
                      ? 'رفع ملف نسخة احتياطية تم تنزيله سابقاً لاستعادة كافة البيانات المدخلة. تحذير: سيقوم هذا الخيار بتحديث الجداول لتطابق البيانات المستوردة.' 
                      : 'Upload a previously saved JSON backup to restore database records and settings. Warning: this updates current data.'}
                  </p>
                  <label className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-center">
                    <Upload className="w-4 h-4" />
                    <span>{isAr ? 'رفع واستعادة البيانات' : 'Upload & Restore File'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Guide card */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 text-right" dir="rtl">
                <h4 className="font-bold text-xs text-primary mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{isAr ? 'كيفية تأمين النسخة الاحتياطية في Google Drive؟' : 'How to secure your backup on Google Drive?'}</span>
                </h4>
                <ol className="text-[11px] text-gray-650 leading-relaxed list-decimal pr-4 space-y-1 mt-2 text-right">
                  <li>{isAr ? 'اضغط على زر "تنزيل ملف النسخة الاحتياطية" بالكل أسبوع أو شهر.' : 'Click "Download Backup File" every week or month.'}</li>
                  <li>{isAr ? 'قم بفتح حسابك في Google Drive.' : 'Open your Google Drive account.'}</li>
                  <li>{isAr ? 'قم بسحب وإفلات الملف المحمل داخل مجلد خاص تسميه (EMC Clinic Backups).' : 'Drag & drop the downloaded file inside a folder named "EMC Clinic Backups".'}</li>
                  <li>{isAr ? 'بذلك تضمن الحفاظ على بيانات العيادة آمنة تماماً حتى في حال تلف الجهاز أو المتصفح.' : 'This guarantees your clinic data remains completely safe even if local storage is cleared.'}</li>
                </ol>
              </div>
            </div>

            {/* Owner Details & Notification Settings */}
            <div className="space-y-6">
              
              {/* Owner Password Card */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{isAr ? 'تغيير كلمة مرور المالك' : 'Owner Password'}</h4>
                    <p className="text-[10px] text-gray-400">{isAr ? 'تعديل كلمة المرور للدخول للوحة المالك' : 'Update owner dashboard password'}</p>
                  </div>
                </div>

                <form onSubmit={handleSaveOwnerPassword} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 mb-1 block">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={ownerPasswordForm}
                        onChange={e => setOwnerPasswordForm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white outline-none rounded-xl text-xs transition-all text-start"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-primary/10"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isAr ? 'تحديث كلمة المرور' : 'Update Password'}</span>
                  </button>
                </form>
              </div>

              {/* Sound Notifications Settings */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{isAr ? 'إعدادات تنبيهات الصوت' : 'Notification Sound'}</h4>
                    <p className="text-[10px] text-gray-400">{isAr ? 'تخصيص نغمات الإشعارات الفورية' : 'Customize real-time notification chime'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">{isAr ? 'تفعيل الصوت' : 'Sound Enabled'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={soundEnabled}
                        onChange={e => setSoundEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>

                  {/* Sound Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 block">{isAr ? 'نغمة الرنين' : 'Ringtone'}</label>
                    <select
                      disabled={!soundEnabled}
                      value={soundType}
                      onChange={e => setSoundType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none disabled:opacity-50 text-start"
                    >
                      <option value="double_beep">{isAr ? 'ثنائية سريعة (Double Beep)' : 'Double Beep'}</option>
                      <option value="soft_chime">{isAr ? 'رنين هادئ (Soft Chime)' : 'Soft Chime'}</option>
                      <option value="alert_bell">{isAr ? 'جرس قوي (Alert Bell)' : 'Alert Bell'}</option>
                      <option value="digital_ring">{isAr ? 'رنين رقمي (Digital Ring)' : 'Digital Ring'}</option>
                    </select>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                      <span>{isAr ? 'مستوى الصوت' : 'Volume'}</span>
                      <span>{Math.round(soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="1" step="0.1"
                      disabled={!soundEnabled}
                      value={soundVolume}
                      onChange={e => setSoundVolume(Number(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary disabled:opacity-50"
                    />
                  </div>

                  {/* Test & Save buttons */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={!soundEnabled}
                      onClick={() => playNotificationSound(soundType, soundVolume)}
                      className="py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إختبار النغمة' : 'Test'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSoundSettings}
                      className="py-2 bg-secondary hover:bg-secondary-dark text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-secondary/15 flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isAr ? 'حفظ الصوت' : 'Save'}</span>
                    </button>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Doctor Modal Dialog */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-lg w-full p-8 text-start shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              {editingDoctor ? (isAr ? 'تعديل بيانات الطبيب' : 'Edit Doctor Profiles') : (isAr ? 'إضافة طبيب جديد لقاعدة البيانات' : 'Register New Doctor')}
            </h3>
            
            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Full Name (English) *</label>
                  <input type="text" required value={doctorForm.name} onChange={e => setDoctorForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">الاسم بالكامل (بالعربية)</label>
                  <input type="text" value={doctorForm.name_ar} onChange={e => setDoctorForm(p => ({ ...p, name_ar: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white text-right" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Specialty / التخصص *</label>
                <input type="text" required value={doctorForm.specialty} onChange={e => setDoctorForm(p => ({ ...p, specialty: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Fee (EGP) *</label>
                  <input type="number" required value={doctorForm.consultation_fee} onChange={e => setDoctorForm(p => ({ ...p, consultation_fee: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Experience *</label>
                  <input type="number" required value={doctorForm.experience_years} onChange={e => setDoctorForm(p => ({ ...p, experience_years: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Rating (0-5)</label>
                  <input type="number" step="0.1" value={doctorForm.rating} onChange={e => setDoctorForm(p => ({ ...p, rating: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
              </div>

              {/* Photo Upload selector */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">{isAr ? 'صورة الطبيب الشخصية' : 'Doctor Photo Profile'}</label>
                <div className="flex items-center gap-4 mt-1 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                  {doctorForm.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={doctorForm.image_url} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      IMG
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <input type="file" accept="image/*" onChange={handlePhotoChange}
                      className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white cursor-pointer" />
                    <span className="text-[10px] text-gray-400">{isAr ? 'صيغ الصور المدعومة: JPEG, PNG' : 'Supported sizes: JPEG, PNG'}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Education & Degrees</label>
                <input type="text" value={doctorForm.education} onChange={e => setDoctorForm(p => ({ ...p, education: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Doctor Bio</label>
                <textarea rows={3} value={doctorForm.description} onChange={e => setDoctorForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white resize-none" />
              </div>

              {/* Schedule Builder */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                <h4 className="font-bold text-xs text-gray-700 border-b border-gray-250 pb-2">
                  {isAr ? 'منشئ جدول المواعيد للطبيب' : 'Doctor Schedule Builder'}
                </h4>
                
                {/* Checkbox Days */}
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 block font-bold">
                    {isAr ? 'الأيام المحددة لتطبيق المواعيد' : 'Select Days to Apply'}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {[
                      { key: 'Saturday', label: isAr ? 'السبت' : 'Sat' },
                      { key: 'Sunday', label: isAr ? 'الأحد' : 'Sun' },
                      { key: 'Monday', label: isAr ? 'الاثنين' : 'Mon' },
                      { key: 'Tuesday', label: isAr ? 'الثلاثاء' : 'Tue' },
                      { key: 'Wednesday', label: isAr ? 'الأربعاء' : 'Wed' },
                      { key: 'Thursday', label: isAr ? 'الخميس' : 'Thu' },
                      { key: 'Friday', label: isAr ? 'الجمعة' : 'Fri' }
                    ].map(day => {
                      const active = schedDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => {
                            setSchedDays(prev => 
                              active ? prev.filter(d => d !== day.key) : [...prev, day.key]
                            );
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            active 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Start, End, Interval */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-gray-500 block font-bold">{isAr ? 'ساعة البدء' : 'Start Time'}</label>
                    <input
                      type="time"
                      value={schedStartTime}
                      onChange={e => setSchedStartTime(e.target.value)}
                      className="w-full px-2 py-1.5 mt-1 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block font-bold">{isAr ? 'ساعة الانتهاء' : 'End Time'}</label>
                    <input
                      type="time"
                      value={schedEndTime}
                      onChange={e => setSchedEndTime(e.target.value)}
                      className="w-full px-2 py-1.5 mt-1 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block font-bold">{isAr ? 'الفترة (بالدقائق)' : 'Interval'}</label>
                    <select
                      value={schedInterval}
                      onChange={e => setSchedInterval(Number(e.target.value))}
                      className="w-full px-2 py-2 mt-1 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-primary text-center"
                    >
                      <option value="30">30 {isAr ? 'دقيقة' : 'min'}</option>
                      <option value="60">60 {isAr ? 'دقيقة' : 'min'}</option>
                      <option value="90">90 {isAr ? 'دقيقة' : 'min'}</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplySchedule}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  {isAr ? 'تطبيق الجدول المولد للأيام المختارة' : 'Generate & Apply Schedule'}
                </button>

                {/* Display Current Configured Schedule */}
                {doctorForm.schedule && Object.keys(doctorForm.schedule).length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <label className="text-[10px] text-gray-500 block font-bold">
                      {isAr ? 'الجدول المطبق حالياً:' : 'Active Applied Schedule:'}
                    </label>
                    <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                      {Object.entries(doctorForm.schedule).map(([day, slots]: [string, any]) => (
                        <div key={day} className="flex justify-between items-center text-xs bg-white p-2 rounded-lg border border-gray-150">
                          <div>
                            <span className="font-bold text-gray-800">{day}: </span>
                            <span className="text-gray-500 text-[10px]">{slots.slice(0, 3).join(', ')}{slots.length > 3 ? '...' : ''}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDaySchedule(day)}
                            className="text-red-500 hover:text-red-700 font-semibold text-[10px] underline cursor-pointer"
                          >
                            {isAr ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input type="checkbox" checked={doctorForm.is_active} onChange={e => setDoctorForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded" />
                <span className="text-xs text-gray-700 font-bold">{isAr ? 'تنشيط الطبيب وعرضه للجمهور' : 'Publish and set active'}</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setDoctorModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={savingDoctor} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  {savingDoctor && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ البيانات' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal Dialog */}
      {offerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white border border-gray-100 rounded-3xl max-w-lg w-full p-8 text-start shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-gray-900 mb-4">
              {editingOffer ? (isAr ? 'تعديل تفاصيل العرض' : 'Edit Special Offer') : (isAr ? 'إضافة عرض ترويجي جديد' : 'Create Special Offer')}
            </h3>

            <form onSubmit={handleSaveOffer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Offer Title (English) *</label>
                  <input type="text" required value={offerForm.title} onChange={e => setOfferForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">عنوان العرض (بالعربية)</label>
                  <input type="text" value={offerForm.title_ar} onChange={e => setOfferForm(p => ({ ...p, title_ar: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white text-right" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Description / الوصف *</label>
                <textarea rows={3} required value={offerForm.description} onChange={e => setOfferForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Discount %</label>
                  <input type="number" required value={offerForm.discount_percentage} onChange={e => setOfferForm(p => ({ ...p, discount_percentage: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Original Price *</label>
                  <input type="number" required value={offerForm.original_price} onChange={e => setOfferForm(p => ({ ...p, original_price: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Discounted Price *</label>
                  <input type="number" required value={offerForm.discounted_price} onChange={e => setOfferForm(p => ({ ...p, discounted_price: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Expiry Date / تاريخ الانتهاء</label>
                <input type="date" value={offerForm.expiry_date} onChange={e => setOfferForm(p => ({ ...p, expiry_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input type="checkbox" checked={offerForm.is_active} onChange={e => setOfferForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded" />
                <span className="text-xs text-gray-700 font-bold">{isAr ? 'تنشيط العرض مباشرة' : 'Active promotion'}</span>
              </label>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setOfferModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" disabled={savingOffer} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  {savingOffer && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isAr ? 'حفظ العرض' : 'Save Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
