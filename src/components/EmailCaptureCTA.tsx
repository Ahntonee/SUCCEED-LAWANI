import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { api } from '../lib/api';
import { trackEvent } from '../lib/analytics';

export default function EmailCaptureCTA() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.subscribeEmail(email.trim());
      setDone(true);
      trackEvent('email_signup', { source: 'inline_cta' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-16 bg-gradient-to-r from-[#0d9488] to-[#0f766e]">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Mail size={16} /> Stay Connected
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
          Join Succeed's Daily Updates
        </h2>
        <p className="text-white/80 text-lg mb-8">
          Get exclusive music releases, fashion drops, and marketing insights delivered to your inbox.
        </p>

        {done ? (
          <div className="flex items-center justify-center gap-3 text-white text-lg font-semibold">
            <CheckCircle size={24} className="text-white" />
            You're in! Check your inbox for a welcome message.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-3 rounded-full text-[#0f172a] placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-[#0d9488] font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-all disabled:opacity-60 whitespace-nowrap"
            >
              {loading ? 'Subscribing…' : 'Subscribe Free'}
            </button>
          </form>
        )}
        {error && <p className="text-white/80 text-sm mt-3">{error}</p>}
        <p className="text-white/50 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
