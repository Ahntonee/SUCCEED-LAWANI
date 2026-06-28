import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ShoppingCart, ArrowLeft, Flame, Star, TrendingUp, Sparkles, Award, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../lib/api';

interface Product {
  id: number; name: string; description: string; price: number; comparePrice?: number;
  images: string[]; category: string; tags: string[]; stock: number;
}

const TAG_ICONS: Record<string, React.JSX.Element> = {
  new: <span className="flex items-center gap-1 bg-[#0d9488] text-white text-xs font-bold px-2.5 py-1 rounded-full"><Sparkles size={11} />New</span>,
  featured: <span className="flex items-center gap-1 bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"><Star size={11} />Featured</span>,
  trending: <span className="flex items-center gap-1 bg-purple-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"><TrendingUp size={11} />Trending</span>,
  bestSeller: <span className="flex items-center gap-1 bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"><Award size={11} />Best Seller</span>,
  hot: <span className="flex items-center gap-1 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full"><Flame size={11} />Hot</span>,
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart, openCart, count } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getProduct(Number(id)).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#0d9488]/20 border-t-[#0d9488] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-[#64748b]">
      Product not found.
    </div>
  );

  const images = product.images.length > 0 ? product.images : ['/images/placeholder.jpg'];
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : null;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart({ id: product.id, name: product.name, price: product.price, image: images[0] });
    openCart();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart({ id: product.id, name: product.name, price: product.price, image: images[0] });
    navigate('/shop/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />

      {/* Sub-header: back navigation + cart access */}
      <div className="bg-[#0f172a] text-white pt-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/shop')} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Shop
          </button>
          <button onClick={openCart} className="relative p-2 bg-white/10 hover:bg-[#0d9488] rounded-xl transition-colors">
            <ShoppingCart size={18} />
            {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0d9488] rounded-full text-[10px] font-bold flex items-center justify-center">{count}</span>}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 aspect-square">
              <img src={images[mainImg]} alt={product.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
              {images.length > 1 && (
                <>
                  <button onClick={() => setMainImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-[#0d9488] hover:text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setMainImg((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-[#0d9488] hover:text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {discount && <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === mainImg ? 'border-[#0d9488] shadow-md' : 'border-gray-100 hover:border-[#0d9488]/40'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <p className="text-[#0d9488] text-sm font-bold uppercase tracking-wide">{product.category}</p>
              <h1 className="text-3xl font-black text-[#0f172a] mt-1 leading-tight">{product.name}</h1>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => TAG_ICONS[t] && <span key={t}>{TAG_ICONS[t]}</span>)}
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-[#0d9488]">₦{product.price.toLocaleString()}</span>
              {product.comparePrice && (
                <span className="text-xl text-[#94a3b8] line-through mb-1">₦{product.comparePrice.toLocaleString()}</span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package size={16} className={product.stock > 0 ? 'text-green-500' : 'text-red-400'} />
              <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h3 className="font-bold text-[#0f172a] mb-2 text-sm">Description</h3>
              <p className="text-[#64748b] text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* Qty + Buttons */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#0f172a]">Qty:</span>
                  <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-[#64748b] hover:text-[#0d9488] transition-colors"><span className="text-lg font-bold">−</span></button>
                    <span className="w-8 text-center font-bold text-[#0f172a]">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="text-[#64748b] hover:text-[#0d9488] transition-colors"><span className="text-lg font-bold">+</span></button>
                  </div>
                </div>
                <button onClick={handleAdd}
                  className="w-full py-4 bg-[#0d9488]/10 text-[#0d9488] rounded-2xl font-bold hover:bg-[#0d9488] hover:text-white transition-all flex items-center justify-center gap-2 text-base">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button onClick={handleBuyNow}
                  className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-bold hover:bg-[#1e293b] transition-colors text-base">
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <CartDrawer />
    </div>
  );
}
