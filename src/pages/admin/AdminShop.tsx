import { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, X, Check, Package, ShoppingBag, Upload, Flame, Star, TrendingUp, Sparkles, Award } from 'lucide-react';
import { api } from '../../lib/api';
import ImageUpload from '../../components/ImageUpload';
import { useDialog } from '../../context/DialogContext';

interface Product {
  id: number; name: string; description: string; price: number; comparePrice?: number;
  images: string[]; category: string; tags: string[]; stock: number; status: string; affiliateUrl?: string;
}
interface Order {
  id: number; customerName: string; customerEmail: string; total: number;
  paymentMethod: string; status: string; createdAt: string;
  items: { id: number; name: string; price: number; qty: number; image: string }[];
}

const CATEGORIES = ['Apparel', 'Music', 'Accessories', 'Art', 'Digital', 'Merch', 'Other'];
const ALL_TAGS = [
  { key: 'new', label: 'New', icon: <Sparkles size={12} />, color: 'bg-[#0d9488]/10 text-[#0d9488]' },
  { key: 'featured', label: 'Featured', icon: <Star size={12} />, color: 'bg-blue-50 text-blue-600' },
  { key: 'trending', label: 'Trending', icon: <TrendingUp size={12} />, color: 'bg-purple-50 text-purple-600' },
  { key: 'bestSeller', label: 'Best Seller', icon: <Award size={12} />, color: 'bg-yellow-50 text-yellow-600' },
  { key: 'hot', label: 'Hot', icon: <Flame size={12} />, color: 'bg-orange-50 text-orange-600' },
];

const emptyProduct = { name: '', description: '', price: 0, comparePrice: undefined as number | undefined, images: [] as string[], category: 'Apparel', tags: [] as string[], stock: 0, status: 'active', affiliateUrl: '' };

