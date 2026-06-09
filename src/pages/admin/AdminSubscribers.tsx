import { useEffect, useState } from 'react';
import { Users, Trash2, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { useDialog } from '../../context/DialogContext';

interface Subscriber { id: number; email: string; active: boolean; createdAt: string; }

export default function AdminSubscribers() {
  const dialog = useDialog();
  const [subs, setSubs] = useState<Subscriber[]>([]);

  const load = () => { api.getSubscribers().then(setSubs).catch(console.error); };
  useEffect(load, []);

  const remove = async (id: number) => {
    if (!(await dialog.confirm('Unsubscribe this email?', { variant: 'danger', confirmText: 'Unsubscribe' }))) return;
    await api.deleteSubscriber(id); load();
  };

  const exportCsv = () => {
    const rows = [['Email', 'Status', 'Joined'], ...subs.map((s) => [s.email, s.active ? 'Active' : 'Unsubscribed', new Date(s.createdAt).toLocaleDateString()])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'subscribers.csv';
    a.click();
  };

  const active = subs.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: subs.length, color: 'bg-[#0d9488]' },
          { label: 'Active', value: active, color: 'bg-green-500' },
          { label: 'Unsubscribed', value: subs.length - active, color: 'bg-gray-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
              <Users className="text-white" size={16} />
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{s.value}</div>
            <div className="text-[#64748b] text-sm">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-[#0f172a] flex items-center gap-2"><Users size={18} className="text-[#0d9488]" /> All Subscribers</h3>
          <button onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#64748b] hover:text-[#0d9488] hover:border-[#0d9488] transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <table className="w-full">
          <thead><tr className="border-b border-gray-100">
            {['Email', 'Status', 'Joined', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {subs.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-[#64748b] text-sm">No subscribers yet</td></tr>}
            {subs.map((s) => (
              <tr key={s.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-[#0f172a]">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.active ? 'Active' : 'Unsubscribed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#64748b]">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => remove(s.id)}
                    className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
