import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { Menu, X, Heart } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';

const navLinks = [
  { name: 'Home',      path: '/'        },
  { name: 'About Me',  path: '/about'   },
  { name: 'Events',    path: '/events'  },
  { name: 'Blog',      path: '/blog'    },
  { name: 'Music',     path: '/music'   },
  { name: 'Shop',      path: '/shop'    },
  { name: 'Contact Me',path: '/contact' },
];

export default function Navbar() {
  const content = useSiteContent();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const donateUrl  = content.donate_url  || '';
  const donateText = content.donate_text || 'Donate';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)]'
        : 'bg-white/95 backdrop-blur-xl border-b border-[rgba(13,148,136,0.1)]'
    }`}>
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0d9488] rounded-xl flex items-center justify-center relative overflow-hidden">
            <div className="absolute w-5 h-5 bg-white/30 rounded-full top-1 right-1" />
            <span className="text-white font-extrabold text-xl relative z-10">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#0f172a] leading-none">Succeed</span>
            <span className="text-[0.65rem] text-[#64748b] tracking-[2px] uppercase mt-0.5">Michael Lawani</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 items-center list-none">
          {navLinks.map((link) =>
            link.name === 'Contact Me' ? (
              <li key={link.name}>
                <Link to={link.path}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(13,148,136,0.3)] ${
                    isActive(link.path)
                      ? 'bg-[#0f766e] text-white'
                      : 'bg-[#0d9488] text-white hover:bg-[#0f766e] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(13,148,136,0.4)]'
                  }`}>
                  {link.name}
                </Link>
              </li>
            ) : (
              <li key={link.name}>
                <Link to={link.path}
                  className={`relative font-medium text-[0.95rem] transition-colors duration-300 ${
                    isActive(link.path) ? 'text-[#0d9488]' : 'text-[#0f172a] hover:text-[#0d9488]'
                  }`}>
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#0d9488] transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 hover:w-full'}`} />
                </Link>
              </li>
            )
          )}

          {/* Donate — only shown when donate_url is configured */}
          {donateUrl && (
            <li>
              <a href={donateUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 hover:-translate-y-0.5 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.3)]">
                <Heart size={14} className="fill-white" /> {donateText}
              </a>
            </li>
          )}
        </ul>

        {/* Mobile toggle */}
        <button className="md:hidden text-[#0d9488] text-2xl" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link to={link.path}
                  className={`block py-2 font-medium transition-colors ${isActive(link.path) ? 'text-[#0d9488]' : 'text-[#0f172a]'}`}
                  onClick={() => setMobileOpen(false)}>
                  {link.name}
                </Link>
              </li>
            ))}
            {donateUrl && (
              <li>
                <a href={donateUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-amber-500 font-semibold"
                  onClick={() => setMobileOpen(false)}>
                  <Heart size={16} className="fill-amber-500" /> {donateText}
                </a>
              </li>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
}
