import { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import DonateModal from '../components/DonateModal';
import { Link } from 'react-router';
import { Play, Pause, SkipForward, SkipBack, Music, Images, Calendar, ArrowRight, Heart, Phone, Send, Mail, MapPin, Briefcase, Download, Youtube, X } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useSiteContent } from '../context/SiteContentContext';
import { useAudioPlayer, formatTime, downloadTrack } from '../hooks/useAudioPlayer';
import { useSEO } from '../hooks/useSEO';
import EmailCaptureCTA from '../components/EmailCaptureCTA';

const services = [
  { icon: Music,      title: 'Music',             desc: 'Creating inspirational and soulful music that resonates with hearts across the globe. From Daily Miracles to Philistine.', link: '/music' },
  { icon: Images,     title: 'Gallery',            desc: 'A curated visual gallery of photos and videos capturing creative moments, events, and milestones.',                          link: '/gallery' },
  { icon: Calendar,   title: 'Events & Booking',   desc: 'Available for performances, speaking engagements, and creative consultations worldwide.',                                    link: '/events' },
];

interface HomeTrack { id: number; title: string; cover: string; audioUrl: string; }
interface HomeEvent { day: string; month: string; title: string; description: string; location: string; time: string; }
interface HomeBlogPost { id: number; image: string; category: string; title: string; excerpt: string; }
interface HomeGalleryItem { id: number; type: string; url: string; caption: string; }