export default function AdminShop() {
  const dialog = useDialog();
  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Product> & { images: string[] } }>({ open: false, data: { ...emptyProduct } });
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api.getAllProducts().then(setProducts).catch(console.error);
    api.getOrders({ limit: 100 })
      .then((res) => setOrders(Array.isArray(res) ? res : (res.orders ?? [])))
      .catch(console.error);
  };
  useEffect(load, []);

  const openAdd = () => setModal({ open: true, data: { ...emptyProduct, images: [] } });
  const openEdit = (p: Product) => setModal({ open: true, data: { ...p } });

  const save = async () => {
    if (!modal.data.name?.trim()) { await dialog.alert('Product name is required', { variant: 'warning' }); return; }
    if (!modal.data.price || modal.data.price <= 0) { await dialog.alert('A valid price is required', { variant: 'warning' }); return; }
    if ((modal.data.images || []).length < 1) { await dialog.alert('Please upload at least 1 product image', { variant: 'warning' }); return; }
    setSaving(true);
    try {
      if (modal.data.id) await api.updateProduct(modal.data.id, modal.data);
      else await api.createProduct(modal.data);
      setModal({ open: false, data: { ...emptyProduct } });
      load();
    } catch (e) { await dialog.alert((e as Error).message, { variant: 'danger' }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!(await dialog.confirm('Delete this product?', { variant: 'danger', confirmText: 'Delete' }))) return;
    await api.deleteProduct(id); load();
  };

  const toggleTag = (tag: string) => {
    const tags = modal.data.tags || [];
    setModal({ ...modal, data: { ...modal.data, tags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag] } });
  };

  const addImage = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImgUploading(true);
    try {
      const url = await api.uploadImage(file);
      setModal((prev) => ({ ...prev, data: { ...prev.data, images: [...(prev.data.images || []), url] } }));
    } catch (e) { await dialog.alert((e as Error).message, { variant: 'danger' }); }
    finally { setImgUploading(false); }
  };

  const removeImage = (i: number) => {
    const images = (modal.data.images || []).filter((_, idx) => idx !== i);
    setModal({ ...modal, data: { ...modal.data, images } });
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-green-100 text-green-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-[#0d9488]/10 text-[#0d9488]',
    failed: 'bg-red-100 text-red-500',
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2">
        {(['products', 'orders'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm capitalize transition-all ${tab === t ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20' : 'bg-white text-[#64748b] hover:bg-[#0d9488]/10 hover:text-[#0d9488] border border-gray-200'}`}>
            {t === 'products' ? <span className="flex items-center gap-2"><Package size={14} /> Products ({products.length})</span>
              : <span className="flex items-center gap-2"><ShoppingBag size={14} /> Orders ({orders.length})</span>}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      {tab === 'products' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a]">All Products</h3>
            <button onClick={openAdd} className="flex items-center gap-2 bg-[#0d9488] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f766e] transition-colors">
              <Plus size={16} /> Add Product
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-50">
                {['Product', 'Category', 'Price', 'Stock', 'Tags', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0] || '/images/placeholder.jpg'} alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-sm text-[#0f172a] line-clamp-1">{p.name}</p>
                          <p className="text-xs text-[#64748b]">{p.images.length} image{p.images.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">
                      {p.category}
                      {p.affiliateUrl && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">Amazon</span>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-[#0d9488]">₦{p.price.toLocaleString()}</p>
                      {p.comparePrice && <p className="text-xs text-[#94a3b8] line-through">₦{p.comparePrice.toLocaleString()}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748b]">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 2).map((t) => {
                          const tag = ALL_TAGS.find((x) => x.key === t);
                          return tag ? <span key={t} className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${tag.color}`}>{tag.icon}{tag.label}</span> : null;
                        })}
                        {p.tags.length > 2 && <span className="text-xs text-[#64748b]">+{p.tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select value={p.status}
                        onChange={(e) => api.updateProduct(p.id, { status: e.target.value }).then(load)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 text-[#64748b] hover:text-[#0d9488] hover:bg-[#0d9488]/10 rounded-lg transition-colors"><Edit2 size={15} /></button>
                        <button onClick={() => del(p.id)} className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-[#64748b] text-sm">No products yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a]">All Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-50">
                {['Order', 'Customer', 'Total', 'Method', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-[#0f172a]">#{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-[#0f172a]">{o.customerName}</p>
                      <p className="text-xs text-[#64748b]">{o.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#0d9488]">₦{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-[#64748b] capitalize">{o.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <select value={o.status}
                        onChange={(e) => api.updateOrder(o.id, { status: e.target.value }).then(load)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {['pending', 'paid', 'shipped', 'delivered', 'failed'].map((s) => <option key={s} value={s} className="bg-white text-[#0f172a]">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                  </tr>
                ))}
                {orders.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-[#64748b] text-sm">No orders yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#0f172a]">{modal.data.id ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal({ open: false, data: { ...emptyProduct } })} className="text-[#64748b] hover:text-[#0f172a]"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Product Images */}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Product Images <span className="text-[#64748b] font-normal">(upload at least 3)</span></label>
                {(modal.data.images || []).length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {(modal.data.images || []).map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && <span className="absolute bottom-0 inset-x-0 text-center bg-[#0d9488] text-white text-[10px] font-bold py-0.5">Main</span>}
                        <button onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                    {(modal.data.images || []).length < 8 && (
                      <button type="button" onClick={() => imgInputRef.current?.click()} disabled={imgUploading}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-[#0d9488] flex items-center justify-center transition-colors disabled:opacity-50">
                        {imgUploading ? <div className="w-5 h-5 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" /> : <Plus size={20} className="text-gray-400" />}
                      </button>
                    )}
                  </div>
                )}
                {(modal.data.images || []).length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0d9488]/40 transition-colors">
                    <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-[#64748b] mb-1">Upload product images</p>
                    <p className="text-xs text-gray-400">Minimum 3 images recommended</p>
                    <button type="button" onClick={() => imgInputRef.current?.click()}
                      className="mt-3 px-4 py-2 bg-[#0d9488] text-white text-xs font-bold rounded-xl hover:bg-[#0f766e] transition-colors">
                      Select Images
                    </button>
                  </div>
                )}
                <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { Array.from(e.target.files || []).forEach(addImage); e.target.value = ''; }} />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Product Name</label>
                <input value={modal.data.name || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })}
                  placeholder="e.g. Exclusive Tee Shirt"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Description</label>
                <textarea value={modal.data.description || ''} rows={3}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })}
                  placeholder="Describe the product..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all resize-none" />
              </div>

              {/* Price + Compare */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Price (₦)</label>
                  <input type="number" value={modal.data.price || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, price: Number(e.target.value) } })}
                    placeholder="5000"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Compare Price (₦) <span className="text-[#94a3b8] font-normal text-xs">optional</span></label>
                  <input type="number" value={modal.data.comparePrice || ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, comparePrice: Number(e.target.value) || undefined } })}
                    placeholder="7000"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
              </div>

              {/* Category + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Category</label>
                  <select value={modal.data.category || 'Apparel'}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value } })}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm bg-white transition-all">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Stock</label>
                  <input type="number" value={modal.data.stock ?? ''} onChange={(e) => setModal({ ...modal, data: { ...modal.data, stock: Number(e.target.value) } })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map((t) => {
                    const active = (modal.data.tags || []).includes(t.key);
                    return (
                      <button key={t.key} type="button" onClick={() => toggleTag(t.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${active ? 'bg-[#0d9488] text-white border-[#0d9488]' : 'border-gray-200 text-[#64748b] hover:border-[#0d9488]/40'}`}>
                        {t.icon} {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amazon Affiliate URL */}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  Amazon Affiliate URL <span className="text-[#94a3b8] font-normal text-xs">optional — if set, Buy Now redirects to Amazon instead of checkout</span>
                </label>
                <input
                  type="url"
                  value={modal.data.affiliateUrl || ''}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, affiliateUrl: e.target.value } })}
                  placeholder="https://www.amazon.com/dp/..."
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm transition-all"
                />
              </div>

              {/* Image URL fallback */}
              <ImageUpload label="Or add image via URL" value="" onChange={(url) => {
                if (url) setModal((prev) => ({ ...prev, data: { ...prev.data, images: [...(prev.data.images || []), url] } }));
              }} />
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal({ open: false, data: { ...emptyProduct } })}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-[#64748b]">Cancel</button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-[#0d9488] text-white text-sm font-semibold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
