import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeFromCart, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={closeCart} />}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[#0d9488]" />
            <h2 className="font-bold text-lg text-[#0f172a]">Your Cart</h2>
            {count > 0 && <span className="bg-[#0d9488] text-white text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>}
          </div>
          <button onClick={closeCart} className="p-2 text-[#64748b] hover:text-[#0f172a] hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={56} className="text-gray-200" />
              <p className="font-semibold text-[#64748b]">Your cart is empty</p>
              <button onClick={closeCart} className="text-[#0d9488] text-sm font-semibold hover:underline">Continue Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-[#0d9488]/20 transition-colors">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0f172a] text-sm truncate">{item.name}</p>
                  <p className="text-[#0d9488] font-bold text-sm mt-0.5">₦{(item.price * item.qty).toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#0d9488] hover:text-white flex items-center justify-center transition-colors">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#0d9488] hover:text-white flex items-center justify-center transition-colors">
                      <Plus size={12} />
                    </button>
                    <button onClick={() => removeFromCart(item.id)}
                      className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#64748b] font-medium">Subtotal</span>
              <span className="text-[#0f172a] font-bold text-lg">₦{total.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { closeCart(); navigate('/shop/checkout'); }}
              className="w-full py-3.5 bg-[#0d9488] text-white rounded-2xl font-bold hover:bg-[#0f766e] transition-colors shadow-lg shadow-[#0d9488]/20"
            >
              Proceed to Checkout
            </button>
            <button onClick={closeCart} className="w-full py-2.5 text-[#64748b] text-sm font-medium hover:text-[#0f172a] transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
