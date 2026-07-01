import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './mobile/Layout';
import HomePage from './mobile/pages/HomePage';
import MenuPage from './mobile/pages/MenuPage';
import ProductDetail from './mobile/pages/ProductDetail';
import CartPage from './mobile/pages/CartPage';
import OrdersPage from './mobile/pages/OrdersPage';
import ProfilePage from './mobile/pages/ProfilePage';
import LoginPage from './mobile/pages/LoginPage';
import AdminOrders from './admin/pages/AdminOrders';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<MenuPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
