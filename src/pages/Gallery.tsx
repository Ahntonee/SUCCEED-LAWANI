import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Images, Play } from 'lucide-react';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { useSiteContent } from '../context/SiteContentContext';

interface GalleryItem {
  id: number;
  type: string;
  url: string;
  caption: string;
  order: number;
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{1,12})/);
  if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
  const standard = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{1,12})/);
  if (standard) return `https://www.youtube.com/embed/${standard[1]}`;
  return null;
}

export default function Gallery() {
  const { content } = useSiteContent();
  useSEO({
    title: content.seo_gallery_title || 'Gallery',
    description: content.seo_gallery_desc || 'Browse photos and videos from Succeed Michael Lawani — moments from performances, studio sessions, and events.',
  });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getGallery().then((data) => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[150px] -right-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Images size={16} /> Gallery
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-4">
            Photos & <span className="text-[#0d9488]">Videos</span>
          </h1>
          <p className="text-[#64748b] text-lg max-w-xl mx-auto">
            Behind-the-scenes moments, performances, studio sessions, and more.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-[72px] z-10">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-3">
          {(['all', 'image', 'video'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === tab
                  ? 'bg-[#0d9488] text-white shadow-[0_4px_15px_rgba(13,148,136,0.3)]'
                  : 'bg-[#f8fafc] text-[#64748b] hover:text-[#0d9488] border border-gray-200'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'image' ? 'Photos' : 'Videos'}
            </button>
          ))}
          <span className="ml-auto text-sm text-[#64748b]">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Images size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-[#64748b]">No items yet. Check back soon!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
              {filtered.map((item) => {
                if (item.type === 'video') {
                  const embedUrl = getYouTubeEmbedUrl(item.url);
                  if (!embedUrl) return null;
                  return (
                    <div key={item.id} className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={embedUrl}
                          title={item.caption || 'Video'}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {item.caption && (
                        <div className="px-4 py-3">
                          <p className="text-sm text-[#64748b] font-medium">{item.caption}</p>
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => setLightbox(item)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.caption || 'Gallery photo'}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-[#0d9488]/0 group-hover:bg-[#0d9488]/20 transition-all duration-300 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100">
                          <Play size={18} className="text-[#0d9488] ml-0.5" />
                        </div>
                      </div>
                    </div>
                    {item.caption && (
                      <div className="px-4 py-3">
                        <p className="text-sm text-[#64748b] font-medium">{item.caption}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && lightbox.type === 'image' && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl font-light"
            >
              ✕
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.caption || ''}
              className="w-full max-h-[85vh] object-contain rounded-xl"
            />
            {lightbox.caption && (
              <p className="text-white/80 text-sm text-center mt-4">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
