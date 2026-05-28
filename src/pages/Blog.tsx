import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, ArrowRight, User, Tag, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { api } from '../lib/api';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    api.getPublicPosts().then(setPosts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['All', 'Music', 'Fashion', 'Marketing', 'Lifestyle'];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured || activeCategory !== 'All' || !!searchQuery);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[150px] -right-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Tag size={16} /> Insights & Stories
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6">
              The <span className="text-[#0d9488]">Blog</span>
            </h1>
            <p className="text-[#64748b] text-lg mb-8">
              Thoughts on music, fashion, digital marketing, and the creative journey. Raw, real, and made to inspire.
            </p>
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" size={18} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-[72px] z-40">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#0d9488] text-white shadow-lg shadow-[#0d9488]/20'
                    : 'bg-[#f8fafc] text-[#64748b] hover:bg-[#0d9488]/10 hover:text-[#0d9488]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && activeCategory === 'All' && !searchQuery && (
        <section className="py-12 bg-white">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="bg-[#f8fafc] rounded-3xl overflow-hidden">
              <div className="grid md:grid-cols-2">
                <div className="h-64 md:h-auto">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#0d9488] text-white text-xs font-bold px-3 py-1 rounded-full">
                      Featured
                    </span>
                    <span className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold px-3 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-4 hover:text-[#0d9488] transition-colors cursor-pointer" onClick={() => setSelectedPost(featuredPost)}>
                    {featuredPost.title}
                  </h2>
                  <p className="text-[#64748b] mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-[#64748b] mb-6">
                    <span className="flex items-center gap-1"><User size={14} /> {featuredPost.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {featuredPost.date}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {featuredPost.readTime}</span>
                  </div>
                  <button
                    onClick={() => setSelectedPost(featuredPost)}
                    className="inline-flex items-center gap-2 text-[#0d9488] font-semibold hover:gap-3 transition-all self-start"
                  >
                    Read Full Story <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-12 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-4 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
            </div>
          )}
          {!loading && regularPosts.length === 0 && (
            <div className="text-center py-20 text-[#64748b]">No posts found.</div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3
                    className="text-lg font-bold text-[#0f172a] mb-2 group-hover:text-[#0d9488] transition-colors cursor-pointer line-clamp-2"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.title}
                  </h3>
                  <p className="text-[#64748b] text-sm mb-4 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-[#64748b]">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Article Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#0f172a] leading-tight">
              {selectedPost?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="mt-4">
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-[#64748b]">
                <span className="flex items-center gap-1"><User size={14} /> {selectedPost.author}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {selectedPost.date}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {selectedPost.readTime}</span>
                <span className="bg-[#0d9488]/10 text-[#0d9488] font-semibold px-2 py-0.5 rounded-full text-xs">{selectedPost.category}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedPost.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
              <div className="text-[#64748b] leading-relaxed whitespace-pre-line">
                {selectedPost.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
