import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Music, Palette, TrendingUp, Award, Users, Globe, Headphones, Sparkles, ImageIcon } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { useSEO } from '../hooks/useSEO';

const milestones = [
  { year: '2018', title: 'Started Music Career', desc: 'Released debut single "Rise Up" which gained 100K+ streams in the first month.' },
  { year: '2019', title: 'Founded Succeeder Designs', desc: 'Launched bespoke fashion brand specializing in premium African and contemporary wear.' },
  { year: '2020', title: 'Digital Marketing Certification', desc: 'Earned DMI Pro certification and began managing campaigns for major Nigerian brands.' },
  { year: '2021', title: 'First Major Concert', desc: 'Sold-out debut concert in Lagos with 5,000+ attendees.' },
  { year: '2023', title: 'Fashion Week Showcase', desc: 'Featured collection at Lagos Fashion Week, gaining international recognition.' },
  { year: '2024', title: '1M+ Streams Milestone', desc: 'Crossed 1 million combined streams across all platforms.' },
  { year: '2025', title: 'Brand Partnerships', desc: 'Signed strategic partnerships with 3 major international brands.' },
  { year: '2026', title: 'Daily Miracles Album', desc: 'Released highly anticipated album "Daily Miracles" to critical acclaim.' },
];

const SKILL_ICONS = [Music, Palette, TrendingUp, Headphones];
const SKILL_DEFAULTS = [
  { name: 'Music Production', level: '95%', desc: 'Vocal performance, songwriting, audio production' },
  { name: 'Fashion Design',   level: '98%', desc: 'Bespoke tailoring, collection design, styling' },
  { name: 'Digital Marketing',level: '96%', desc: 'Facebook Ads, SEO, brand strategy, analytics' },
  { name: 'Sound Engineering',level: '90%', desc: 'Mixing, mastering, studio production' },
];

const values = [
  { icon: Sparkles, title: 'Creativity',  desc: 'Pushing boundaries and reimagining what is possible across every medium.' },
  { icon: Award,    title: 'Excellence',  desc: 'Delivering nothing short of world-class quality in every project undertaken.' },
  { icon: Users,    title: 'Community',   desc: 'Building a global family of fans, clients, and collaborators.' },
  { icon: Globe,    title: 'Impact',      desc: 'Using talent and influence to inspire positive change worldwide.' },
];

