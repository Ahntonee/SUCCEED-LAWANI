import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingBag, CreditCard, Check, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

// ─── Type declarations for payment SDKs ──────────────────────────────────────
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
    FlutterwaveCheckout?: (config: Record<string, unknown>) => void;
  }
}

// ─── Form validation ─────────────────────────────────────────────────────────
function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function validateForm(form: { name: string; email: string }) {
  const errors: Record<string, string> = {};
  if (!form.name.trim() || form.name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters';
  if (!validateEmail(form.email))
    errors.email = 'Enter a valid email address';
  return errors;
}

// ─── Payment method config ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    key: 'paystack' as const,
    label: 'Paystack',
    sub: 'Card, bank transfer, USSD (NGN)',
  },
  {
    key: 'flutterwave' as const,
    label: 'Flutterwave',
    sub: 'Card, mobile money, bank transfer',
  },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'success'>('info');
  const [method, setMethod] = useState<'paystack' | 'flutterwave'>('paystack');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [completedOrder, setCompletedOrder] = useState<{ id: number } | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Redirect if cart is empty (but not when on success screen)
  useEffect(() => {
    if (items.length === 0 && step !== 'success') navigate('/shop');
  }, [items, step, navigate]);

  // Load payment scripts once on mount
  useEffect(() => {
    const loadScript = (id: string, src: string) => {
      if (!document.getElementById(id)) {
        const s = document.createElement('script');
        s.id = id;
        s.src = src;
        document.body.appendChild(s);
      }
    };
    loadScript('paystack-script', 'https://js.paystack.co/v1/inline.js');
    loadScript('flutterwave-script', 'https://checkout.flutterwave.com/v3.js');
  }, []);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [key]: e.target.value });
      if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: '' });
    },
  });

  const cartItems = () => items.map((i) => ({ id: i.id, qty: i.qty }));

  const onOrderSuccess = (order: { id: number }) => {
    setCompletedOrder(order);
    clearCart();
    setStep('success');
  };

  // ── Paystack ────────────────────────────────────────────────────────────────
  const payWithPaystack = () => {
    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!key) { setError('Paystack is not configured. Please contact support.'); return; }
    if (!window.PaystackPop) { setError('Paystack failed to load. Please refresh and try again.'); return; }

    const handler = window.PaystackPop.setup({
      key,
      email: form.email,
      amount: Math.round(total * 100), // kobo
      currency: 'NGN',
      ref: `SML-PS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      metadata: {
        custom_fields: [{ display_name: 'Customer', variable_name: 'customer', value: form.name }],
      },
      callback: async (response: { reference: string }) => {
        setProcessing(true);
        setError('');
        try {
          const order = await api.verifyPaystack({
            reference: response.reference,
            items: cartItems(),
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone || undefined,
          });
          onOrderSuccess(order);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Payment verification failed. Please contact support with your reference: ' + response.reference
          );
        } finally {
          setProcessing(false);
        }
      },
      onClose: () => {},
    });
    handler.openIframe();
  };

  // ── Flutterwave ─────────────────────────────────────────────────────────────
  const payWithFlutterwave = () => {
    const key = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
    if (!key) { setError('Flutterwave is not configured. Please contact support.'); return; }
    if (!window.FlutterwaveCheckout) { setError('Flutterwave failed to load. Please refresh and try again.'); return; }

    window.FlutterwaveCheckout({
      public_key: key,
      tx_ref: `SML-FLW-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      amount: total,
      currency: 'NGN',
      payment_options: 'card,mobilemoney,ussd,bank_transfer',
      customer: {
        email: form.email,
        phone_number: form.phone || '',
        name: form.name,
      },
      customizations: {
        title: 'Succeed Michael Lawani',
        description: `Order of ${items.length} item(s)`,
        logo: `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://succeed-lawani.onrender.com'}/uploads/logo.png`,
      },
      callback: async (data: { transaction_id: number; status: string; tx_ref: string }) => {
        if (data.status !== 'successful') {
          setError('Payment was not completed. Please try again.');
          return;
        }
        setProcessing(true);
        setError('');
        try {
          const order = await api.verifyFlutterwave({
            transactionId: String(data.transaction_id),
            items: cartItems(),
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone || undefined,
          });
          onOrderSuccess(order);
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : 'Payment verification failed. Please contact support with transaction ID: ' + data.transaction_id
          );
        } finally {
          setProcessing(false);
        }
      },
      onclose: () => {},
    });
  };

  const handlePay = () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setError('');
    if (method === 'paystack') payWithPaystack();
    else payWithFlutterwave();
  };

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-[#0d9488]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={36} className="text-[#0d9488]" />
        </div>
        <h2 className="text-2xl font-black text-[#0f172a] mb-2">Order Confirmed!</h2>
        {completedOrder && <p className="text-[#0d9488] font-semibold mb-1">Order #{completedOrder.id}</p>}
        <p className="text-[#64748b] mb-2">Thank you, <strong>{form.name}</strong>!</p>
        <p className="text-[#64748b] text-sm mb-8">
          A confirmation email has been sent to <strong>{form.email}</strong>.
        </p>
        <button onClick={() => navigate('/shop')}
          className="w-full py-3.5 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/shop')} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-5">

          {/* Global error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Payment issue</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-[#0f172a] text-lg mb-5">Contact Information</h2>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name' as const, placeholder: 'John Doe', type: 'text', required: true },
                { label: 'Email Address', key: 'email' as const, placeholder: 'john@example.com', type: 'email', required: true },
                { label: 'Phone Number', key: 'phone' as const, placeholder: '+234 800 000 0000', type: 'tel', required: false },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {f.label} {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <input type={f.type} placeholder={f.placeholder} {...field(f.key)}
                    className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-sm transition-all ${
                      fieldErrors[f.key]
                        ? 'border-red-300 focus:border-red-400 bg-red-50'
                        : 'border-gray-200 focus:border-[#0d9488]'
                    }`} />
                  {fieldErrors[f.key] && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={11} /> {fieldErrors[f.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <h2 className="font-bold text-[#0f172a] text-lg mt-7 mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map((m) => (
                <button key={m.key} onClick={() => setMethod(m.key)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    method === m.key
                      ? 'border-[#0d9488] bg-[#0d9488]/5'
                      : 'border-gray-200 hover:border-[#0d9488]/40'
                  }`}>
                  <CreditCard size={20} className={method === m.key ? 'text-[#0d9488]' : 'text-[#64748b]'} />
                  <p className={`font-bold text-sm mt-2 ${method === m.key ? 'text-[#0d9488]' : 'text-[#0f172a]'}`}>
                    {m.label}
                  </p>
                  <p className="text-xs text-[#64748b] mt-0.5">{m.sub}</p>
                </button>
              ))}
            </div>

            <button onClick={handlePay} disabled={processing}
              className="mt-6 w-full py-4 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {processing
                ? <><Loader2 size={18} className="animate-spin" /> Verifying payment...</>
                : <>Pay ₦{total.toLocaleString()} with {method === 'paystack' ? 'Paystack' : 'Flutterwave'}</>
              }
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
            <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#0d9488]" /> Order Summary
            </h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{item.name}</p>
                    <p className="text-xs text-[#64748b]">x{item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0d9488] whitespace-nowrap">
                    ₦{(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-[#64748b]">
                <span>Subtotal</span><span>₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-[#64748b]">
                <span>Shipping</span>
                <span className="text-green-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between font-bold text-[#0f172a] text-lg border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-[#0d9488]">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
