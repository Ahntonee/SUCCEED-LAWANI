import { useState, useEffect, useRef } from 'react';
import { X, Mail, Download } from 'lucide-react';
import { api } from '../lib/api';
import { trackEvent } from '../lib/analytics';
import { useSiteContent } from '../context/SiteContentContext';

const KEY = 'sml_exit_popup_shown';
const LEAD_MAGNET_URL = '/lead-magnet.pdf';

export default function ExitIntentPopup() {
  const { content } = useSiteContent();
  const title       = content.exit_popup_title       || 'Free Download';
  const body        = content.exit_popup_body        || 'Join Succeed Daily Updates — receive daily inspiration, faith, and transformational messages directly from Succeed, plus get the free devotional PDF.';
  const leadMagnet  = content.exit_popup_lead_magnet || '7 Days Daily Miracle Devotional';
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const triggered = useRef(false);

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;

    const handler = (e: MouseEvent) => {
      if (triggered.current || e.clientY > 20) return;
      triggered.current = true;
      sessionStorage.setItem(KEY, '1');
      setVisible(true);
    };

    // Also trigger on mobile after 45 seconds of inactivity
    const timer = setTimeout(() => {
      if (triggered.current) return;
      triggered.current = true;
      sessionStorage.setItem(KEY, '1');
      setVisible(true);
    }, 45000);

    document.addEventListener('mouseleave', handler);
    return () => { document.removeEventListener('mouseleave', handler); clearTimeout(timer); };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await api.subscribeEmail(email);
      trackEvent('email_signup', { source: 'exit_popup' });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const close = () => setVisible(false);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top band */}
        <div className="bg-gradient-to-br from-[#0d9488] to-[#0f172a] p-8 text-white text-center relative">
          <button onClick={close} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Download size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold mb-1">{title}</h2>
          <p className="text-white/80 text-sm font-semibold">{leadMagnet}</p>
        </div>

        <div className="p-6">
          {status === 'done' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-[#0d9488]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail size={22} className="text-[#0d9488]" />
              </div>
              <p className="font-bold text-[#0f172a] mb-1">You're in!</p>
              <p className="text-[#64748b] text-sm mb-4">Check your inbox for the devotional PDF.</p>
              <a
                href={LEAD_MAGNET_URL}
                download
                className="inline-flex items-center gap-2 bg-[#0d9488] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#0f766e] transition-colors">
                <Download size={15} /> Download now
              </a>
            </div>
          ) : (
            <>
              <p className="text-[#0f172a] font-bold text-lg mb-1 text-center">
                👉 Join Succeed Daily Updates
              </p>
              <p className="text-[#64748b] text-sm text-center mb-5 leading-relaxed">{body}</p>
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all text-sm"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3 rounded-xl bg-[#0d9488] text-white font-semibold text-sm hover:bg-[#0f766e] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {status === 'loading'
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Mail size={15} /> Get Free Devotional</>}
                </button>
                {status === 'error' && (
                  <p className="text-red-500 text-xs text-center">Something went wrong. Please try again.</p>
                )}
              </form>
              <button onClick={close} className="w-full text-center text-xs text-[#94a3b8] hover:text-[#64748b] mt-3 transition-colors">
                No thanks, I'll skip the free download
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
