import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import useCartStore from './stores/cartStore';

const tabs = [
  { path: '/', label: '棣栭〉', icon: Home },
  { path: '/products', label: '鑿滃崟', icon: Search },
  { path: '/orders', label: '璁㈠崟', icon: ClipboardList },
  { path: '/profile', label: '鎴戠殑', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const totalItems = useCartStore(s => s.getTotalItems());
  const showNav = !['/login', '/cart'].includes(location.pathname) && !location.pathname.startsWith('/product/') && !location.pathname.startsWith('/admin/')

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      {/* 涓诲唴瀹瑰尯 */}
      <div className={`pb-2 ${showNav ? 'pb-20' : 'pb-4'}`}>
        <Outlet />
      </div>

      {/* 璐墿杞︽诞鍔ㄥ叆鍙ｏ紙涓嶅湪璐墿杞﹂〉闈㈡椂鏄剧ず锛?*/}
      {location.pathname !== '/cart' && totalItems > 0 && (
        <NavLink
          to="/cart"
          className="fixed bottom-20 right-4 z-50 bg-brand-500 text-white rounded-full p-3 shadow-lg 
                     flex items-center gap-2 pr-5 animate-bounce-sm"
        >
          <div className="relative">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          </div>
          <span className="text-sm font-medium">楼{useCartStore.getState().getTotal().toFixed(0)}</span>
        </NavLink>
      )}

      {/* 搴曢儴瀵艰埅 */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-40 max-w-lg mx-auto">
          <div className="flex items-center justify-around h-16">
            {tabs.map(tab => {
              const isActive = tab.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(tab.path);
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive ? 'text-brand-500' : 'text-gray-400'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-xs mt-1">{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

