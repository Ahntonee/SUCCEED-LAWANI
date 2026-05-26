import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, ArrowRight, User, Tag, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'The Story Behind Daily Miracles: From Traffic Jam to Timeless Anthem',
    excerpt: 'How a moment of prayer in Lagos traffic inspired one of my most powerful songs yet. The journey from concept to creation was nothing short of divine.',
    content: `It was a rainy Tuesday evening in Lagos. I was stuck in the infamous Third Mainland Bridge traffic, frustration building with every passing minute. My phone was dead, the AC was struggling, and I had a meeting I was clearly going to miss.\n\nIn that moment of helplessness, I did something I had not done in a while — I prayed. Not a rushed blessing or a quick wish, but a genuine conversation with God. I asked for patience, for peace, and for the ability to see the miracles in everyday moments.\n\nAs the rain pattered against my windshield, the melody came to me. It started as a hum, then words began to form. "Every morning I wake up, I see Your daily miracles..." The traffic that had felt like a curse became a blessing — it gave me the stillness I needed to receive this gift.\n\nWhen I finally got home three hours later, I recorded a voice note that would become the foundation of "Daily Miracles." The song wrote itself over the next week, each verse flowing like a continuation of that prayer on the bridge.\n\nWorking with producer Salvage Beat, we crafted a sound that was both contemporary and timeless — something that could play in a church on Sunday morning or a playlist during a workout. The response has been overwhelming. Messages from people sharing their own "daily miracles" stories fill my DMs every day.\n\nThis song taught me that inspiration is everywhere. You just need to be still enough to hear it.`,
    image: '/images/album-daily-miracles.jpg',
    category: 'Music',
    author: 'Succeed Michael Lawani',
    date: 'May 10, 2026',
    readTime: '5 min read',
    tags: ['Music Production', 'Inspiration', 'Behind the Scenes'],
    featured: true,
  },
  {
    id: 2,
    title: 'Agbada: The Royal Attire Reimagined for the Modern Era',
    excerpt: 'Exploring how modern fashion designers are transforming traditional Agbada into contemporary statements of elegance and power.',
    content: `The Agbada has long been a symbol of prestige, power, and cultural pride in West Africa. Traditionally worn by royalty and dignitaries, this flowing wide-sleeved robe carries centuries of history in every stitch. But how does a garment so deeply rooted in tradition find its place in the modern fashion landscape?\n\nAt TheSucceedeer Designs, we believe that tradition and innovation are not opposites — they are dance partners. Our approach to the Agbada honors its regal heritage while embracing contemporary aesthetics. We experiment with lighter fabrics for the Nigerian climate, incorporate modern tailoring techniques for a more structured silhouette, and introduce subtle design elements that speak to a global audience.\n\nOne of our most popular designs, the "Executive Agbada," features a fitted inner layer paired with a flowing outer robe, creating a profile that is both commanding and comfortable. We have replaced the traditional heavy embroidery with laser-cut geometric patterns, reducing weight while maintaining visual impact.\n\nThe response from our clients has been incredible. Young professionals are wearing our Agbadas to corporate events. Grooms are choosing them for weddings. Even international clients have discovered the beauty of this garment through our online platform.\n\nThe Agbada is not just clothing — it is a statement. It says, "I honor where I come from, and I am confident in where I am going." That is a message that transcends culture and time.`,
    image: '/images/blog-fashion.jpg',
    category: 'Fashion',
    author: 'Succeed Michael Lawani',
    date: 'April 28, 2026',
    readTime: '6 min read',
    tags: ['Fashion Design', 'African Culture', 'Style Guide'],
    featured: false,
  },
  {
    id: 3,
    title: 'Facebook Ads in 2026: What Is Actually Working Right Now',
    excerpt: 'Latest strategies, algorithm updates, and creative approaches that are driving 5x ROAS for our clients in the current landscape.',
    content: `The digital marketing landscape is evolving faster than ever, and Facebook Ads (now Meta Ads) continues to be one of the most powerful tools in a marketer's arsenal — if you know how to use it.\n\nAfter managing over 500 campaigns and ₦500M+ in ad spend, here is what is actually working in 2026:\n\n1. AI-Powered Creative Optimization\nMeta's AI has become incredibly sophisticated at matching creative variations to different audience segments. We are now creating 10-15 variations of each ad (different hooks, visuals, CTAs) and letting the algorithm do the heavy lifting. The result? A 40% improvement in cost per acquisition.\n\n2. First-Party Data Strategies\nWith the continued phase-out of third-party cookies, first-party data has become gold. We are helping clients build robust email lists, SMS databases, and in-app engagement tracking. The campaigns leveraging first-party data are seeing 3x higher conversion rates.\n\n3. Video-First Creative\nShort-form video (15-30 seconds) is dominating. Not polished, cinematic ads — but authentic, raw, phone-shot content that feels native to the platform. The best performing ad we ran last month was shot on an iPhone in 10 minutes.\n\n4. Advantage+ Shopping Campaigns\nMeta's automated shopping campaigns have matured significantly. For e-commerce brands with 50+ products, ASC is delivering 25% better ROAS than manual campaigns. The key is feeding the algorithm high-quality product data.\n\n5. Community-Building Over Conversion\nThe most successful brands are using ads to build communities, not just drive sales. Lead with value — educational content, entertainment, inspiration — and let the conversions follow naturally.`,
    image: '/images/marketing-workspace.jpg',
    category: 'Marketing',
    author: 'Succeed Michael Lawani',
    date: 'April 15, 2026',
    readTime: '8 min read',
    tags: ['Facebook Ads', 'Digital Marketing', 'Growth Strategy'],
    featured: false,
  },
  {
    id: 4,
    title: 'From Sketch to Stage: My Creative Process Revealed',
    excerpt: 'An inside look at how I balance music, fashion, and marketing — and the creative rituals that keep me inspired.',
    content: `People often ask me how I manage to juggle three demanding careers simultaneously. The truth is, I do not see them as separate — they are different expressions of the same creative impulse.\n\nMy day starts at 5 AM with prayer and meditation. This quiet hour sets the tone for everything that follows. I believe creativity is a spiritual practice; you cannot pour from an empty cup.\n\nFrom 6 to 9 AM, I am in my design studio. The morning hours are when my visual creativity peaks. I sketch new designs, review fabric samples, and oversee ongoing projects. There is something magical about the morning light hitting the textiles — it sparks ideas that no amount of Pinterest scrolling could.\n\nLate morning through afternoon is music time. I head to the studio and work on whatever project is active — recording vocals, reviewing mixes, or writing new material. Music requires a different kind of energy; it is more emotional, more vulnerable. I find that doing it after the structured work of design actually helps me access that emotional space more easily.\n\nEvenings are for marketing strategy and client calls. This is when I switch to analytical mode — reviewing campaign data, brainstorming with clients, and planning strategies. The shift from creative to analytical work keeps my mind sharp and prevents burnout.\n\nThe secret? Each discipline refreshes me for the others. When music feels heavy, I turn to design. When design feels stagnant, I dive into data. It is a rhythm, not a race.`,
    image: '/images/blog-music.jpg',
    category: 'Lifestyle',
    author: 'Succeed Michael Lawani',
    date: 'March 30, 2026',
    readTime: '7 min read',
    tags: ['Creativity', 'Productivity', 'Personal Growth'],
    featured: false,
  },
  {
    id: 5,
    title: 'Building TheSucceedeer: Lessons from 5 Years in Fashion',
    excerpt: 'The highs, the lows, and the invaluable lessons learned while building a fashion brand from scratch in Nigeria.',
    content: `Five years ago, TheSucceedeer Designs was a dream sketched in a notebook. Today, it is a recognized brand with clients across three continents. The journey has been anything but smooth — and I would not have it any other way.\n\nLesson 1: Start Before You Are Ready\nI launched with three designs and a borrowed sewing machine. If I had waited for the "perfect" setup, I would still be waiting. Perfection is the enemy of progress. Start messy, start small, but start.\n\nLesson 2: Your First Customers Are Everything\nOur earliest clients were family and friends. They gave us honest feedback, referred others, and became our biggest advocates. Treat every early customer like a partner in your journey — because they are.\n\nLesson 3: Quality Is Non-Negotiable\nIn the fashion industry, one bad piece can destroy a reputation built over years. We have a zero-compromise policy on quality. Every stitch, every button, every hem is checked and double-checked. This commitment to excellence is why 70% of our business comes from repeat customers.\n\nLesson 4: Embrace Technology\nFrom 3D body scanning for perfect fits to AI-powered design tools, technology has transformed our workflow. We invested early in an e-commerce platform and social media marketing, which proved invaluable during the pandemic when physical stores were closed.\n\nLesson 5: Stay True to Your Vision\nThere were moments when trends tempted us away from our core aesthetic. We experimented, learned, and always returned to our foundation: celebrating African elegance with modern sophistication. Authenticity is your greatest competitive advantage.`,
    image: '/images/fashion-show.jpg',
    category: 'Fashion',
    author: 'Succeed Michael Lawani',
    date: 'March 12, 2026',
    readTime: '6 min read',
    tags: ['Entrepreneurship', 'Fashion Business', 'Growth'],
    featured: false,
  },
  {
    id: 6,
    title: 'The Power of Collaboration: My Most Meaningful Partnerships',
    excerpt: 'Why working with other talented creatives has been the catalyst for some of my best work across music, fashion, and beyond.',
    content: `If there is one thing I have learned in my creative journey, it is this: collaboration multiplies talent. Some of my most impactful projects have come from joining forces with other passionate, skilled individuals.\n\nThe Daily Miracles album is a perfect example. Working with producer Salvage Beat brought a sonic dimension I could never have achieved alone. His understanding of Afrobeats fusion and gospel created a soundscape that elevated my songwriting to new heights.\n\nIn fashion, collaborating with textile artisans in Kano and Aso-Oke weavers in Iseyin has deepened TheSucceedeer Designs' connection to authentic Nigerian craftsmanship. These partnerships do not just improve our products — they preserve cultural heritage and support local economies.\n\nOn the marketing front, partnering with brands like TechPoint Africa and BellaNaija has expanded our reach exponentially. Cross-promotion with complementary brands (not competitors) creates win-win scenarios that no amount of ad spend can replicate.\n\nMy advice to every creative: find your tribe. Seek out people who challenge you, complement your skills, and share your values. The magic happens at the intersection of different perspectives. Build a network before you need it, give more than you take, and always deliver on your promises. Collaboration is not just a strategy — it is a mindset.`,
    image: '/images/hero-portrait.jpg',
    category: 'Music',
    author: 'Succeed Michael Lawani',
    date: 'February 20, 2026',
    readTime: '5 min read',
    tags: ['Collaboration', 'Networking', 'Creative Growth'],
    featured: false,
  },
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', 'Music', 'Fashion', 'Marketing', 'Lifestyle'];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((p) => p.featured);
  const regularPosts = filteredPosts.filter((p) => !p.featured || activeCategory !== 'All');

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
