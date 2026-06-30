'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Pencil, Trash2, X, Loader2, Tag } from 'lucide-react';
import type { Offer } from '@/lib/types';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', discount_percentage: 0,
    original_price: 0, discounted_price: 0, expiry_date: '', is_active: true,
  });

  const fetchOffers = async () => {
    setLoading(true);
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    if (data) setOffers(data);
    setLoading(false);
  };

  useEffect(() => { fetchOffers(); }, []);

  const openModal = (offer?: Offer) => {
    if (offer) {
      setEditing(offer);
      setForm({
        title: offer.title, description: offer.description || '',
        discount_percentage: offer.discount_percentage,
        original_price: offer.original_price || 0, discounted_price: offer.discounted_price || 0,
        expiry_date: offer.expiry_date || '', is_active: offer.is_active,
      });
    } else {
      setEditing(null);
      setForm({ title: '', description: '', discount_percentage: 0, original_price: 0, discounted_price: 0, expiry_date: '', is_active: true });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editing) {
      await supabase.from('offers').update(form).eq('id', editing.id);
    } else {
      await supabase.from('offers').insert(form);
    }
    setSaving(false);
    setModalOpen(false);
    fetchOffers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this offer?')) {
      await supabase.from('offers').delete().eq('id', id);
      fetchOffers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">Manage special offers and discounts</p>
        <button onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4" /> Add Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : offers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No offers yet</div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-danger/10 text-danger rounded-full text-sm font-bold">
                  <Tag className="w-3.5 h-3.5" /> {offer.discount_percentage}% OFF
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openModal(offer)} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(offer.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-outfit text-lg font-bold text-dark mb-2">{offer.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{offer.description}</p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-primary">{offer.discounted_price} EGP</span>
                <span className="text-sm text-gray-400 line-through">{offer.original_price} EGP</span>
              </div>
              {offer.expiry_date && (
                <p className="text-xs text-gray-400">Expires: {new Date(offer.expiry_date).toLocaleDateString()}</p>
              )}
              <div className="mt-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${offer.is_active ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'}`}>
                  {offer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-outfit text-xl font-bold">{editing ? 'Edit Offer' : 'Add Offer'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Offer Title *" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
              <textarea rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm resize-none" />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Discount %</label>
                  <input type="number" value={form.discount_percentage} onChange={(e) => setForm(p => ({ ...p, discount_percentage: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Original (EGP)</label>
                  <input type="number" value={form.original_price} onChange={(e) => setForm(p => ({ ...p, original_price: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Sale (EGP)</label>
                  <input type="number" value={form.discounted_price} onChange={(e) => setForm(p => ({ ...p, discounted_price: +e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
                <input type="date" value={form.expiry_date} onChange={(e) => setForm(p => ({ ...p, expiry_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark disabled:opacity-50 text-sm flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
