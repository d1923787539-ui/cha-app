import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { api } from '../../api';
import useCartStore from '../stores/cartStore';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore(s => s.addItem);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState({});
  const totalItems = useCartStore(s => s.getTotalItems());

  useEffect(() => {
    api.getProduct(id).then(p => {
      setProduct(p);
      // 初始化默认选项
      const defaults = {};
      p.productOptions.forEach(opt => {
        const defaultChoice = opt.choices.find(c => c.isDefault) || opt.choices[0];
        if (defaultChoice) defaults[opt.type] = defaultChoice.id;
      });
      setSelections(defaults);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }
  if (!product) {
    return <div className="p-4 text-center text-gray-500">商品不存在</div>;
  }

  const handleSelect = (type, choiceId) => {
    setSelections(prev => ({ ...prev, [type]: choiceId }));
  };

  const getAddonPrice = () => {
    let total = 0;
    Object.entries(selections).forEach(([type, choiceId]) => {
      const opt = product.productOptions.find(o => o.type === type);
      if (opt) {
        const choice = opt.choices.find(c => c.id === choiceId);
        if (choice) total += choice.priceAdjust;
      }
    });
    return total;
  };

  const getChoiceLabel = (choiceId) => {
    for (const opt of product.productOptions) {
      const choice = opt.choices.find(c => c.id === choiceId);
      if (choice) return choice.label;
    }
    return '';
  };

  const addonPrice = getAddonPrice();
  const totalPrice = (product.price + addonPrice) * quantity;

  const handleAddToCart = () => {
    addItem(product, quantity, {
      sugar: getChoiceLabel(selections['sugar']),
      ice: getChoiceLabel(selections['ice']),
      topping: getChoiceLabel(selections['topping']),
      addonPrice,
    });
    navigate('/cart');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 顶部 */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center gap-3 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg truncate">{product.name}</h1>
      </div>

      {/* 商品图 */}
      <div className="bg-gradient-to-b from-brand-50 to-white px-4 py-8 flex items-center justify-center">
        <div className="w-48 h-48 bg-brand-100 rounded-full flex items-center justify-center">
          <span className="text-7xl">{['🧋','🍇','🥛','🍠','🍊','🫐','🍵','🥤','☕','🥥'][Math.floor(Math.random() * 10)]}</span>
        </div>
      </div>

      {/* 商品信息 */}
      <div className="px-5 pb-4 border-b border-gray-50">
        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        <p className="text-gray-500 text-sm mt-1">{product.description}</p>
        <p className="text-brand-500 text-2xl font-bold mt-2">¥{product.price}</p>
      </div>

      {/* 选项 */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {product.productOptions.map(opt => (
          <div key={opt.id}>
            <h3 className="text-sm font-bold text-gray-700 mb-2.5">{opt.name}</h3>
            <div className="flex flex-wrap gap-2">
              {opt.choices.map(choice => {
                const isSelected = selections[opt.type] === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleSelect(opt.type, choice.id)}
                    className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-brand-500 text-white border-brand-500'
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    {choice.label}
                    {choice.priceAdjust > 0 && ` +¥${choice.priceAdjust}`}
                    {isSelected && <Check size={14} className="inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* 数量 */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2.5">数量</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
            >-</button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold"
            >+</button>
          </div>
        </div>
      </div>

      {/* 底部结算栏 */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-3 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-500">合计</p>
          <p className="text-xl font-bold text-brand-500">¥{totalPrice.toFixed(0)}</p>
        </div>
        <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
          <ShoppingCart size={18} />
          加入购物车
        </button>
      </div>

      {/* 购物车浮动入口 */}
      {totalItems > 0 && (
        <button
          onClick={() => navigate('/cart')}
          className="fixed top-3 right-4 z-50 bg-gray-800 text-white rounded-full px-3 py-1.5 text-xs flex items-center gap-1"
        >
          <ShoppingCart size={14} />
          购物车 ({totalItems})
        </button>
      )}
    </div>
  );
}
