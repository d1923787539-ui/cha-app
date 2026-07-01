import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Clock, TrendingUp } from 'lucide-react';
import { api } from '../../api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProducts(),
      api.getStores(),
    ]).then(([cats, prods, stores]) => {
      setCategories(cats);
      setProducts(prods);
      setStores(stores);
      if (stores.length > 0) setSelectedStore(stores[0]);
    }).finally(() => setLoading(false));
  }, []);

  const newProducts = products.filter(p => p.isNew);
  const topProducts = products.slice(0, 6);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 顶部品牌区 */}
      <div className="bg-gradient-to-br from-brand-500 to-pink-600 text-white px-5 pt-6 pb-8">
        {selectedStore && (
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} />
            <span className="text-sm font-medium">{selectedStore.name}</span>
            <ChevronRight size={16} />
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-wide">灵感茶饮</h1>
        <p className="text-brand-100 text-sm mt-1">灵感之味，在此刻绽放</p>
        
        {/* 搜索栏 */}
        <Link to="/products" className="block mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2.5 text-white/70 text-sm flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            搜索饮品
          </div>
        </Link>
      </div>

      {/* 新品推荐 */}
      {newProducts.length > 0 && (
        <section className="px-4 -mt-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-500" />
                <span className="font-bold text-gray-900">新品首发</span>
              </div>
              <Link to="/products" className="text-brand-500 text-sm flex items-center gap-1">
                查看全部 <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {newProducts.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="flex-shrink-0 w-32">
                  <div className="w-32 h-32 bg-brand-50 rounded-xl flex items-center justify-center mb-2">
                    <span className="text-4xl">{['🧋','🍇','🥛','🍠','🍊','🫐','🍵','🥤','☕','🥥'][Math.floor(Math.random() * 10)]}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-brand-500 font-bold text-sm">¥{product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 分类入口 */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">分类</h2>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {categories.slice(0, 5).map(cat => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="flex flex-col items-center gap-1">
              <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center">
                <span className="text-2xl">{['🔥','🧋','🍓','🍵','☕'][categories.indexOf(cat) % 5]}</span>
              </div>
              <span className="text-xs text-gray-600 text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 人气推荐 */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">人气推荐</h2>
          <Link to="/products" className="text-brand-500 text-sm flex items-center gap-1">
            更多 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {topProducts.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="card p-3 flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                <span className="text-2xl">{['🧋','🍇','🥛','🍠','🍊','🫐'][Math.floor(Math.random() * 6)]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{product.description}</p>
                <p className="text-brand-500 font-bold mt-1">¥{product.price}</p>
              </div>
              <div className="text-xs text-gray-400 text-right flex-shrink-0">
                <p>已售</p>
                <p className="font-medium">{product.salesCount > 1000 ? `${(product.salesCount / 1000).toFixed(1)}k` : product.salesCount}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="h-6" />
    </div>
  );
}
