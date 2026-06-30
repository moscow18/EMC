'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, MailOpen, Loader2, Trash2 } from 'lucide-react';
import type { Contact } from '@/lib/types';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    // Listen to real-time changes
    const channel = supabase
      .channel('admin:messages_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('contacts').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const deleteMsg = async (id: string) => {
    if (confirm('Delete this message?')) {
      await supabase.from('contacts').delete().eq('id', id);
      fetchMessages();
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-500">Contact form submissions</p>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`bg-white rounded-2xl p-6 border shadow-sm transition-all ${msg.is_read ? 'border-gray-100' : 'border-primary/30 bg-primary/[0.02]'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {msg.is_read ? <MailOpen className="w-4 h-4 text-gray-400" /> : <Mail className="w-4 h-4 text-primary" />}
                    <h4 className="font-semibold text-dark">{msg.name}</h4>
                    {!msg.is_read && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">New</span>}
                  </div>
                  {msg.subject && <p className="text-sm font-medium text-gray-700 mb-1">{msg.subject}</p>}
                  <p className="text-sm text-gray-500 mb-3">{msg.message}</p>
                  <div className="flex gap-4 text-xs text-gray-400">
                    {msg.email && <span>{msg.email}</span>}
                    {msg.phone && <span>{msg.phone}</span>}
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  {msg.email && (
                    <a 
                      href={`mailto:${msg.email}?subject=الرد على استفسارك - عيادة مصر الطبية&body=مرحباً ${msg.name}،%0D%0A%0D%0A`}
                      className="p-2 px-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all"
                    >
                      الرد عبر الإيميل
                    </a>
                  )}
                  {!msg.is_read && (
                    <button onClick={() => markRead(msg.id)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xs font-medium">Mark Read</button>
                  )}
                  <button onClick={() => deleteMsg(msg.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
