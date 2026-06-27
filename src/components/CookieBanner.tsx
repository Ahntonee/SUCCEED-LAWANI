import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { initGA4, initMetaPixel } from '../lib/analytics';

interface CookiePrefs { analytics: boolean; marketing: boolean }
const KEY = 'sml_cookie_consent';

function applyConsent(prefs: CookiePrefs) {
  if (prefs.analytics)  initGA4();
  if (prefs.marketing) initMetaPixel();
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState<CookiePrefs>({ analytics: true, marketing: true });

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) { applyConsent(JSON.parse(stored)); return; }
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const save = (consent: CookiePrefs) => {
    localStorage.setItem(KEY, JSON.stringify(consent));
    applyConsent(consent);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] p-3 sm:p-4">
      <div className="max-w-4xl mx-auto bg-[#0f172a] text-white rounded-2xl shadow-2xl p-5">
        {!showPrefs ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-white/80 flex-1 leading-relaxed">
              We use cookies to improve your experience and analyse site traffic. Read our{' '}
              <a href="/privacy-policy" className="underline text-[#14b8a6] hover:text-[#0d9488]">Privacy Policy</a>.{' '}
              <button onClick={() => setShowPrefs(true)} className="underline text-[#14b8a6] hover:text-[#0d9488]">
                Manage preferences
              </button>
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => save({ analytics: false, marketing: false })}
                className="px-4 py-2 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
                Reject all
              </button>
              <button
                onClick={() => save({ analytics: true, marketing: true })}
                className="px-4 py-2 rounded-xl bg-[#0d9488] text-sm font-semibold hover:bg-[#0f766e] transition-colors">
                Accept all
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Cookie preferences</h3>
              <button onClick={() => setShowPrefs(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-0 mb-5">
              {[
                { key: 'essential', label: 'Essential cookies', desc: 'Required for the site to work (login, cart, settings)', locked: true },
                { key: 'analytics', label: 'Analytics cookies', desc: 'Help us understand how visitors use the site (Google Analytics 4)', locked: false },
                { key: 'marketing', label: 'Marketing cookies', desc: 'Used for personalised advertising (Meta Pixel)', locked: false },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-white/50 mt-0.5">{item.desc}</p>
                  </div>
                  {item.locked ? (
                    <span className="text-xs text-[#14b8a6] font-semibold">Always on</span>
                  ) : (
                    <button
                      onClick={() => setPrefs((p) => ({ ...p, [item.key]: !p[item.key as keyof CookiePrefs] }))}
                      className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${prefs[item.key as keyof CookiePrefs] ? 'bg-[#0d9488]' : 'bg-white/20'}`}
                      aria-label={`Toggle ${item.label}`}>
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${prefs[item.key as keyof CookiePrefs] ? 'translate-x-4' : ''}`} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => save({ analytics: false, marketing: false })}
                className="flex-1 py-2 rounded-xl border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
                Reject all
              </button>
              <button onClick={() => save(prefs)}
                className="flex-1 py-2 rounded-xl bg-[#0d9488] text-sm font-semibold hover:bg-[#0f766e] transition-colors">
                Save
              </button>
              <button onClick={() => save({ analytics: true, marketing: true })}
                className="flex-1 py-2 rounded-xl bg-white text-[#0f172a] text-sm font-semibold hover:bg-white/90 transition-colors">
                Accept all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
