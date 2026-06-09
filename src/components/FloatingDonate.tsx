import { Heart } from 'lucide-react';
import { useLocation } from 'react-router';
import { useSiteContent } from '../context/SiteContentContext';

export default function FloatingDonate() {
  const content = useSiteContent();
  const location = useLocation();

  const donateUrl  = content.donate_url  || '';
  const donateText = content.donate_text || 'Donate';

  // Hide on admin routes and when no donate URL is set
  if (!donateUrl || location.pathname.startsWith('/admin')) return null;

  return (
    <a
      href={donateUrl}
      target="_blank"
      rel="noopener noreferrer"
      title={donateText}
      className="group fixed bottom-8 right-8 z-[999] flex items-center gap-2 overflow-hidden rounded-full shadow-[0_6px_24px_rgba(239,68,68,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_8px_32px_rgba(239,68,68,0.6)]"
      style={{
        background: 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)',
      }}
    >
      {/* Icon circle — always visible */}
      <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center">
        <Heart size={22} className="fill-white text-white drop-shadow-sm" />
      </span>

      {/* Label — slides in on hover */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-bold text-white transition-all duration-300 group-hover:max-w-xs group-hover:pr-5">
        {donateText}
      </span>
    </a>
  );
}
