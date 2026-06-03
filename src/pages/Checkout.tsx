import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ShoppingBag, CreditCard, Check, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

// ─── Stripe Payment Form ─────────────────────────────────────────────────────
function StripeForm({ onSuccess }: { onSuccess: (ref: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (stripeError) { setError(stripeError.message || 'Payment failed'); setProcessing(false); return; }
    if (paymentIntent?.status === 'succeeded') onSuccess(paymentIntent.id);
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" disabled={processing || !stripe}
        className="w-full py-4 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
        {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
        {processing ? 'Processing...' : 'Pay with Card'}
      </button>
    </form>
  );
}

// ─── Main Checkout ────────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [method, setMethod] = useState<'paystack' | 'stripe'>('paystack');
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => { if (items.length === 0 && step !== 'success') navigate('/shop'); }, [items]);

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  const proceedToPayment = async () => {
    if (!form.name || !form.email) return;
    if (method === 'stripe' && stripePromise) {
      setProcessing(true);
      try {
        const { clientSecret: cs } = await api.createPaymentIntent(total);
        setClientSecret(cs);
      } catch { alert('Failed to initialize payment.'); setProcessing(false); return; }
      setProcessing(false);
    }
    setStep('payment');
  };

  const saveOrder = async (paymentRef: string) => {
    await api.createOrder({
      items,
      subtotal: total,
      total,
      customerName: form.name,
      customerEmail: form.email,
      customerPhone: form.phone,
      paymentMethod: method,
      paymentRef,
    });
    clearCart();
    setStep('success');
  };

  // Paystack handler
  const payWithPaystack = () => {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) { alert('Paystack is not configured.'); return; }
    const handler = (window as unknown as { PaystackPop: { setup: (config: Record<string, unknown>) => { openIframe: () => void } } }).PaystackPop.setup({
      key: paystackKey,
      email: form.email,
      amount: total * 100,
      currency: 'NGN',
      ref: `SML-${Date.now()}`,
      metadata: { custom_fields: [{ display_name: 'Customer', variable_name: 'customer', value: form.name }] },
      callback: (response: { reference: string }) => saveOrder(response.reference),
      onClose: () => {},
    });
    handler.openIframe();
  };

  // Load Paystack script
  useEffect(() => {
    if (method === 'paystack' && !document.getElementById('paystack-script')) {
      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);
    }
  }, [method]);

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-[#0d9488]/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check size={36} className="text-[#0d9488]" />
        </div>
        <h2 className="text-2xl font-black text-[#0f172a] mb-2">Order Confirmed!</h2>
        <p className="text-[#64748b] mb-2">Thank you, <strong>{form.name}</strong>!</p>
        <p className="text-[#64748b] text-sm mb-8">A confirmation will be sent to <strong>{form.email}</strong>.</p>
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
          <button onClick={() => step === 'payment' ? setStep('info') : navigate('/shop')}
            className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">Checkout</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-5">
          {step === 'info' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-[#0f172a] text-lg mb-5">Contact Information</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name' as const, placeholder: 'John Doe', type: 'text' },
                  { label: 'Email Address', key: 'email' as const, placeholder: 'john@example.com', type: 'email' },
                  { label: 'Phone Number', key: 'phone' as const, placeholder: '+234 800 000 0000', type: 'tel' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">{f.label} {f.key !== 'phone' && <span className="text-red-400">*</span>}</label>
                    <input type={f.type} placeholder={f.placeholder} {...field(f.key)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0d9488] focus:outline-none text-sm transition-all" />
                  </div>
                ))}
              </div>

              {/* Payment Method */}
              <h2 className="font-bold text-[#0f172a] text-lg mt-6 mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'paystack' as const, label: 'Paystack', sub: 'Pay with card, bank transfer, USSD' },
                  { key: 'stripe' as const, label: 'Stripe', sub: 'International card payment' },
                ].map((m) => (
                  <button key={m.key} onClick={() => setMethod(m.key)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${method === m.key ? 'border-[#0d9488] bg-[#0d9488]/5' : 'border-gray-200 hover:border-[#0d9488]/40'}`}>
                    <CreditCard size={20} className={method === m.key ? 'text-[#0d9488]' : 'text-[#64748b]'} />
                    <p className={`font-bold text-sm mt-2 ${method === m.key ? 'text-[#0d9488]' : 'text-[#0f172a]'}`}>{m.label}</p>
                    <p className="text-xs text-[#64748b] mt-0.5">{m.sub}</p>
                  </button>
                ))}
              </div>

              <button onClick={proceedToPayment} disabled={!form.name || !form.email || processing}
                className="mt-6 w-full py-4 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {processing ? <Loader2 size={18} className="animate-spin" /> : null}
                Continue to Payment
              </button>
            </div>
          )}

          {step === 'payment' && (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h2 className="font-bold text-[#0f172a] text-lg mb-5">Complete Payment</h2>
              {method === 'paystack' ? (
                <button onClick={payWithPaystack}
                  className="w-full py-4 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors flex items-center justify-center gap-2 text-base">
                  <CreditCard size={18} /> Pay ₦{total.toLocaleString()} with Paystack
                </button>
              ) : clientSecret && stripePromise ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: '#0d9488' } } }}>
                  <StripeForm onSuccess={saveOrder} />
                </Elements>
              ) : (
                <p className="text-[#64748b] text-sm">Stripe is not configured. Please use Paystack.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-6">
            <h2 className="font-bold text-[#0f172a] mb-4 flex items-center gap-2"><ShoppingBag size={18} className="text-[#0d9488]" /> Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0f172a] truncate">{item.name}</p>
                    <p className="text-xs text-[#64748b]">x{item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-[#0d9488] whitespace-nowrap">₦{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-[#64748b]"><span>Subtotal</span><span>₦{total.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm text-[#64748b]"><span>Shipping</span><span className="text-green-600 font-semibold">Free</span></div>
              <div className="flex justify-between font-bold text-[#0f172a] text-lg border-t border-gray-100 pt-2 mt-2">
                <span>Total</span><span className="text-[#0d9488]">₦{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
