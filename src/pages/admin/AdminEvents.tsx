import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, X, Check } from 'lucide-react';
import { api } from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';
import { useDialog } from '../../context/DialogContext';

interface Event { id: number; title: string; date: string; day: string; month: string; time: string; location: string; image: string; category: string; description: string; price: string; spots: string; status: string; }
interface Rsvp { id: number; name: string; email: string; phone: string; ticketCount: number; paymentStatus: string; createdAt: string; }

const empty: Omit<Event, 'id'> = { title: '', date: '', day: '', month: '', time: '', location: '', image: '', category: 'Music', description: '', price: '', spots: '', status: 'upcoming' };
const categories = ['Music', 'Education', 'Lifestyle', 'Other'];

export default function AdminEvents() {
  const dialog = useDialog();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Event> }>({ open: false, data: {} });
  const [rsvpModal, setRsvpModal] = useState<{ open: boolean; eventId: number | null; title: string }>({ open: false, eventId: null, title: '' });
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.getEvents(filter === 'all' ? undefined : filter).then(setEvents).catch(console.error);
  };
  useEffect(load, [filter]);

  const save = async () => {
    setSaving(true);
    try {
      if (modal.data.id) await api.updateEvent(modal.data.id, modal.data);
      else await api.createEvent(modal.data);
      setModal({ open: false, data: {} });
      load();
    } catch (e) { await dialog.alert((e as Error).message, { variant: 'danger' }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!(await dialog.confirm('Delete this event?', { variant: 'danger', confirmText: 'Delete' }))) return;
    await api.deleteEvent(id); load();
  };

  const openRsvps = async (e: Event) => {
    setRsvpModal({ open: true, eventId: e.id, title: e.title });
    api.getEventRsvps(e.id).then(setRsvps).catch(console.error);
  };

  const field = (label: string, key: keyof Omit<Event, 'id'>, placeholder = '') => (
    <div key={key}>
      <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{label}</label>
      <input value={(modal.data as Record<string, unknown>)[key] as string || ''} placeholder={placeholder}
        onChange={(e) => setModal({ ...modal, data: { ...modal.data, [key]: e.target.value } })}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filter + Add */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-[#0d9488] text-white' : 'bg-white text-[#64748b] border border-gray-200 hover:bg-[#0d9488]/10 hover:text-[#0d9488]'}`}>
              {f === 'all' ? 'All Events' : f}
            </button>
          ))}
        </div>
        <button onClick={() => setModal({ open: true, data: { ...empty } })}
          className="flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              {['Event', 'Date', 'Location', 'Category', 'Price', 'Spots', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-sm text-[#0f172a] max-w-[200px] truncate">{e.title}</div>
                    <div className="text-[#64748b] text-xs mt-0.5">{e.time}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#0d9488] text-white rounded-lg px-2 py-1 text-center min-w-[44px]">
                        <div className="text-sm font-bold">{e.day}</div>
                        <div className="text-[10px] opacity-80">{e.month}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[#64748b] max-w-[140px] truncate">{e.location}</td>
                  <td className="px-4 py-4"><span className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-semibold px-2 py-1 rounded-full">{e.category}</span></td>
                  <td className="px-4 py-4 text-sm font-semibold text-[#0d9488]">{e.price}</td>
                  <td className="px-4 py-4 text-sm text-[#64748b]">{e.spots}</td>
                  <td className="px-4 py-4">
                    <select value={e.status}
                      onChange={(ev) => api.updateEvent(e.id, { status: ev.target.value }).then(load)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${e.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => openRsvps(e)} title="View RSVPs"
                        className="p-2 text-[#64748b] hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"><Users size={15} /></button>
                      <button onClick={() => setModal({ open: true, data: e })}
                        className="p-2 text-[#64748b] hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => del(e.id)}
                        className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-[#64748b] text-sm">No events found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#0f172a]">{modal.data.id ? 'Edit Event' : 'Add Event'}</h3>
              <button onClick={() => setModal({ open: false, data: {} })} className="text-[#64748b]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {field('Title', 'title', 'Daily Miracles Album Launch')}
              <div className="grid grid-cols-2 gap-4">
                {field('Day', 'day', '15')}
                {field('Month', 'month', 'JUN')}
              </div>
              {field('Full Date', 'date', 'June 15, 2026')}
              {field('Time', 'time', '6:00 PM')}
              {field('Location', 'location', 'Eko Hotel, Lagos')}
              <ImageUpload
                label="Event Image"
                value={modal.data.image || ''}
                onChange={(url) => setModal({ ...modal, data: { ...modal.data, image: url } })}
              />
              {field('Price', 'price', '₦5,000 or Free')}
              {field('Spots', 'spots', '500 spots left')}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Category</label>
                <select value={modal.data.category || 'Music'}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white transition-all">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Status</label>
                <select value={modal.data.status || 'upcoming'}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white transition-all">
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Description</label>
                <textarea value={modal.data.description || ''} rows={4} placeholder="Event description..."
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal({ open: false, data: {} })} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-[#64748b]">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RSVPs Modal */}
      {rsvpModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg text-[#0f172a]">RSVPs</h3>
                <p className="text-[#64748b] text-sm">{rsvpModal.title}</p>
              </div>
              <button onClick={() => setRsvpModal({ open: false, eventId: null, title: '' })} className="text-[#64748b]"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rsvps.length === 0 ? (
                <p className="text-center py-12 text-[#64748b] text-sm">No RSVPs yet for this event</p>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100">
                    {['Name', 'Email', 'Phone', 'Tickets', 'Payment', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {rsvps.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-sm font-semibold text-[#0f172a]">{r.name}</td>
                        <td className="px-4 py-3 text-sm text-[#64748b]">{r.email}</td>
                        <td className="px-4 py-3 text-sm text-[#64748b]">{r.phone || '—'}</td>
                        <td className="px-4 py-3 text-sm text-center">{r.ticketCount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {r.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#64748b]">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
