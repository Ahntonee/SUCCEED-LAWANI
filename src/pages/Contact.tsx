import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, Briefcase, Send, CheckCircle, MessageSquare, User, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { useSEO } from '../hooks/useSEO';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone',
    value: '+234 813 478 1588',
    link: 'tel:+2348134781588',
    description: 'Available Mon-Fri, 9AM-6PM WAT',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'hello@succeedlawani.com',
    link: 'mailto:hello@succeedlawani.com',
    description: 'I respond within 24 hours',
  },
  {
    icon: MapPin,
    title: 'Location',
    value: 'Lagos, Nigeria',
    link: '#',
    description: 'Available for travel worldwide',
  },
  {
    icon: Briefcase,
    title: 'Business',
    value: 'Succeeder Designs & Digital Agency',
    link: '#',
    description: 'Fashion, Music & Marketing',
  },
];

const inquiryTypes = [
  { value: 'music', label: 'Music Collaboration / Booking' },
  { value: 'fashion', label: 'Fashion Design / Tailoring' },
  { value: 'marketing', label: 'Digital Marketing Services' },
  { value: 'events', label: 'Event Speaking / Appearance' },
  { value: 'media', label: 'Media / Press Inquiry' },
  { value: 'other', label: 'Other' },
];

export default function Contact() {
  useSEO({
    title: 'Contact — Succeed Michael Lawani',
    description: 'Get in touch with Succeed Michael Lawani for bookings, music collaborations, fashion inquiries, and digital marketing consultations.',
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    inquiryType: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.submitContact(formData);
      setSubmitted(true);
      toast.success('Message sent successfully! Succeed will get back to you within 24 hours.');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', subject: '', inquiryType: '', message: '' });
      }, 3000);
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-[#f0fdfa] via-[#ccfbf1] to-[#99f6e4] relative overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-[rgba(13,148,136,0.08)] rounded-full -top-[150px] -right-[100px]" />
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#0d9488]/10 text-[#0d9488] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <MessageSquare size={16} /> Get In Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#0f172a] mb-6">
              Let Us <span className="text-[#0d9488]">Connect</span>
            </h1>
            <p className="text-[#64748b] text-lg">
              Ready to collaborate? Whether it is music production, bespoke fashion, digital marketing strategy, or just to say hello — I would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-24 relative z-20">
            {contactInfo.map((info) => (
              <a
                key={info.title}
                href={info.link}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-gray-100"
              >
                <div className="w-12 h-12 bg-[#0d9488] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#0f766e] transition-colors">
                  <info.icon className="text-white" size={22} />
                </div>
                <h3 className="font-bold text-[#0f172a] mb-1">{info.title}</h3>
                <p className="text-[#0d9488] text-sm font-semibold mb-1">{info.value}</p>
                <p className="text-[#64748b] text-xs">{info.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Send a Message</h2>
              <p className="text-[#64748b] mb-8">
                Fill out the form below and I will get back to you as soon as possible.
              </p>
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-[#0d9488] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f172a] mb-2">Message Sent!</h3>
                  <p className="text-[#64748b]">Thank you for reaching out. I will be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                      <User size={14} className="inline mr-1" /> Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                      <Mail size={14} className="inline mr-1" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                      <FileText size={14} className="inline mr-1" /> Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this about?"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                      Inquiry Type
                    </label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all bg-white"
                    >
                      <option value="">Select an option</option>
                      {inquiryTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                      <MessageSquare size={14} className="inline mr-1" /> Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      placeholder="Tell me about your project, idea, or question..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none focus:ring-4 focus:ring-[#0d9488]/10 transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-[#0d9488] text-white py-3.5 rounded-xl font-semibold hover:bg-[#0f766e] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send size={18} /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Side Info */}
            <div>
              <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl p-8 md:p-10 text-white mb-8">
                <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
                <div className="space-y-6">
                  {[
                    { step: '1', title: 'I Receive Your Message', desc: 'Your inquiry comes directly to my inbox within seconds.' },
                    { step: '2', title: 'Review & Response', desc: 'I personally review every message and respond within 24 hours.' },
                    { step: '3', title: 'We Collaborate', desc: 'We schedule a call or meeting to discuss your project in detail.' },
                    { step: '4', title: 'Create Magic', desc: 'We bring your vision to life with excellence and passion.' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 bg-[#0d9488] rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-white/60 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-[#0f172a] mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    { q: 'How far in advance should I book?', a: 'For events and performances, at least 4-6 weeks in advance. For fashion orders, 2-3 weeks is ideal.' },
                    { q: 'Do you offer international shipping?', a: 'Yes! Succeeder Designs ships worldwide via DHL and FedEx with tracking.' },
                    { q: 'Can I get a custom song written?', a: 'Absolutely. I create custom songs for weddings, anniversaries, corporate events, and special occasions.' },
                    { q: 'What marketing services do you offer?', a: 'Facebook/Instagram Ads, Google Ads, SEO, content strategy, brand consulting, and training workshops.' },
                  ].map((faq, i) => (
                    <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-[#0f172a] text-sm mb-1">{faq.q}</h4>
                      <p className="text-[#64748b] text-sm">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
