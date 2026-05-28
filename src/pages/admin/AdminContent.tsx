import { useEffect, useState } from 'react';
import { Save, Globe, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';

interface ContentMap { [key: string]: string; }
interface ContentField { key: string; label: string; placeholder?: string; multiline?: boolean; }
interface ContentSection { title: string; keys: ContentField[]; }

const sections: ContentSection[] = [
  {
    title: 'Hero Section',
    keys: [
      { key: 'hero_headline', label: 'Headline', placeholder: 'Exceptional Talent, Every Time' },
      { key: 'hero_subtext', label: 'Subtext', placeholder: 'Bio description...', multiline: true },
    ],
  },
  {
    title: 'Stats & Numbers',
    keys: [
      { key: 'fans_count', label: 'Fans Worldwide', placeholder: '50K+' },
      { key: 'streams_count', label: 'Music Streams', placeholder: '1M+' },
      { key: 'campaigns_count', label: 'Campaigns Managed', placeholder: '500+' },
      { key: 'designs_count', label: 'Designs Created', placeholder: '2,000+' },
      { key: 'brands_scaled', label: 'Brands Scaled', placeholder: '50+' },
      { key: 'client_satisfaction', label: 'Client Satisfaction', placeholder: '98%' },
      { key: 'ad_spend_managed', label: 'Ad Spend Managed', placeholder: '10M+' },
    ],
  },
  {
    title: 'About Page Bio',
    keys: [
      { key: 'about_bio_1', label: 'Bio Paragraph 1', multiline: true },
      { key: 'about_bio_2', label: 'Bio Paragraph 2', multiline: true },
    ],
  },
  {
    title: 'Contact Information',
    keys: [
      { key: 'phone', label: 'Phone Number', placeholder: '+234 813 478 1588' },
      { key: 'email', label: 'Email Address', placeholder: 'hello@succeedlawani.com' },
      { key: 'location', label: 'Location', placeholder: 'Lagos, Nigeria' },
      { key: 'business_name', label: 'Business Name', placeholder: 'TheSucceedeer Designs & Digital Agency' },
    ],
  },
  {
    title: 'Social Media Links',
    keys: [
      { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
      { key: 'twitter_url', label: 'Twitter/X URL', placeholder: 'https://twitter.com/...' },
      { key: 'youtube_url', label: 'YouTube URL', placeholder: 'https://youtube.com/...' },
      { key: 'facebook_url', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
    ],
  },
  {
    title: 'FAQ (Contact Page)',
    keys: [
      { key: 'faq_1_q', label: 'Question 1' },
      { key: 'faq_1_a', label: 'Answer 1', multiline: true },
      { key: 'faq_2_q', label: 'Question 2' },
      { key: 'faq_2_a', label: 'Answer 2', multiline: true },
      { key: 'faq_3_q', label: 'Question 3' },
      { key: 'faq_3_a', label: 'Answer 3', multiline: true },
      { key: 'faq_4_q', label: 'Question 4' },
      { key: 'faq_4_a', label: 'Answer 4', multiline: true },
    ],
  },
];

export default function AdminContent() {
  const [content, setContent] = useState<ContentMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getContent().then((data) => { setContent(data); setLoading(false); }).catch(console.error);
  };
  useEffect(load, []);

  const saveKey = async (key: string) => {
    setSaving(key);
    try {
      await api.updateContentKey(key, content[key] || '');
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (e) { alert((e as Error).message); }
    finally { setSaving(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#0d9488]/30 border-t-[#0d9488] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a] flex items-center gap-2"><Globe size={20} className="text-[#0d9488]" /> Site Content</h2>
          <p className="text-[#64748b] text-sm mt-1">Edit any text that appears on the public website. Changes take effect immediately.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#64748b] hover:text-[#0d9488] hover:border-[#0d9488] transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#f8fafc]">
            <h3 className="font-bold text-[#0f172a]">{section.title}</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {section.keys.map((f) => (
              <div key={f.key} className="px-6 py-4 flex items-start gap-4">
                <div className="w-40 flex-shrink-0 pt-2">
                  <label className="text-sm font-semibold text-[#0f172a]">{f.label}</label>
                  <div className="text-[10px] text-[#64748b] mt-0.5 font-mono break-all">{f.key}</div>
                </div>
                <div className="flex-1">
                  {f.multiline ? (
                    <textarea
                      value={content[f.key] || ''}
                      onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                      placeholder={f.placeholder || ''}
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all resize-none"
                    />
                  ) : (
                    <input
                      value={content[f.key] || ''}
                      onChange={(e) => setContent({ ...content, [f.key]: e.target.value })}
                      placeholder={f.placeholder || ''}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all"
                    />
                  )}
                </div>
                <button
                  onClick={() => saveKey(f.key)}
                  disabled={saving === f.key}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    saved === f.key
                      ? 'bg-green-100 text-green-700'
                      : 'bg-[#0d9488] text-white hover:bg-[#0f766e]'
                  } disabled:opacity-60`}
                >
                  {saving === f.key ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : saved === f.key ? (
                    '✓ Saved'
                  ) : (
                    <><Save size={14} /> Save</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
