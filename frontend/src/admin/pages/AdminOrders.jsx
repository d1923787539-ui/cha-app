import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Clock, CheckCircle, XCircle, Coffee, TrendingUp, DollarSign } from 'lucide-react';
import { api, getToken } from '../../api';

const statusLabels = {
  pending: '待确认', confirmed: '已确认', making: '制作中', completed: '已完成', picked_up: '已取餐', cancelled: '已取消'
};
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  making: 'bg-orange-100 text-orange-700', completed: 'bg-green-100 text-green-700',
  picked_up: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-500'
};

const nextStatus = {
  pending: 'confirmed', confirmed: 'making', making: 'completed', completed: 'picked_up'
};
const actionLabels = {
  pending: '确认订单', confirmed: '开始制作', making: '完成制作', completed: '已取餐'
};

export default function AdminOrders() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const isLoggedIn = !!getToken();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dash, orderRes] = await Promise.all([
        api.request('/admin/dashboard'),
        api.request('/admin/orders?page=' + page + (statusFilter ? '&status=' + statusFilter : '')),
      ]);
      setDashboard(dash);
      setOrders(orderRes.orders);
      setTotalPages(orderRes.totalPages);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchData();
    else setLoading(false);
  }, [page, statusFilter]);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const next = nextStatus[currentStatus];
    if (!next) return;
    setUpdating(orderId);
    try {
      await api.request('/admin/orders/' + orderId + '/status', { method: 'PUT', body: JSON.stringify({ status: next }) });
      fetchData();
    } catch (e) { alert('操作失败'); }
    setUpdating(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400 p-4">
        <Coffee size={40} />
        <p>请先登录后使用管理后台</p>
        <button onClick={() => navigate('/login')} className="btn-primary text-sm">去登录</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      {/* 头部 */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1"><ArrowLeft size={24} /></button>
          <h1 className="font-bold text-lg">店长管理</h1>
        </div>
        <button onClick={fetchData} className="text-gray-400 p-1"><RefreshCw size={18} /></button>
      </div>

      {/* 概览卡片 */}
      {dashboard && (
        <div className="grid grid-cols-4 gap-2 px-4 pt-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="text-xs text-gray-400">今日</p><p className="text-lg font-bold text-gray-800">{dashboard.todayOrders}</p></div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="text-xs text-gray-400">待确认</p><p className="text-lg font-bold text-yellow-500">{dashboard.pendingOrders}</p></div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="text-xs text-gray-400">制作中</p><p className="text-lg font-bold text-orange-500">{dashboard.makingOrders}</p></div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm"><p className="text-xs text-gray-400">营收</p><p className="text-lg font-bold text-green-500">¥{dashboard.todayRevenue}</p></div>
        </div>
      )}

      {/* 状态筛选 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
        {['', 'pending', 'making', 'completed', 'cancelled'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={'px-3 py-1.5 rounded-full text-xs whitespace-nowrap ' + (statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white text-gray-500 border border-gray-200')}>
            {s ? statusLabels[s] : '全部'}
          </button>
        ))}
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">暂无订单</div>
      ) : (
        <div className="px-4 pb-4 space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs text-gray-400">{order.orderNo}</span>
                  <span className="text-xs text-gray-400 ml-2">{new Date(order.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <span className={'text-xs px-2 py-0.5 rounded-full ' + (statusColors[order.status] || '')}>{statusLabels[order.status]}</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{order.user?.nickname || order.user?.phone}</span>
                <span className="text-gray-400 ml-2">{order.user?.phone}</span>
              </div>
              <div className="text-xs text-gray-500 space-y-0.5 mb-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>¥{item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <span className="text-sm font-bold">¥{order.finalAmount.toFixed(0)}</span>
                {nextStatus[order.status] && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, order.status)}
                    disabled={updating === order.id}
                    className={'px-4 py-1.5 rounded-full text-xs font-medium text-white ' + (updating === order.id ? 'bg-gray-400' : 'bg-brand-500')}
                  >
                    {updating === order.id ? '...' : actionLabels[order.status]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pb-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm bg-white rounded border disabled:opacity-30">上一页</button>
          <span className="px-3 py-1 text-sm text-gray-500">{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm bg-white rounded border disabled:opacity-30">下一页</button>
        </div>
      )}
    </div>
  );
}
