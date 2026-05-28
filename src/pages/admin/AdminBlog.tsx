import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Star, Eye, X, Check } from 'lucide-react';
import { api } from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';

interface Post { id: number; title: string; excerpt: string; content: string; image: string; category: string; date: string; readTime: string; tags: string[]; featured: boolean; status: string; viewCount: number; }

const empty: Omit<Post, 'id' | 'viewCount'> = { title: '', excerpt: '', content: '', image: '', category: 'Music', date: '', readTime: '', tags: [], featured: false, status: 'published' };
const categories = ['Music', 'Fashion', 'Marketing', 'Lifestyle'];

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Post> }>({ open: false, data: {} });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  const load = () => { api.getBlogPosts().then(setPosts).catch(console.error); };
  useEffect(load, []);

  const filtered = posts.filter((p) => filter === 'all' || p.status === filter);

  const save = async () => {
    setSaving(true);
    try {
      if (modal.data.id) await api.updateBlogPost(modal.data.id, modal.data);
      else await api.createBlogPost(modal.data);
      setModal({ open: false, data: {} });
      setTagInput('');
      load();
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    await api.deleteBlogPost(id); load();
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    const tags = [...(modal.data.tags || []), tagInput.trim()];
    setModal({ ...modal, data: { ...modal.data, tags } });
    setTagInput('');
  };

  const removeTag = (i: number) => {
    const tags = (modal.data.tags || []).filter((_, idx) => idx !== i);
    setModal({ ...modal, data: { ...modal.data, tags } });
  };

  const catColors: Record<string, string> = {
    Music: 'bg-[#0d9488]/10 text-[#0d9488]',
    Fashion: 'bg-purple-100 text-purple-700',
    Marketing: 'bg-blue-100 text-blue-700',
    Lifestyle: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-[#0d9488] text-white' : 'bg-white text-[#64748b] border border-gray-200 hover:bg-[#0d9488]/10 hover:text-[#0d9488]'}`}>
              {f}
            </button>
          ))}
        </div>
        <button onClick={() => { setModal({ open: true, data: { ...empty } }); setTagInput(''); }}
          className="flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-gray-100">
            {['Post', 'Category', 'Views', 'Status', 'Featured', 'Date', ''].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
            ))}
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                <td className="px-4 py-4 max-w-[280px]">
                  <div className="font-semibold text-sm text-[#0f172a] truncate">{p.title}</div>
                  <div className="text-[#64748b] text-xs mt-0.5 truncate">{p.excerpt}</div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${catColors[p.category] || 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                </td>
                <td className="px-4 py-4 text-sm text-[#64748b] flex items-center gap-1"><Eye size={13} /> {p.viewCount}</td>
                <td className="px-4 py-4">
                  <select value={p.status}
                    onChange={(e) => api.updateBlogPost(p.id, { status: e.target.value }).then(load)}
                    className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => api.updateBlogPost(p.id, { featured: !p.featured }).then(load)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${p.featured ? 'bg-[#0d9488] text-white' : 'bg-gray-100 text-gray-400 hover:bg-[#0d9488]/20'}`}>
                    <Star size={14} />
                  </button>
                </td>
                <td className="px-4 py-4 text-xs text-[#64748b] whitespace-nowrap">{p.date}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setModal({ open: true, data: p }); setTagInput(''); }}
                      className="p-2 text-[#64748b] hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => del(p.id)}
                      className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-[#64748b] text-sm">No posts found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Post Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#0f172a]">{modal.data.id ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={() => setModal({ open: false, data: {} })} className="text-[#64748b]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Title', key: 'title', placeholder: 'Post title...' },
                { label: 'Date', key: 'date', placeholder: 'May 10, 2026' },
                { label: 'Read Time', key: 'readTime', placeholder: '5 min read' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{f.label}</label>
                  <input value={(modal.data as Record<string, unknown>)[f.key] as string || ''} placeholder={f.placeholder}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, [f.key]: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
              ))}
              <ImageUpload
                label="Cover Image"
                value={modal.data.image || ''}
                onChange={(url) => setModal({ ...modal, data: { ...modal.data, image: url } })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Category</label>
                  <select value={modal.data.category || 'Music'}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Status</label>
                  <select value={modal.data.status || 'published'}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Excerpt</label>
                <textarea value={modal.data.excerpt || ''} rows={2} placeholder="Short summary..."
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, excerpt: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm resize-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Full Content</label>
                <textarea value={modal.data.content || ''} rows={8} placeholder="Write your full article here..."
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, content: e.target.value } })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm resize-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Tags</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {(modal.data.tags || []).map((tag, i) => (
                    <span key={i} className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      #{tag}
                      <button onClick={() => removeTag(i)} className="hover:text-red-500"><X size={11} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder="Add tag and press Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                  <button onClick={addTag} className="px-4 py-2.5 bg-[#0d9488] text-white rounded-xl text-sm font-semibold hover:bg-[#0f766e]">Add</button>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setModal({ ...modal, data: { ...modal.data, featured: !modal.data.featured } })}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${modal.data.featured ? 'bg-[#0d9488]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${modal.data.featured ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-sm font-semibold text-[#0f172a]">Featured Post</span>
              </label>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal({ open: false, data: {} })} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-[#64748b]">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Save Post</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
