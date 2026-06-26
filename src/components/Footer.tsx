import { useState } from 'react';
import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Heart } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import DonateModal from './DonateModal';

const quickLinks = [
  { name: 'About Me',   path: '/about'   },
  { name: 'Music',      path: '/music'   },
  { name: 'Shop',       path: '/shop'    },
  { name: 'Events',     path: '/events'  },
  { name: 'Blog',       path: '/blog'    },
  { name: 'Contact',    path: '/contact' },
];

const services = [
  'Music Production',
  'Bespoke Tailoring',
  'Facebook Ads',
  'DMI Training',
  'Brand Optimization',
];

export default function Footer() {
  const { content } = useSiteContent();
  const [donateOpen, setDonateOpen] = useState(false);

  const socialLinks = [
    { icon: Facebook, href: content.facebook_url,  label: 'Facebook'  },
    { icon: Instagram, href: content.instagram_url, label: 'Instagram' },
    { icon: Twitter,   href: content.twitter_url,   label: 'Twitter'   },
    { icon: Youtube,   href: content.youtube_url,   label: 'YouTube'   },
    { icon: Linkedin,  href: content.linkedin_url,  label: 'LinkedIn'  },
  ].filter((s) => s.href && s.href.trim() !== '');

  const donateUrl  = content.donate_url  || '';
  const donateText = content.donate_text || 'Support My Music';
  const phone      = content.phone       || '+234 813 478 1588';
  const email      = content.email       || 'hello@succeedlawani.com';
  const location   = content.location    || 'Lagos, Nigeria';
  const business   = content.business_name || 'Succeeder Designs & Digital Agency';

  return (
    <>
    <footer className="bg-[#0f172a] text-white pt-16 pb-6">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#0d9488] rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-4 h-4 bg-white/30 rounded-full top-1 right-1" />
                <span className="text-white font-extrabold text-lg relative z-10">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white leading-none">Succeed</span>
                <span className="text-[0.6rem] text-white/60 tracking-[2px] uppercase mt-0.5">Michael Lawani</span>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Multi-talented creative professional bringing together music, fashion, and digital marketing excellence. Inspiring the world one creation at a time.
            </p>

            {/* Social icons — only shown when URLs are set */}
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3 mb-5">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#0d9488] hover:-translate-y-1">
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-white/25 text-xs mb-5 italic">Social links — set in Admin → Site Content</p>
            )}

            {/* Donate button */}
            {donateUrl && (
              <button
                onClick={() => setDonateOpen(true)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5">
                <Heart size={14} className="fill-white" /> {donateText}
              </button>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-5 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-base font-semibold mb-5 text-white">Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-white/60 text-sm">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-5 text-white">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors">
                  {phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors">
                  {email}
                </a>
              </li>
              <li><span className="text-white/60 text-sm">{location}</span></li>
              <li><span className="text-white/60 text-sm">{business}</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/50 text-sm flex items-center justify-center gap-1">
            &copy; {new Date().getFullYear()} Succeed Michael Lawani. All Rights Reserved. | Designed with{' '}
            <Heart size={14} className="text-[#0d9488] fill-[#0d9488]" /> by Succeeder Designs
          </p>
        </div>
      </div>
    </footer>
    {donateOpen && <DonateModal onClose={() => setDonateOpen(false)} />}
    </>
  );
}
