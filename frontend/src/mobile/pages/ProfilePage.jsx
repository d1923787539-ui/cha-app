import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Gift, Star, LogOut, ChevronRight, Award, History, Coffee } from 'lucide-react';
import { api, getToken, setToken } from '../../api';

const levelNames = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', diamond: 'Diamond' };

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.getMe().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { setToken(null); setUser(null); navigate('/'); };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center"><User size={32} /></div>
        <p>Login to enjoy member benefits</p>
        <button onClick={() => navigate('/login')} className="btn-primary text-sm">Login</button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-brand-500 to-pink-600 text-white px-5 pt-8 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {user.avatarUrl ? <img src={user.avatarUrl} className="w-16 h-16 rounded-full" alt="" /> : <User size={28} />}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.nickname || 'Tea Friend'}</h2>
            <p className="text-brand-100 text-sm">{user.phone}</p>
            <div className="flex items-center gap-1 mt-1">
              <Award size={14} />
              <span className="text-xs">{levelNames[user.level] || 'Bronze'}</span>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-brand-100 text-xs">Points</p>
            <p className="text-xl font-bold">{user.points}</p>
          </div>
          <div className="text-right">
            <p className="text-brand-100 text-xs">Total Spent</p>
            <p className="text-lg font-bold">{'¥' + (user.totalSpent?.toFixed(0) || '0')}</p>
          </div>
        </div>
      </div>

      <div className="mx-4 -mt-4 card divide-y divide-gray-50">
        <MenuItem icon={Gift} label="Coupons" onClick={() => {}} badge={user.coupons?.length || 0} />
        <MenuItem icon={History} label="Points History" onClick={() => {}} />
        <MenuItem icon={Star} label="Member Level" onClick={() => {}} rightText={levelNames[user.level]} />
      </div>

      <div className="mx-4 mt-4 card divide-y divide-gray-50">
        <MenuItem icon={Coffee} label="Store Manager" onClick={() => navigate('/admin/orders')} />
      </div>

      <div className="mx-4 mt-4 card divide-y divide-gray-50">
        <MenuItem icon={LogOut} label="Logout" onClick={handleLogout} danger />
      </div>

      <div className="h-8" />
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, badge, rightText, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <Icon size={18} className={danger ? 'text-red-400' : 'text-gray-400'} />
      <span className={'flex-1 text-sm ' + (danger ? 'text-red-400' : 'text-gray-700')}>{label}</span>
      {badge > 0 && <span className="bg-brand-500 text-white text-xs rounded-full px-2 py-0.5">{badge}</span>}
      {rightText && <span className="text-xs text-gray-400">{rightText}</span>}
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}
