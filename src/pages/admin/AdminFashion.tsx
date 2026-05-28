import { useEffect, useState } from 'react';
import { Shirt, Trash2, X } from 'lucide-react';
import { api } from '../../lib/api';

interface Inquiry { id: number; name: string; email: string; phone: string; garmentType: string; measurements: string; budget: string; notes: string; status: string; createdAt: string; }

const statusColors: Record<string, string> = {
  new: 'bg-[#0d9488] text-white',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

export default function AdminFashion() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const load = () => {
    api.getFashionInquiries(filter !== 'all' ? filter : undefined).then(setInquiries).catch(console.error);
  };
  useEffect(load, [filter]);

  const setStatus = async (id: number, status: string) => {
    await api.updateFashionInquiry(id, { status }); load();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const del = async (id: number) => {
    if (!confirm('Delete this inquiry?')) return;
    await api.deleteFashionInquiry(id); setSelected(null); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {['all', 'new', 'in-progress', 'completed'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-[#0d9488] text-white' : 'bg-white text-[#64748b] border border-gray-200 hover:bg-[#0d9488]/10 hover:text-[#0d9488]'}`}>
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Shirt size={16} className="text-[#0d9488]" />
            <span className="font-bold text-[#0f172a]">Fashion Inquiries ({inquiries.length})</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {inquiries.length === 0 && <p className="text-center py-12 text-[#64748b] text-sm">No inquiries</p>}
            {inquiries.map((q) => (
              <div key={q.id} onClick={() => setSelected(q)}
                className={`px-5 py-4 cursor-pointer hover:bg-[#f8fafc] transition-colors ${selected?.id === q.id ? 'bg-[#f0fdfa] border-l-2 border-[#0d9488]' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-[#0f172a]">{q.name}</div>
                    <div className="text-[#64748b] text-xs">{q.garmentType || 'Custom Order'}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[q.status] || 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
                </div>
                <div className="text-[#0d9488] text-xs font-semibold mt-1">{q.budget}</div>
                <div className="text-[#64748b] text-xs mt-0.5">{new Date(q.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {selected ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="font-bold text-[#0f172a]">Inquiry Detail</span>
              <button onClick={() => setSelected(null)} className="text-[#64748b]"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Phone', value: selected.phone || '—' },
                  { label: 'Garment Type', value: selected.garmentType || '—' },
                  { label: 'Budget', value: selected.budget || '—' },
                  { label: 'Received', value: new Date(selected.createdAt).toLocaleDateString() },
                ].map((f) => (
                  <div key={f.label} className="bg-[#f8fafc] rounded-xl p-3">
                    <div className="text-xs font-semibold text-[#64748b] mb-0.5">{f.label}</div>
                    <div className="text-sm font-semibold text-[#0f172a] break-words">{f.value}</div>
                  </div>
                ))}
              </div>
              {selected.measurements && (
                <div>
                  <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Measurements</div>
                  <p className="bg-[#f8fafc] rounded-xl p-3 text-sm text-[#0f172a]">{selected.measurements}</p>
                </div>
              )}
              {selected.notes && (
                <div>
                  <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Notes</div>
                  <p className="bg-[#f8fafc] rounded-xl p-3 text-sm text-[#0f172a]">{selected.notes}</p>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {['new', 'in-progress', 'completed'].map((s) => (
                    <button key={s} onClick={() => setStatus(selected.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all border ${selected.status === s ? 'bg-[#0d9488] text-white border-[#0d9488]' : 'border-gray-200 text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488]'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}`}
                  className="flex-1 text-center bg-[#0d9488] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
                  Email Client
                </a>
                <button onClick={() => del(selected.id)}
                  className="p-2.5 text-red-400 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center h-64">
            <div className="text-center text-[#64748b]">
              <Shirt size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select an inquiry to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
