import { useEffect, useState } from 'react';
import { ShoppingCart, Search, SlidersHorizontal, Star, Flame, TrendingUp, Sparkles, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { useSiteContent } from '../context/SiteContentContext';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  status: string;
}

const TAG_FILTERS = [
  { key: 'all', label: 'All Products', icon: null },
  { key: 'new', label: 'New', icon: <Sparkles size={14} /> },
  { key: 'featured', label: 'Featured', icon: <Star size={14} /> },
  { key: 'trending', label: 'Trending', icon: <TrendingUp size={14} /> },
  { key: 'bestSeller', label: 'Best Seller', icon: <Award size={14} /> },
  { key: 'hot', label: 'Hot', icon: <Flame size={14} /> },
];

function ProductCard({ product }: { product: Product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const { addToCart, openCart } = useCart();
  const navigate = useNavigate();
  const images = product.images.length > 0 ? product.images : ['/images/placeholder.jpg'];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, image: images[0] });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id: product.id, name: product.name, price: product.price, image: images[0] });
    openCart();
    navigate('/shop/checkout');
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <div onClick={() => navigate(`/shop/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#0d9488]/20 transition-all duration-300 cursor-pointer group">

      {/* Image Carousel */}
      <div className="relative h-56 bg-gray-50 overflow-hidden">
        <img src={images[imgIdx]} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <ChevronLeft size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setImgIdx((i) => (i + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
              <ChevronRight size={14} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-[#0d9488] w-3' : 'bg-white/70'}`} />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
          {product.tags.includes('new') && <span className="bg-[#0d9488] text-white text-xs font-bold px-2 py-0.5 rounded-full">New</span>}
          {product.tags.includes('hot') && <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><Flame size={10} />Hot</span>}
          {product.tags.includes('bestSeller') && <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Best Seller</span>}
        </div>

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-[#0f172a] text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/* Buy Now overlay on hover */}
        {product.stock > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button onClick={handleBuyNow}
              className="w-full py-2 bg-[#0f172a] text-white rounded-xl text-xs font-bold hover:bg-[#1e293b] transition-colors">
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[#0d9488] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-bold text-[#0f172a] text-sm leading-tight line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[#0d9488] font-bold text-base">₦{product.price.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="text-[#94a3b8] text-sm line-through">₦{product.comparePrice.toLocaleString()}</span>
          )}
        </div>
        <button onClick={handleAddToCart} disabled={product.stock === 0}
          className="w-full py-2.5 bg-[#0d9488]/10 text-[#0d9488] rounded-xl text-sm font-bold hover:bg-[#0d9488] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <ShoppingCart size={14} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default function Shop() {
  const { content } = useSiteContent();
  useSEO({
    title: content.seo_shop_title || 'Shop — Succeeder Designs & Merch',
    description: content.seo_shop_desc || 'Shop exclusive fashion pieces, music merch, and digital products from Succeed Michael Lawani\'s Succeeder Designs brand.',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [activeTag, setActiveTag] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { count, openCart } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProducts().then((data) => { setProducts(data); setFiltered(data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = products;
    if (activeTag !== 'all') result = result.filter((p) => p.tags.includes(activeTag));
    if (search.trim()) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [activeTag, search, products]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Search bar — sits below fixed navbar */}
      <div className="bg-[#0f172a] text-white pt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#0d9488] text-sm transition-all" />
          </div>
          <button onClick={openCart} className="relative p-3 bg-white/10 hover:bg-[#0d9488] rounded-2xl transition-colors flex-shrink-0">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0d9488] rounded-full text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tag Filters */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {TAG_FILTERS.map((f) => (
              <button key={f.key} onClick={() => setActiveTag(f.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTag === f.key
                    ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20'
                    : 'text-[#64748b] hover:bg-[#0d9488]/10 hover:text-[#0d9488]'
                }`}>
                {f.icon} {f.label}
              </button>
            ))}
            <div className="ml-auto flex items-center">
              <SlidersHorizontal size={16} className="text-[#64748b]" />
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-9 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-[#64748b] font-medium">No products found</p>
            <button onClick={() => { setActiveTag('all'); setSearch(''); }} className="mt-3 text-[#0d9488] text-sm font-semibold hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-[#64748b] text-sm mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>

      <CartDrawer />
      <Footer />
    </div>
  );
}