export default function About() {
  const { content } = useSiteContent();
  useSEO({
    title: content.seo_about_title || 'About',
    description: content.seo_about_desc || 'Learn about Succeed Michael Lawani — his journey in gospel music, Succeeder Designs fashion brand, and digital marketing expertise.',
  });
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Portrait: about_portrait takes priority, fallback to hero_image, fallback to placeholder
  const portrait = content.about_portrait || content.hero_image || '';

  const bio1 = content.about_bio_1 ||
    'A multi-talented creative force born in Lagos, Nigeria, Succeed Michael Lawani has dedicated his life to mastering the arts of music, fashion, and digital marketing. His journey from a young dreamer to an internationally recognized creative entrepreneur is nothing short of inspirational.';
  const bio2 = content.about_bio_2 ||
    'With over 8 years of professional experience across multiple industries, Succeed has built a reputation for excellence, innovation, and an unwavering commitment to his craft. Whether he is in the studio creating soul-stirring music, designing bespoke fashion pieces, or crafting digital marketing strategies that drive results — he brings the same passion and precision to everything he touches.';

  const story1 = content.about_story_1 ||
    'Growing up in the vibrant city of Lagos, I was surrounded by creativity, resilience, and an unstoppable energy that shaped my worldview. From singing in church choirs to sketching designs in my school notebooks, I always knew that creating was not just something I did — it was who I was.';
  const story2 = content.about_story_2 ||
    'Every song I write carries a message of hope and faith. Every fashion piece I design celebrates the beauty of African heritage blended with modern sophistication. Every marketing strategy I craft is built to help brands tell their story authentically and effectively.';
  const story3 = content.about_story_3 ||
    'My mission is simple: to use every gift I have been blessed with to inspire, uplift, and make a lasting impact on the world. I believe that when we operate in our purpose, success is not just achieved — it becomes inevitable.';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[600px] h-[600px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[200px] -right-[100px]" />
        <div className="absolute w-[400px] h-[400px] bg-[rgba(6,182,212,0.06)] rounded-full -bottom-[100px] -left-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Award size={16} /> About The Artist
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f172a] leading-tight mb-6">
                The Story of <span className="text-[#0d9488]">Succeed</span> Michael Lawani
              </h1>
              <p className="text-[#64748b] text-lg leading-relaxed mb-6">{bio1}</p>
              <p className="text-[#64748b] leading-relaxed">{bio2}</p>
            </div>
            <div className="flex justify-center">
              {portrait ? (
                <img src={portrait} alt="Succeed Michael Lawani"
                  className="w-full max-w-md rounded-3xl shadow-2xl object-cover" loading="lazy" decoding="async" />
              ) : (
                <div className="w-full max-w-md rounded-3xl shadow-2xl bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center" style={{ minHeight: 400 }}>
                  <div className="text-center text-white/50 p-8">
                    <ImageIcon size={48} className="mx-auto mb-3 opacity-40" />
                    <p className="text-sm">Upload portrait in<br /><strong>Admin → Site Content → About Page</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="py-12 bg-[#0d9488]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: content.fans_count        || '50K+',   label: 'Fans Worldwide' },
              { value: content.streams_count     || '1M+',    label: 'Music Streams' },
              { value: content.campaigns_count   || '500+',   label: 'Campaigns Managed' },
              { value: content.designs_count     || '2,000+', label: 'Designs Created' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey Timeline ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">My <span className="text-[#0d9488]">Journey</span></h2>
            <p className="text-[#64748b] max-w-xl mx-auto">
              From humble beginnings in Lagos to stages and studios around the world — every step has shaped who I am today.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[#0d9488]/20 rounded-full" />
            {milestones.map((milestone, index) => (
              <div key={milestone.year}
                className={`relative flex items-center mb-12 last:mb-0 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <span className="inline-block bg-[#0d9488] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{milestone.year}</span>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-2">{milestone.title}</h3>
                    <p className="text-[#64748b] text-sm leading-relaxed">{milestone.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-[#0d9488] rounded-full border-4 border-white shadow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Skills ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Skills & <span className="text-[#0d9488]">Expertise</span></h2>
            <p className="text-[#64748b] max-w-xl mx-auto">Years of dedication have honed these abilities to world-class levels.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SKILL_DEFAULTS.map((defaults, i) => {
              const n = i + 1;
              const Icon = SKILL_ICONS[i];
              const name  = content[`skill_${n}_name`]  || defaults.name;
              const level = content[`skill_${n}_level`] || defaults.level;
              const desc  = content[`skill_${n}_desc`]  || defaults.desc;
              return (
                <div key={n}
                  className="bg-[#f8fafc] rounded-2xl p-6 hover:bg-[#0d9488] group transition-all duration-400 hover:-translate-y-2">
                  <div className="w-14 h-14 bg-[#0d9488] group-hover:bg-white rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
                    <Icon className="text-white group-hover:text-[#0d9488]" size={24} />
                  </div>
                  <h3 className="font-bold text-[#0f172a] group-hover:text-white text-lg mb-1 transition-colors">{name}</h3>
                  <div className="text-[#0d9488] group-hover:text-white/80 font-bold text-sm mb-2 transition-colors">{level}</div>
                  <p className="text-[#64748b] group-hover:text-white/70 text-sm transition-colors">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Core Values ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core <span className="text-[#14b8a6]">Values</span></h2>
            <p className="text-white/60 max-w-xl mx-auto">The principles that guide every decision, creation, and collaboration.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                <div className="w-14 h-14 bg-[#0d9488] rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personal Story ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-8">Why I <span className="text-[#0d9488]">Create</span></h2>
          <p className="text-[#64748b] text-lg leading-relaxed mb-6">{story1}</p>
          <p className="text-[#64748b] text-lg leading-relaxed mb-6">{story2}</p>
          <p className="text-[#64748b] text-lg leading-relaxed">{story3}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
