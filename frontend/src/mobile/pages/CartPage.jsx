import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, MapPin } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import { api, getToken } from '../../api';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotal, storeId } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(storeId || '');
  const [showStorePicker, setShowStorePicker] = useState(false);

  React.useEffect(() => {
    api.getStores().then(setStores).catch(() => {});
  }, []);

  const total = getTotal();
  const isLoggedIn = !!getToken();

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!selectedStoreId) {
      alert('请选择取餐门店');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        customizations: {
          sugar: item.sugar,
          ice: item.ice,
          topping: item.topping,
        },
      }));

      await api.createOrder({
        storeId: selectedStoreId,
        items: orderItems,
      });

      clearCart();
      navigate('/orders');
    } catch (err) {
      alert(err.message || '下单失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-lg">购物车</h1>
        </div>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-gray-400 text-sm flex items-center gap-1">
            <Trash2 size={14} /> 清空
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <p>购物车是空的</p>
          <Link to="/" className="btn-primary text-sm">去逛逛</Link>
        </div>
      ) : (
        <>
          {/* 门店选择 */}
          <div className="m-4">
            <button
              onClick={() => setShowStorePicker(!showStorePicker)}
              className="card w-full px-4 py-3 flex items-center gap-2 text-left"
            >
              <MapPin size={18} className="text-brand-500" />
              <span className="flex-1 text-sm">{selectedStore ? selectedStore.name : '请选择取餐门店'}</span>
              <span className="text-gray-400 text-xs">{'▾'}</span>
            </button>
            {showStorePicker && stores.map(s => (
              <button
                key={s.id}
                onClick={() => { setSelectedStoreId(s.id); setShowStorePicker(false); }}
                className={`block w-full px-4 py-2.5 text-sm text-left border-b border-gray-50 last:border-0 ${
                  s.id === selectedStoreId ? 'text-brand-500 font-medium' : 'text-gray-600'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* 商品列表 */}
          <div className="flex-1 px-4 space-y-3">
            {items.map(item => (
              <div key={item.id} className="card p-3 flex items-center gap-3">
                <div className="w-14 h-14 bg-brand-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                  <span className="text-xl">{['🧋','🍇','🥛','🍠','🍊','🫐'][Math.floor(Math.random() * 6)]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.sugar} · {item.ice} · {item.topping}
                  </p>
                  <p className="text-brand-500 font-bold text-sm mt-1">
                    ¥{((item.price + item.addonPrice) * item.quantity).toFixed(0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 底部结算 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-4 safe-bottom">
            <div>
              <p className="text-xs text-gray-400">合计</p>
              <p className="text-xl font-bold text-brand-500">¥{total.toFixed(0)}</p>
            </div>
            <button
              onClick={handleCheckout}
              disabled={submitting || items.length === 0}
              className="btn-primary flex-1"
            >
              {submitting ? '提交中...' : isLoggedIn ? '去结算' : '登录后下单'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
