import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { api, setToken } from '../../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let res;
      if (isRegister) {
        res = await api.register({ phone, nickname });
      } else {
        res = await api.login({ phone });
      }
      setToken(res.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
      // 如果是未注册，自动切换到注册模式
      if (err.message === '未注册的手机号，请先注册') {
        setIsRegister(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto flex flex-col">
      {/* 头部 */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 px-6 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🍵</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRegister ? '注册' : '登录'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isRegister ? '注册即享新人优惠' : '登录享受会员权益'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-brand-500 transition-colors">
              <Phone size={18} className="text-gray-400" />
              <input
                type="tel"
                maxLength={11}
                placeholder="手机号"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 outline-none text-sm bg-transparent"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-brand-500 transition-colors">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="昵称（选填）"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="flex-1 outline-none text-sm bg-transparent"
                />
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full text-center">
            {loading ? '处理中...' : isRegister ? '注册' : '登录'}
          </button>

          <p className="text-center text-sm text-gray-400">
            {isRegister ? '已有账号？' : '没有账号？'}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand-500 ml-1"
            >
              {isRegister ? '去登录' : '去注册'}
            </button>
          </p>
        </form>

        <p className="text-center text-xs text-gray-300 mt-8">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}

function User({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
