import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, ChevronRight } from 'lucide-react';
import { api, getToken } from '../../api';

const statusLabels = {
  pending: '待确认',
  confirmed: '已确认',
  making: '制作中',
  completed: '已完成',
  picked_up: '已取餐',
  cancelled: '已取消',
};

const statusColors = {
  pending: 'text-yellow-500',
  confirmed: 'text-blue-500',
  making: 'text-orange-500',
  completed: 'text-green-500',
  picked_up: 'text-gray-500',
  cancelled: 'text-red-400',
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!getToken();

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    api.getOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
        <p>请先登录查看订单</p>
        <button onClick={() => navigate('/login')} className="btn-primary text-sm">去登录</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="font-bold text-xl text-gray-900 mb-4">我的订单</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <Clock size={40} />
          <p>还没有订单</p>
          <button onClick={() => navigate('/')} className="btn-primary text-sm">去下单</button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{order.orderNo}</span>
                <span className={`text-sm font-medium ${statusColors[order.status]}`}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="text-gray-500">¥{item.subtotal.toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin size={12} />
                  <span>{order.store?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">共 ¥{order.finalAmount.toFixed(0)}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-6" />
    </div>
  );
}
