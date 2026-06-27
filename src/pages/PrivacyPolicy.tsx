import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSEO } from '../hooks/useSEO';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useSEO({
    title: 'Privacy Policy',
    description: 'Privacy Policy for succeedlawani.com — how we collect, use, and protect your personal data.',
  });

  const sections = [
    {
      title: '1. Who we are',
      content: `This website is operated by Succeed Michael Lawani ("we", "us", "our"), trading as Succeeder Designs & Digital Agency, based in Lagos, Nigeria.\n\nContact: hello@succeedlawani.com`,
    },
    {
      title: '2. What data we collect',
      content: `We collect the following personal data:\n\n• Email address — when you subscribe to our newsletter or contact us\n• Name — when you submit a contact or enquiry form\n• Payment information — processed securely by Flutterwave (we never store card details)\n• Usage data — pages visited, time on site, referring URL (via Google Analytics 4, if you consent)\n• Device and browser information — collected automatically by analytics tools`,
    },
    {
      title: '3. How we use your data',
      content: `We use your data to:\n\n• Send you newsletters and daily inspirational updates (only if you subscribe)\n• Respond to your enquiries and contact form submissions\n• Process shop orders and donations\n• Improve our website and understand how visitors interact with it\n• Send you updates about new music, events, and blog posts (only if you opt in)`,
    },
    {
      title: '4. Cookies',
      content: `We use the following types of cookies:\n\n• Essential cookies — required for the site to function (login session, shopping cart)\n• Analytics cookies — Google Analytics 4, to understand site usage (requires your consent)\n• Marketing cookies — Meta Pixel, for personalised advertising (requires your consent)\n\nYou can manage your cookie preferences at any time via the cookie banner at the bottom of the page.`,
    },
    {
      title: '5. Third-party services',
      content: `We use the following third-party services:\n\n• Google Analytics 4 (analytics) — Google Privacy Policy: policies.google.com/privacy\n• Meta Pixel (advertising) — Meta Privacy Policy: facebook.com/privacy/policy\n• Flutterwave (payments) — Flutterwave Privacy Policy: flutterwave.com/ng/privacy-policy\n• Cloudinary (media storage) — Cloudinary Privacy Policy: cloudinary.com/privacy\n• OneSignal (push notifications, if enabled) — OneSignal Privacy Policy: onesignal.com/privacy_policy`,
    },
    {
      title: '6. Data retention',
      content: `We retain your personal data only for as long as necessary:\n\n• Newsletter subscribers: until you unsubscribe\n• Contact form submissions: up to 2 years\n• Order records: up to 7 years for accounting purposes\n• Analytics data: as per Google Analytics 4 retention settings (default 14 months)`,
    },
    {
      title: '7. Your rights',
      content: `You have the right to:\n\n• Access the personal data we hold about you\n• Correct inaccurate data\n• Request deletion of your data ("right to be forgotten")\n• Withdraw consent at any time (for cookies and newsletter subscriptions)\n• Lodge a complaint with the relevant data protection authority\n\nTo exercise any of these rights, email us at: hello@succeedlawani.com`,
    },
    {
      title: '8. Data security',
      content: `We take reasonable technical and organisational measures to protect your data, including encrypted connections (HTTPS), secure password hashing, and access controls on our admin systems. We do not sell your personal data to third parties.`,
    },
    {
      title: '9. Children\'s privacy',
      content: `Our website is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.`,
    },
    {
      title: '10. Changes to this policy',
      content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date below. Continued use of the site after changes constitutes acceptance of the updated policy.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4]">
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] mb-3">
            Privacy <span className="text-[#0d9488]">Policy</span>
          </h1>
          <p className="text-[#64748b]">Last updated: June 2026</p>
        </div>
      </section>

      <article className="max-w-[860px] mx-auto px-6 py-12">
        <p className="text-[#64748b] leading-relaxed mb-10 text-base border-l-4 border-[#0d9488] pl-4">
          Your privacy is important to us. This policy explains what data we collect, why we collect it, and how we protect it. We are committed to being transparent and complying with applicable data protection laws.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold text-[#0f172a] mb-3">{s.title}</h2>
              <div className="text-[#475569] leading-relaxed whitespace-pre-line text-[15px]">{s.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[#f0fdfa] rounded-2xl border border-[#0d9488]/20">
          <h2 className="text-lg font-bold text-[#0f172a] mb-2">Contact us about privacy</h2>
          <p className="text-[#64748b] text-sm">
            For any privacy-related questions or to exercise your rights, email us at{' '}
            <a href="mailto:hello@succeedlawani.com" className="text-[#0d9488] font-semibold hover:underline">
              hello@succeedlawani.com
            </a>
          </p>
        </div>
      </article>

      <Footer />
    </div>
  );
}
