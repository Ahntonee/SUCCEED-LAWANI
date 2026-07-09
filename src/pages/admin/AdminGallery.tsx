import { useEffect, useState } from 'react';
import { Images, Plus, Trash2, X, GripVertical, Youtube, Image as ImageIcon, Save } from 'lucide-react';
import { api } from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';
import { useDialog } from '../../context/DialogContext';
import { toast } from 'sonner';

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  order: number;
  createdAt: string;
}

function getYouTubeThumbnail(url: string): string | null {
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{1,12})/);
  if (shorts) return `https://img.youtube.com/vi/${shorts[1]}/mqdefault.jpg`;
  const standard = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{1,12})/);
  if (standard) return `https://img.youtube.com/vi/${standard[1]}/mqdefault.jpg`;
  return null;
}

const emptyForm = { type: 'image', url: '', caption: '', order: 0 };

export default function AdminGallery() {
  const dialog = useDialog();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);

  const load = () => {
    setLoading(true);
    api.getGallery().then((data) => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, order: items.length });
    setShowForm(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ type: item.type, url: item.url, caption: item.caption, order: item.order });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.url.trim()) { toast.error('URL is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.updateGalleryItem(editing.id, form);
        toast.success('Item updated');
      } else {
        await api.createGalleryItem(form);
        toast.success('Item added to gallery');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ ...emptyForm });
      load();
    } catch (e) {
      toast.error((e as Error).message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await dialog.confirm('Delete this gallery item?', { variant: 'danger', confirmText: 'Delete' }))) return;
    try {
      await api.deleteGalleryItem(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
            <Images size={20} className="text-[#0d9488]" /> Gallery
          </h2>
          <p className="text-[#64748b] text-sm mt-1">Manage photos and videos shown on the public Gallery page.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors"
        >
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-[#0f172a]">{editing ? 'Edit Item' : 'Add New Item'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-[#64748b] hover:text-[#0f172a]">
              <X size={18} />
            </button>
          </div>

          {/* Type toggle */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Type</label>
            <div className="flex gap-3">
              {[
                { value: 'image', icon: ImageIcon, label: 'Photo' },
                { value: 'video', icon: Youtube,   label: 'YouTube Video' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, type: value, url: '' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === value
                      ? 'border-[#0d9488] bg-[#0d9488]/5 text-[#0d9488]'
                      : 'border-gray-200 text-[#64748b] hover:border-[#0d9488]/40'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* URL / Upload */}
          <div className="mb-5">
            {form.type === 'image' ? (
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Photo</label>
                <ImageUpload
                  value={form.url}
                  onChange={(url) => setForm({ ...form, url })}
                  label=""
                  placeholder="Upload a photo or paste image URL"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">YouTube URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://youtube.com/shorts/..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
                />
                {form.url && getYouTubeThumbnail(form.url) && (
                  <div className="mt-3 flex items-center gap-3">
                    <img src={getYouTubeThumbnail(form.url)!} alt="Thumbnail" className="w-32 rounded-lg" />
                    <span className="text-xs text-green-600 font-semibold">✓ Valid YouTube URL</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Caption <span className="text-[#94a3b8] font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              placeholder="Short description of this photo or video"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
            />
          </div>

          {/* Order */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">Display Order <span className="text-[#94a3b8] font-normal">(lower = first)</span></label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              min={0}
              className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#0d9488] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors disabled:opacity-60"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {editing ? 'Save Changes' : 'Add to Gallery'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#64748b] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          <Images size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-[#64748b] text-sm">No gallery items yet.</p>
          <button onClick={openAdd} className="mt-4 inline-flex items-center gap-2 text-[#0d9488] font-semibold text-sm hover:underline">
            <Plus size={14} /> Add your first photo or video
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const thumb = item.type === 'video' ? getYouTubeThumbnail(item.url) : item.url;
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="relative h-40 bg-gray-50 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={item.caption || ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                        <Youtube size={18} className="text-red-500" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-[#0d9488]/10 text-[#0d9488]'}`}>
                      {item.type === 'video' ? 'Video' : 'Photo'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-[#0f172a] font-medium truncate mb-1">{item.caption || <span className="text-gray-400 italic">No caption</span>}</p>
                  <p className="text-xs text-[#94a3b8] mb-3">Order: {item.order}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#64748b] hover:border-[#0d9488] hover:text-[#0d9488] transition-colors"
                    >
                      <GripVertical size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
