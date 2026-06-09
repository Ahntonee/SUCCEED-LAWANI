import { useEffect, useState } from 'react';
import { Mail, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { useDialog } from '../../context/DialogContext';

interface Contact { id: number; name: string; email: string; subject: string; inquiryType: string; message: string; status: string; createdAt: string; }

const typeColors: Record<string, string> = {
  music: 'bg-[#0d9488]/10 text-[#0d9488]',
  fashion: 'bg-purple-100 text-purple-700',
  marketing: 'bg-blue-100 text-blue-700',
  events: 'bg-orange-100 text-orange-700',
  media: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
};

const statusColors: Record<string, string> = {
  unread: 'bg-[#0d9488] text-white',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

export default function AdminContacts() {
  const dialog = useDialog();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = () => {
    const params: Record<string, string> = {};
    if (filter !== 'all') params.inquiryType = filter;
    api.getContacts(params).then(setContacts).catch(console.error);
  };
  useEffect(load, [filter]);

  const setStatus = async (id: number, status: string) => {
    await api.updateContact(id, { status });
    load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const del = async (id: number) => {
    if (!(await dialog.confirm('Delete this message?', { variant: 'danger', confirmText: 'Delete' }))) return;
    await api.deleteContact(id);
    setSelected(null);
    load();
  };

  const tabs = ['all', 'music', 'fashion', 'marketing', 'events', 'media', 'other'];
  const statuses = ['unread', 'read', 'replied', 'archived'];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === t ? 'bg-[#0d9488] text-white' : 'bg-white text-[#64748b] border border-gray-200 hover:bg-[#0d9488]/10 hover:text-[#0d9488]'}`}>
            {t === 'all' ? `All (${contacts.length})` : t}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Mail size={16} className="text-[#0d9488]" />
            <span className="font-bold text-[#0f172a]">Messages ({contacts.length})</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {contacts.length === 0 && <p className="text-center py-12 text-[#64748b] text-sm">No messages</p>}
            {contacts.map((c) => (
              <div key={c.id} onClick={() => { setSelected(c); if (c.status === 'unread') setStatus(c.id, 'read'); }}
                className={`px-5 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors ${selected?.id === c.id ? 'bg-[#f0fdfa] border-l-2 border-[#0d9488]' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-[#0f172a] truncate">{c.name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.status === 'unread' && <div className="w-2 h-2 bg-[#0d9488] rounded-full" />}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[c.inquiryType] || typeColors.other}`}>{c.inquiryType}</span>
                  </div>
                </div>
                <p className="text-[#64748b] text-xs truncate">{c.subject}</p>
                <p className="text-[#64748b] text-xs mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {selected ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-[#0f172a]">Message Detail</span>
              <button onClick={() => setSelected(null)} className="text-[#64748b] hover:text-[#0f172a]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-[#0f172a]">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="text-[#0d9488] text-sm hover:underline">{selected.email}</a>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[selected.status] || statusColors.read}`}>{selected.status}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Subject</div>
                <div className="font-semibold text-[#0f172a]">{selected.subject || '—'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-1">Inquiry Type</div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColors[selected.inquiryType] || typeColors.other}`}>{selected.inquiryType}</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Message</div>
                <p className="text-[#0f172a] text-sm leading-relaxed bg-[#f8fafc] rounded-xl p-4">{selected.message}</p>
              </div>
              <div className="text-xs text-[#64748b]">Received: {new Date(selected.createdAt).toLocaleString()}</div>

              {/* Status actions */}
              <div>
                <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button key={s} onClick={() => setStatus(selected.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${selected.status === s ? 'bg-[#0d9488] text-white border-[#0d9488]' : 'border-gray-200 text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                  onClick={() => setStatus(selected.id, 'replied')}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0d9488] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
                  <Mail size={15} /> Reply via Email
                </a>
                <button onClick={() => del(selected.id)}
                  className="p-2.5 text-red-400 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
            <div className="text-center text-[#64748b]">
              <Mail size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a message to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
