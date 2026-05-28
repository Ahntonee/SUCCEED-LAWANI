import { useEffect, useState } from 'react';
import { Settings, Save, Eye, EyeOff } from 'lucide-react';
import { api } from '../../lib/api';

export default function AdminSettings() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.me().then((admin) => setForm((f) => ({ ...f, name: admin.name, email: admin.email }))).catch(console.error);
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }
    setSaving(true);
    const data: Record<string, string> = { name: form.name, email: form.email };
    if (form.password) data.password = form.password;
    try {
      await api.updateProfile(data);
      setMsg('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (e) { setMsg((e as Error).message); }
    finally { setSaving(false); setTimeout(() => setMsg(''), 3000); }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-[#0d9488]" />
        <h2 className="text-lg font-bold text-[#0f172a]">Admin Settings</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-[#0f172a] mb-5">Profile & Security</h3>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-5 ${msg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Display Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Email Address</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-[#64748b] mb-3">Leave password fields empty to keep existing password.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Leave blank to keep current"
                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0d9488]">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">Confirm New Password</label>
                <input type={showPass ? 'text' : 'password'} value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#0d9488] text-white py-3 rounded-xl font-semibold hover:bg-[#0f766e] transition-colors disabled:opacity-60">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Save Changes</>}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-[#0f172a] mb-2">Backend Connection</h3>
        <p className="text-[#64748b] text-sm mb-4">The admin dashboard connects to the backend API to manage all site data.</p>
        <div className="bg-[#f8fafc] rounded-xl p-4 font-mono text-sm text-[#64748b]">
          API URL: {import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}
        </div>
      </div>
    </div>
  );
}
