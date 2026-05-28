import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Mail, Calendar, FileText, Music, Users, Shirt, ArrowRight, Clock } from 'lucide-react';
import { api } from '../../lib/api';

interface Stats {
  contacts: number;
  unreadContacts: number;
  upcomingEvents: number;
  blogPosts: number;
  tracks: number;
  subscribers: number;
  fashionInquiries: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentContacts, setRecentContacts] = useState<Record<string, string>[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    Promise.all([
      api.getContacts(),
      api.getEvents('upcoming'),
      api.getBlogPosts(),
      api.getTracks(),
      api.getSubscribers(),
      api.getFashionInquiries(),
    ]).then(([contacts, events, posts, tracks, subs, fashion]) => {
      setStats({
        contacts: contacts.length,
        unreadContacts: contacts.filter((c: Record<string, string>) => c.status === 'unread').length,
        upcomingEvents: events.length,
        blogPosts: posts.length,
        tracks: tracks.length,
        subscribers: subs.length,
        fashionInquiries: fashion.filter((f: Record<string, string>) => f.status === 'new').length,
      });
      setRecentContacts(contacts.slice(0, 5));
      setUpcomingEvents(events.slice(0, 3));
    }).catch(console.error);
  }, []);

  const statCards = [
    { label: 'Unread Messages', value: stats?.unreadContacts ?? '—', icon: Mail, color: 'bg-[#0d9488]', link: '/admin/contacts' },
    { label: 'Upcoming Events', value: stats?.upcomingEvents ?? '—', icon: Calendar, color: 'bg-[#0f172a]', link: '/admin/events' },
    { label: 'Blog Posts', value: stats?.blogPosts ?? '—', icon: FileText, color: 'bg-[#0d9488]', link: '/admin/blog' },
    { label: 'Music Tracks', value: stats?.tracks ?? '—', icon: Music, color: 'bg-[#0f172a]', link: '/admin/music' },
    { label: 'Subscribers', value: stats?.subscribers ?? '—', icon: Users, color: 'bg-[#0d9488]', link: '/admin/subscribers' },
    { label: 'Fashion Inquiries', value: stats?.fashionInquiries ?? '—', icon: Shirt, color: 'bg-[#0f172a]', link: '/admin/fashion' },
  ];

  const inquiryColors: Record<string, string> = {
    music: 'bg-[#0d9488]/10 text-[#0d9488]',
    fashion: 'bg-purple-100 text-purple-700',
    marketing: 'bg-blue-100 text-blue-700',
    events: 'bg-orange-100 text-orange-700',
    media: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-[#0f172a]">Welcome back 👋</h2>
        <p className="text-[#64748b] text-sm mt-1">Here is what is happening with your brand today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="text-white" size={20} />
            </div>
            <div className="text-2xl font-bold text-[#0f172a]">{card.value}</div>
            <div className="text-[#64748b] text-sm mt-0.5">{card.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a]">Recent Messages</h3>
            <Link to="/admin/contacts" className="text-[#0d9488] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentContacts.length === 0 ? (
              <p className="text-[#64748b] text-sm px-6 py-8 text-center">No messages yet</p>
            ) : recentContacts.map((c) => (
              <div key={c.id} className="px-6 py-4 flex items-start gap-3">
                <div className="w-9 h-9 bg-[#0d9488]/10 rounded-full flex items-center justify-center flex-shrink-0 text-[#0d9488] font-bold text-sm">
                  {String(c.name).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#0f172a] truncate">{c.name}</span>
                    {c.status === 'unread' && <span className="w-2 h-2 bg-[#0d9488] rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-[#64748b] text-xs truncate">{c.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${inquiryColors[c.inquiryType] || inquiryColors.other}`}>
                    {c.inquiryType}
                  </span>
                </div>
                <div className="text-[#64748b] text-xs flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} />
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-[#0f172a]">Upcoming Events</h3>
            <Link to="/admin/events" className="text-[#0d9488] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 ? (
              <p className="text-[#64748b] text-sm px-6 py-8 text-center">No upcoming events</p>
            ) : upcomingEvents.map((e) => (
              <div key={e.id} className="px-6 py-4 flex items-center gap-4">
                <div className="bg-[#0d9488] text-white rounded-xl px-3 py-2 text-center min-w-[56px]">
                  <div className="text-lg font-extrabold leading-none">{e.day}</div>
                  <div className="text-xs opacity-80">{e.month}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#0f172a] truncate">{e.title}</div>
                  <div className="text-[#64748b] text-xs">{e.location} · {e.time}</div>
                  <div className="text-[#0d9488] text-xs font-semibold">{e.price}</div>
                </div>
                <span className="bg-[#0d9488]/10 text-[#0d9488] text-xs font-bold px-2 py-1 rounded-full">
                  {e.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
