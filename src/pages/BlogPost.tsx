import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';
import { trackEvent } from '../lib/analytics';

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

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title: post?.title,
    description: post?.excerpt,
    image: post?.image,
    type: 'article',
    article: { publishedTime: post?.date, author: post?.author, tags: post?.tags },
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    const postId = Number(id);
    if (isNaN(postId)) { setNotFound(true); setLoading(false); return; }

    api.getPublicPost(postId)
      .then((p: BlogPost) => {
        setPost(p);
        api.recordPostView(postId).catch(() => {});
        // Load related posts from same category
        return api.getPublicPosts({ category: p.category, limit: '4' });
      })
      .then((all: BlogPost[]) => {
        setRelated(all.filter((r) => r.id !== postId).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-[#0f172a]">Post not found</h1>
          <Link to="/blog" className="text-[#0d9488] font-semibold hover:underline flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero image */}
      <div className="pt-20 bg-[#f8fafc]">
        <div className="max-w-[860px] mx-auto px-6 pt-10 pb-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#64748b] mb-6">
            <Link to="/blog" className="hover:text-[#0d9488] transition-colors flex items-center gap-1">
              <ArrowLeft size={14} /> Blog
            </Link>
            <span>/</span>
            <span className="text-[#0d9488] font-medium">{post.category}</span>
          </div>

          {/* Category + Title */}
          <div className="mb-4">
            <button
              onClick={() => navigate(`/blog?category=${encodeURIComponent(post.category)}`)}
              className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold px-3 py-1 rounded-full hover:bg-[#0d9488]/20 transition-colors mb-4 inline-block"
            >
              {post.category}
            </button>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] leading-tight">
              {post.title}
            </h1>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748b] mb-6">
            <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {post.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {post.readTime}</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
        {post.image && (
          <div className="max-w-[860px] mx-auto px-6 pb-0">
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-[480px] object-cover rounded-2xl shadow-lg"
              loading="lazy" decoding="async"
            />
          </div>
        )}
      </div>

      {/* Article body */}
      <article className="max-w-[860px] mx-auto px-6 py-12">
        <p className="text-[#475569] text-lg leading-relaxed font-medium mb-8 border-l-4 border-[#0d9488] pl-4">
          {post.excerpt}
        </p>
        <div className="prose-custom text-[#334155] leading-relaxed whitespace-pre-line text-base">
          {post.content}
        </div>
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-[#f8fafc] py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-8">
              More in <span className="text-[#0d9488]">{post.category}</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/blog/${r.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                >
                  {r.image && (
                    <div className="h-44 overflow-hidden">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy" decoding="async"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[#0d9488] text-xs font-bold">{r.category}</span>
                    <h3 className="font-bold text-[#0f172a] mt-1 mb-2 group-hover:text-[#0d9488] transition-colors line-clamp-2">
                      {r.title}
                    </h3>
                    <p className="text-[#64748b] text-sm line-clamp-2">{r.excerpt}</p>
                    <div className="flex items-center gap-1 mt-3 text-[#0d9488] text-sm font-semibold">
                      Read more <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Share + back */}
      <div className="max-w-[860px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#0d9488] font-semibold hover:gap-3 transition-all">
          <ArrowLeft size={16} /> All Posts
        </Link>
        {post && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#64748b] flex items-center gap-1.5"><Share2 size={14} /> Share:</span>
            {[
              {
                label: 'WhatsApp',
                color: 'bg-[#25D366]',
                href: `https://wa.me/?text=${encodeURIComponent(`${post.title} — ${window.location.href}`)}`,
              },
              {
                label: 'Facebook',
                color: 'bg-[#1877F2]',
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
              },
              {
                label: 'X',
                color: 'bg-[#000]',
                href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('blog_share', { platform: s.label, post_id: post.id })}
                className={`${s.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}>
                {s.label}
              </a>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
