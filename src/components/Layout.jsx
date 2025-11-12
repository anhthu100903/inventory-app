// src/components/Layout.jsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/Layout.css'; // Import CSS cho Layout

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* 1. Header (Luôn hiển thị) */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* 2. Sidebar (Ẩn trên di động, hiện trên desktop) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 3. Vùng Nội dung chính */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;