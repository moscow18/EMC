'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Loader2, Star, Image as ImageIcon } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  name_ar?: string;
  specialty: string;
  image_url?: string;
  experience_years: number;
  description?: string;
  education?: string;
  rating: number;
  consultation_fee: number;
  is_active: boolean;
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', name_ar: '', specialty: '', image_url: '',
    experience_years: 0, rating: 4.5, consultation_fee: 0,
    description: '', education: '', is_active: true,
  });

  const fetchDoctors = async () => {
    setLoading(true);
    const { data } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    if (data) setDoctors(data);
    setLoading(false);
  };

  useEffect(() => { fetchDoctors(); }, []);

  const openModal = (doctor?: Doctor) => {
    if (doctor) {
      setEditing(doctor);
      setForm({
        name: doctor.name,
        name_ar: doctor.name_ar || '',
        specialty: doctor.specialty,
        image_url: doctor.image_url || '',
        experience_years: doctor.experience_years,
        rating: doctor.rating,
        consultation_fee: doctor.consultation_fee,
        description: doctor.description || '',
        education: doctor.education || '',
        is_active: doctor.is_active,
      });
    } else {
      setEditing(null);
      setForm({
        name: '', name_ar: '', specialty: '', image_url: '',
        experience_years: 0, rating: 4.5, consultation_fee: 0,
        description: '', education: '', is_active: true
      });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('doctors').update(form).eq('id', editing.id);
      } else {
        await supabase.from('doctors').insert(form);
      }
      setModalOpen(false);
      fetchDoctors();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      await supabase.from('doctors').delete().eq('id', id);
      fetchDoctors();
    }
  };

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">الأطباء</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your clinic doctors with full credentials and profile photos</p>
        </div>
        <button onClick={() => openModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary/25 w-full sm:w-auto shrink-0 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {/* Table view for desktop */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Doctor Info</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Fee</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : doctors.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No doctors found</td></tr>
              ) : (
                doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-dark flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {doc.image_url ? (
                          <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><ImageIcon className="w-4 h-4" /></div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{doc.name}</div>
                        <div className="text-xs text-gray-500">{doc.name_ar || 'لا يوجد اسم عربي'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.specialty}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.experience_years} yrs</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {doc.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doc.consultation_fee} EGP</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${doc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                        {doc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(doc)} className="p-2 rounded-lg hover:bg-[#F0F6FF] text-primary transition-colors cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Card list view for mobile */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No doctors found</div>
        ) : (
          doctors.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {doc.image_url ? (
                    <img src={doc.image_url} alt={doc.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400"><ImageIcon className="w-5 h-5" /></div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-gray-900 text-base">{doc.name}</h4>
                  <p className="text-xs text-gray-500">{doc.name_ar || 'لا يوجد اسم عربي'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${doc.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                  {doc.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 text-sm">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Specialty</span>
                  <span className="text-gray-800 font-semibold">{doc.specialty}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Experience</span>
                  <span className="text-gray-800 font-semibold">{doc.experience_years} years</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Rating</span>
                  <span className="text-gray-800 font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {doc.rating}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Fee</span>
                  <span className="text-gray-800 font-semibold">{doc.consultation_fee} EGP</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => openModal(doc)} className="flex-grow py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(doc.id)} className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Doctor Details' : 'Add New Doctor'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-150 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Full Name (English) *</label>
                  <input placeholder="e.g., Dr. Ahmed Yassin" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الاسم بالكامل (العربية)</label>
                  <input placeholder="مثال: د. أحمد ياسين" value={form.name_ar} onChange={(e) => setForm(p => ({ ...p, name_ar: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm text-right" dir="rtl" />
                </div>
              </div>

              {/* Specialty & Image */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Specialty (e.g., Cardiologist) *</label>
                  <input placeholder="Specialty" required value={form.specialty} onChange={(e) => setForm(p => ({ ...p, specialty: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Profile Image URL</label>
                  <input placeholder="https://image-url.com/doc.jpg" value={form.image_url} onChange={(e) => setForm(p => ({ ...p, image_url: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
              </div>

              {/* Stats: Exp, Rating, Fee */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Experience (years)</label>
                  <input type="number" value={form.experience_years} onChange={(e) => setForm(p => ({ ...p, experience_years: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Rating (0 - 5)</label>
                  <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm(p => ({ ...p, rating: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fee (EGP)</label>
                  <input type="number" value={form.consultation_fee} onChange={(e) => setForm(p => ({ ...p, consultation_fee: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
              </div>

              {/* Education */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Education & Degrees</label>
                <input placeholder="e.g., PhD in Medicine from Cairo University" value={form.education} onChange={(e) => setForm(p => ({ ...p, education: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Doctor Bio Description</label>
                <textarea rows={3} placeholder="Provide professional bio info..." value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none" />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 text-primary rounded focus:ring-primary" />
                <span className="text-sm text-gray-700">Publish / Active Profile</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6 border-t border-gray-100 pt-4">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
