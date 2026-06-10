import { useState, useEffect, useRef } from 'react';
import { X, Heart } from 'lucide-react';
import { api } from '../lib/api';

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
    __flwScriptLoaded?: boolean;
  }
}

const PRESETS = [1_000, 5_000, 10_000, 25_000];
const fmt = (n: number) => Number(n).toLocaleString();

function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) { resolve(); return; }
    if (document.getElementById('flw-donate-script')) {
      // Script tag already injected — poll until ready
      const t = setInterval(() => { if (window.FlutterwaveCheckout) { clearInterval(t); resolve(); } }, 80);
      return;
    }
    const s = document.createElement('script');
    s.id = 'flw-donate-script';
    s.src = 'https://checkout.flutterwave.com/v3.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Flutterwave. Check your connection.'));
    document.head.appendChild(s);
  });
}

interface Props {
  onClose: () => void;
}

export default function DonateModal({ onClose }: Props) {
  const [preset, setPreset] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Pre-load Flutterwave in background
  useEffect(() => { loadFlutterwaveScript().catch(() => {}); }, []);

  const pickPreset = (p: number) => {
    setPreset(p);
    setAmount(String(p));
    setStatusMsg(null);
  };

  const handleAmountInput = (v: string) => {
    setAmount(v);
    setPreset(null);
    setStatusMsg(null);
  };

  const handleDonate = async () => {
    const amt = Number(amount);
    if (!amt || amt < 100) {
      setStatusMsg({ text: 'Enter an amount of at least ₦100.', ok: false });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatusMsg({ text: 'Enter a valid email address.', ok: false });
      return;
    }

    setBusy(true);
    setStatusMsg({ text: 'Starting secure donation…', ok: true });

    try {
      const data = await api.initDonation({ amount: amt, currency: 'NGN', name, email, message });
      await loadFlutterwaveScript();

      if (!window.FlutterwaveCheckout) throw new Error('Flutterwave failed to load. Please refresh.');

      setBusy(false);
      setStatusMsg(null);

      window.FlutterwaveCheckout({
        public_key: data.publicKey,
        tx_ref: data.reference,
        amount: amt,
        currency: 'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: { email, name: name || 'Anonymous Donor' },
        customizations: {
          title: 'Support Michael Lawani',
          description: 'Your gift helps the mission grow. Thank you!',
        },
        callback: async () => {
          setStatusMsg({ text: 'Confirming your donation…', ok: true });
          try {
            await api.verifyDonation(data.reference);
            setStatusMsg({ text: 'Thank you so much for your donation! 💚', ok: true });
          } catch {
            setStatusMsg({ text: 'Thank you! If charged, your donation is recorded. 💚', ok: true });
          }
        },
        onclose: () => {},
      });
    } catch (err) {
      setBusy(false);
      setStatusMsg({ text: (err as Error).message || 'Could not connect. Please try again.', ok: false });
    }
  };

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,37,64,0.60)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="bg-white w-full max-w-[420px] rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(10,37,64,.35)]"
        style={{ animation: 'donateModalPop .22s ease' }}
      >
        {/* ── Header ── */}
        <div
          className="relative px-6 py-5"
          style={{ background: 'linear-gradient(135deg,#f43f5e 0%,#ec4899 100%)' }}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 text-white transition-colors"
          >
            <X size={15} />
          </button>
          <h3 className="text-white font-bold text-xl flex items-center gap-2">
            <Heart size={20} className="fill-white text-white" /> Support Michael Lawani
          </h3>
          <p className="text-white/90 text-sm mt-1">Your gift helps the mission grow. Thank you!</p>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* Preset amounts */}
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => pickPreset(p)}
                className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                  preset === p
                    ? 'bg-rose-500 border-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,.35)]'
                    : 'border-gray-200 text-[#0f172a] hover:border-rose-400 hover:text-rose-500'
                }`}
              >
                ₦{fmt(p)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Amount (NGN)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b] font-bold text-sm">₦</span>
              <input
                type="number"
                min={100}
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => handleAmountInput(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm transition-all"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
              Your name <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm transition-all"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-[#64748b] mb-1.5 uppercase tracking-wide">
              Message <span className="font-normal normal-case">(optional)</span>
            </label>
            <textarea
              placeholder="Say something kind…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-rose-400 focus:outline-none text-sm transition-all resize-none"
            />
          </div>

          {/* Donate button */}
          <button
            onClick={handleDonate}
            disabled={busy}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#f43f5e 0%,#ec4899 100%)' }}
          >
            {busy ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Heart size={15} className="fill-white text-white" />
                Donate ₦{fmt(Number(amount) || 0)}
              </>
            )}
          </button>

          {/* Status message */}
          {statusMsg && (
            <p className={`text-center text-sm font-medium ${statusMsg.ok ? 'text-green-600' : 'text-rose-500'}`}>
              {statusMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Pop-in animation */}
      <style>{`
        @keyframes donateModalPop {
          from { transform: translateY(14px) scale(.97); opacity: 0; }
          to   { transform: none; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