export default function Home() {
  const { content } = useSiteContent();
  useSEO({
    title: content.seo_home_title || undefined,
    description: content.seo_home_desc || 'Official website of Succeed Michael Lawani — gospel artist, visual creator, and digital marketing expert based in Lagos, Nigeria.',
  });
  const [musicTracks, setMusicTracks] = useState<HomeTrack[]>([]);
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [blogPosts, setBlogPosts] = useState<HomeBlogPost[]>([]);
  const [galleryItems, setGalleryItems] = useState<HomeGalleryItem[]>([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [spotifyModal, setSpotifyModal] = useState<{ url: string; title: string } | null>(null);

  const tracksRef = useRef<HomeTrack[]>([]);
  useEffect(() => { tracksRef.current = musicTracks; }, [musicTracks]);

  // Auto-advance to next track when current one ends
  const handleAutoNext = useCallback(() => {
    setCurrentTrack((prev) => {
      const list = tracksRef.current;
      return list.length ? (prev + 1) % list.length : prev;
    });
  }, []);

  const { progress, currentTime, duration: audioDuration, audioRef, seek, resetProgress } = useAudioPlayer(
    handleAutoNext,
    () => setIsPlaying(false),
  );

  // ── Fetch data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
    api.getTracks().then((data: HomeTrack[]) => setMusicTracks(data.slice(0, 3))).catch(console.error);
    api.getEvents('upcoming').then((data: HomeEvent[]) => setEvents(data.slice(0, 4))).catch(console.error);
    api.getPublicPosts().then((data: HomeBlogPost[]) => setBlogPosts(data.slice(0, 3))).catch(console.error);
    api.getGallery().then((data: HomeGalleryItem[]) => setGalleryItems(data.slice(0, 6))).catch(console.error);
  }, []);

  // Update src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = tracksRef.current[currentTrack];
    if (!track) return;
    resetProgress();
    if (track.audioUrl) {
      audio.src = track.audioUrl;
      audio.load();
      if (isPlaying) audio.play().catch(console.error);
    } else {
      audio.src = '';
    }
  }, [currentTrack]); // eslint-disable-line react-hooks/exhaustive-deps

  // Play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying && audio.src) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying]);

  const handlePrev = () => {
    const list = tracksRef.current;
    if (!list.length) return;
    setCurrentTrack((prev) => (prev - 1 + list.length) % list.length);
  };
  const handleNext = () => {
    const list = tracksRef.current;
    if (!list.length) return;
    setCurrentTrack((prev) => (prev + 1) % list.length);
  };

  const handleDownload = (track: HomeTrack) => downloadTrack(track.audioUrl, track.title);

  const getSpotifyEmbedUrl = (url: string): string | null => {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return `https://open.spotify.com/embed/track/${match[1]}?utm_source=generator&theme=0`;
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = Object.fromEntries(new FormData(form).entries());
    setContactSending(true);
    try {
      await api.submitContact(data);
      toast.success('Thank you for reaching out! Succeed will get back to you within 24 hours.');
      form.reset();
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setContactSending(false);
    }
  };

  // ── Dynamic content helpers ─────────────────────────────────────────────────
  const heroImage    = content.hero_image  || '';
  const donateUrl    = content.donate_url  || '';
  const donateText   = content.donate_text       || 'Support My Music';

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden pt-20">
        <div className="absolute w-[600px] h-[600px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[200px] -right-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute w-[400px] h-[400px] bg-[rgba(6,182,212,0.06)] rounded-full -bottom-[100px] -left-[100px] animate-pulse" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f172a] leading-tight mb-6">
              {content.hero_headline || 'Exceptional Talent,'}<br />
              <span className="text-[#0d9488]">Every Time</span>
            </h1>
            <p className="text-[#64748b] text-lg leading-relaxed mb-8 max-w-lg">
              {content.hero_subtext || 'Succeed Michael Lawani is a multi-talented creative force — a passionate musician, visual artist, and a results-driven digital marketing expert.'}
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/music" className="inline-flex items-center gap-2 bg-[#0d9488] text-white px-6 py-3.5 rounded-full font-semibold hover:bg-[#0f766e] hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)]">
                <Play size={18} /> Listen Now
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-[#0f172a] px-6 py-3.5 rounded-full font-semibold border-2 border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488] hover:-translate-y-0.5 transition-all">
                <Heart size={18} /> Get In Touch
              </Link>
              {donateUrl && (
                <button
                  onClick={() => setDonateOpen(true)}
                  className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3.5 rounded-full font-semibold hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.3)]">
                  <Heart size={18} className="fill-white" /> {donateText}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-[#0d9488] flex items-center justify-center text-white text-xs font-bold">
                    {i === 1 ? 'SM' : i === 2 ? 'TL' : 'JD'}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="font-bold text-[#0f172a]">{content.fans_count || '50K+'}</span>{' '}
                <span className="text-[#64748b]">Fans Worldwide</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center relative">
            {heroImage ? (
              <img src={heroImage} alt="Succeed Michael Lawani" className="w-full max-w-md rounded-3xl shadow-2xl object-cover" fetchPriority="high" decoding="async" />
            ) : (
              <div className="w-full max-w-md rounded-3xl shadow-2xl bg-gradient-to-br from-[#0d9488] to-[#0f172a] flex items-center justify-center" style={{ minHeight: 400 }}>
                <div className="text-center text-white/60 p-8">
                  <Music size={48} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Upload hero portrait in<br /><strong>Admin → Site Content → Media &amp; Images</strong></p>
                </div>
              </div>
            )}
            {/* Floating cards */}
            <div className="absolute top-[10%] -left-4 bg-white rounded-2xl p-4 shadow-xl max-w-[180px] animate-bounce" style={{ animationDuration: '4s' }}>
              <h4 className="text-sm font-bold text-[#0f172a] mb-1">Latest Release</h4>
              <p className="text-xs text-[#64748b]">Daily Miracles out now!</p>
              <div className="flex -space-x-2 mt-2">
                {musicTracks.map((t, i) => (
                  <img key={i} src={t.cover} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" loading="lazy" decoding="async" />
                ))}
              </div>
            </div>
            <div className="absolute bottom-[15%] -right-4 bg-white rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="w-10 h-10 bg-[#0d9488] rounded-xl flex items-center justify-center text-white">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Book a Call</h4>
                <p className="text-xs text-[#64748b]">{content.phone || '+234 813 478 1588'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#0d9488] relative overflow-hidden">
        <div className="absolute w-[300px] h-[300px] bg-white/5 rounded-full -top-[100px] -left-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Easily Explore My World</h2>
            <p className="text-white/80 max-w-xl mx-auto">
              From soul-stirring music to visual storytelling and cutting-edge digital marketing — discover the many dimensions of Succeed Michael Lawani.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <Link key={service.title} to={service.link}
                className={`rounded-2xl p-6 transition-all duration-400 hover:-translate-y-2 group ${i === 1 ? 'bg-white text-[#0f172a]' : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto ${i === 1 ? 'bg-[#0d9488] text-white' : 'bg-white/20 text-white'}`}>
                  <service.icon size={28} />
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${i === 1 ? 'text-[#0f172a]' : 'text-white'}`}>{service.title}</h3>
                <p className={`text-sm text-center leading-relaxed ${i === 1 ? 'text-[#64748b]' : 'text-white/80'}`}>{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Music ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">My <span className="text-[#0d9488]">Music</span></h2>
            <p className="text-[#64748b]">Stream and download my latest tracks. Experience the sound of inspiration.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {musicTracks.map((track, index) => (
              <div key={track.id} className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                <div className="relative overflow-hidden h-72">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-[#0d9488]/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setCurrentTrack(index); setIsPlaying(currentTrack === index ? !isPlaying : true); }}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#0d9488] hover:scale-110 transition-transform"
                    >
                      {currentTrack === index && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                  </div>
                  {currentTrack === index && isPlaying && (
                    <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">{track.title}</h3>
                  <div className="flex gap-3">
                    {track.audioUrl && track.audioUrl.includes('spotify.com/track/') ? (
                      <button
                        onClick={() => setSpotifyModal({ url: track.audioUrl, title: track.title })}
                        className="flex-1 bg-[#1DB954] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1aa34a] transition-colors flex items-center justify-center gap-1">
                        <Play size={14} /> Listen
                      </button>
                    ) : (
                      <button
                        onClick={() => { setCurrentTrack(index); setIsPlaying(currentTrack === index ? !isPlaying : true); }}
                        disabled={!track.audioUrl}
                        className="flex-1 bg-[#0d9488] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentTrack === index && isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Listen</>}
                      </button>
                    )}
                    {!track.audioUrl?.includes('spotify.com/track/') && (
                      <button
                        onClick={() => handleDownload(track)}
                        disabled={!track.audioUrl}
                        className="flex-1 bg-[#f8fafc] text-[#0f172a] py-2.5 rounded-xl font-semibold text-sm border-2 border-gray-200 hover:border-[#0d9488] hover:text-[#0d9488] transition-colors flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download size={14} /> Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/music" className="inline-flex items-center gap-2 text-[#0d9488] font-semibold hover:gap-3 transition-all">
              View Full Discography <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              Photo &amp; Video <span className="text-[#0d9488]">Gallery</span>
            </h2>
            <p className="text-[#64748b]">A curated collection of moments, performances, and creative works.</p>
          </div>
          {galleryItems.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {galleryItems.map((item) => {
                const thumb = item.type === 'video'
                  ? (() => {
                      const shorts = item.url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{1,12})/);
                      if (shorts) return `https://img.youtube.com/vi/${shorts[1]}/mqdefault.jpg`;
                      const std = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{1,12})/);
                      return std ? `https://img.youtube.com/vi/${std[1]}/mqdefault.jpg` : null;
                    })()
                  : item.url;
                return (
                  <Link key={item.id} to="/gallery" className="block break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative">
                    {thumb ? (
                      <img src={thumb} alt={item.caption || ''} className="w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-[#0d9488]/10 to-[#0d9488]/5 flex items-center justify-center">
                        <Images size={32} className="text-[#0d9488]/40" />
                      </div>
                    )}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <Youtube size={18} className="text-red-500" />
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl bg-[#f8fafc] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-20 text-center">
              <Images size={48} className="text-[#0d9488]/30 mb-4" />
              <p className="text-[#64748b] text-sm">No gallery items yet — add photos and videos in <strong>Admin → Gallery</strong>.</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/gallery" className="inline-flex items-center gap-2 text-[#0d9488] font-semibold hover:gap-3 transition-all">
              View Full Gallery <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>


      {/* ── Events ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              Upcoming <span className="text-[#0d9488]">Events</span>
            </h2>
            <p className="text-[#64748b]">Join me at these exclusive events. Performances, masterclasses, and speaking engagements.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <div key={event.title} className="bg-white rounded-3xl overflow-hidden flex shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="bg-[#0d9488] text-white p-6 flex flex-col items-center justify-center min-w-[100px]">
                  <div className="text-3xl font-extrabold leading-none">{event.day}</div>
                  <div className="text-xs uppercase tracking-wider mt-1 opacity-80">{event.month}</div>
                </div>
                <div className="p-6 flex-1">
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2 group-hover:text-[#0d9488] transition-colors">{event.title}</h3>
                  <p className="text-[#64748b] text-sm mb-3">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[#64748b]">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-[#0d9488]" /> {event.location}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-[#0d9488]" /> {event.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/events" className="inline-flex items-center gap-2 text-[#0d9488] font-semibold hover:gap-3 transition-all">
              View All Events <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Blog ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              Latest <span className="text-[#0d9488]">Blog</span>
            </h2>
            <p className="text-[#64748b]">Insights on music, digital marketing, faith, and personal growth.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="bg-[#f8fafc] rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group block">
                <div className="h-56 overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                </div>
                <div className="p-6">
                  <span className="inline-block bg-[#0d9488] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">{post.category}</span>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2 group-hover:text-[#0d9488] transition-colors">{post.title}</h3>
                  <p className="text-[#64748b] text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <span className="text-[#0d9488] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">Get In <span className="text-[#0d9488]">Touch</span></h2>
              <p className="text-[#64748b] leading-relaxed mb-8">
                Ready to collaborate? Whether it is music production, digital marketing strategy, or anything creative — let us create something extraordinary together.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: Phone,    label: 'Phone',    value: content.phone         || '+234 813 478 1588' },
                  { icon: Mail,     label: 'Email',    value: content.email         || 'hello@succeedlawani.com' },
                  { icon: MapPin,   label: 'Location', value: content.location      || 'Lagos, Nigeria' },
                  { icon: Briefcase,label: 'Business', value: content.business_name || 'Succeeder Designs & Digital Agency' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0d9488] rounded-xl flex items-center justify-center text-white">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0f172a] text-sm">{item.label}</h4>
                      <p className="text-[#64748b] text-sm">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-2">Your Name</label>
                  <input name="name" type="text" required placeholder="Enter your name" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-2">Email Address</label>
                  <input name="email" type="email" required placeholder="Enter your email" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-2">Subject</label>
                  <input name="subject" type="text" required placeholder="Music / Gallery / Marketing / Other" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-2">Message</label>
                  <textarea name="message" required rows={4} placeholder="Tell me about your project..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all resize-none" />
                </div>
                <button type="submit" disabled={contactSending} className="w-full bg-[#0d9488] text-white py-3 rounded-xl font-semibold hover:bg-[#0f766e] transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                  {contactSending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating Audio Player ───────────────────────────────────────────── */}
      {isPlaying && musicTracks.length > 0 && musicTracks[currentTrack] && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 p-4">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <img src={musicTracks[currentTrack].cover} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[#0f172a] text-sm truncate">{musicTracks[currentTrack].title}</h4>
              <p className="text-[#64748b] text-xs">Succeed Michael Lawani</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 cursor-pointer" onClick={seek}>
                <div className="h-full bg-[#0d9488] rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#64748b] mt-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="text-[#0f172a] hover:text-[#0d9488] transition-colors"><SkipBack size={20} /></button>
              <button onClick={() => setIsPlaying(false)} className="w-10 h-10 bg-[#0d9488] text-white rounded-full flex items-center justify-center hover:bg-[#0f766e] transition-colors">
                <Pause size={18} />
              </button>
              <button onClick={handleNext} className="text-[#0f172a] hover:text-[#0d9488] transition-colors"><SkipForward size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Email capture CTA */}
      <EmailCaptureCTA />

      <Footer />
      {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}

      {spotifyModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSpotifyModal(null)}>
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="text-xs text-[#64748b] mb-0.5">Now Playing</p>
                <h3 className="font-bold text-[#0f172a] text-sm">{spotifyModal.title}</h3>
              </div>
              <button onClick={() => setSpotifyModal(null)} className="text-[#64748b] hover:text-[#0f172a] transition-colors">
                <X size={20} />
              </button>
            </div>
            <iframe
              src={getSpotifyEmbedUrl(spotifyModal.url)!}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={spotifyModal.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
