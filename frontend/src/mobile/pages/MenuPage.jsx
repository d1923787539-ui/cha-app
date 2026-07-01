import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { api } from '../../api';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoryId') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory !== 'all') params.categoryId = activeCategory;
    if (searchQuery) params.search = searchQuery;
    api.getProducts(params)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, searchQuery]);

  const productIcons = ['🧋','🍇','🥛','🍠','🍊','🫐','🍵','🥤','☕','🥥'];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 搜索栏 */}
      <div className="sticky top-0 bg-white z-10 px-4 pt-3 pb-2">
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索饮品..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      <div className="flex flex-1">
        {/* 左侧分类栏 */}
        <div className="w-24 flex-shrink-0 bg-gray-50 overflow-y-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`w-full px-3 py-3 text-left text-sm transition-colors ${
              activeCategory === 'all' ? 'bg-white text-brand-500 font-bold border-l-2 border-brand-500' : 'text-gray-600'
            }`}
          >
            全部
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full px-3 py-3 text-left text-sm transition-colors ${
                activeCategory === cat.id ? 'bg-white text-brand-500 font-bold border-l-2 border-brand-500' : 'text-gray-600'
              }`}
            >
              {cat.name}
              {cat._count?.products > 0 && (
                <span className="text-xs text-gray-400 ml-1">({cat._count.products})</span>
              )}
            </button>
          ))}
        </div>

        {/* 右侧商品列表 */}
        <div className="flex-1 overflow-y-auto px-4 pt-3">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">加载中...</div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">暂无商品</div>
          ) : (
            <div className="space-y-3 pb-4">
              {products.map((product, idx) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="w-16 h-16 bg-brand-50 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl">{productIcons[idx % productIcons.length]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{product.description}</p>
                    <p className="text-brand-500 font-bold text-sm mt-1">¥{product.price}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
