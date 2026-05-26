import { Link } from 'react-router';
import { Facebook, Instagram, Twitter, Youtube, Linkedin, Heart } from 'lucide-react';

const quickLinks = [
  { name: 'About Me', path: '/about' },
  { name: 'Music', path: '/music' },
  { name: 'Events', path: '/events' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

const services = [
  'Music Production',
  'Bespoke Tailoring',
  'Facebook Ads',
  'DMI Training',
  'Brand Optimization',
];

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
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
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Multi-talented creative professional bringing together music, fashion, and digital marketing excellence. Inspiring the world one creation at a time.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white transition-all duration-300 hover:bg-[#0d9488] hover:-translate-y-1"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-5 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors duration-300"
                  >
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
                <a href="tel:+2348134781588" className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors">
                  +234 813 478 1588
                </a>
              </li>
              <li>
                <a href="mailto:hello@succeedlawani.com" className="text-white/60 text-sm hover:text-[#14b8a6] transition-colors">
                  hello@succeedlawani.com
                </a>
              </li>
              <li>
                <span className="text-white/60 text-sm">Lagos, Nigeria</span>
              </li>
              <li>
                <span className="text-white/60 text-sm">TheSucceedeer Designs & Digital Agency</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/50 text-sm flex items-center justify-center gap-1">
            &copy; 2026 Succeed Michael Lawani. All Rights Reserved. | Designed with{' '}
            <Heart size={14} className="text-[#0d9488] fill-[#0d9488]" /> by TheSucceedeer Designs
          </p>
        </div>
      </div>
    </footer>
  );
}
