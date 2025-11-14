// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css'; 
import { MdDashboard, MdInventory, MdPeople, MdAddShoppingCart, MdCallMade, MdChevronLeft } from 'react-icons/md'; 

// Cần cài đặt react-icons nếu chưa có: npm install react-icons

const navItems = [
  { path: '/', label: 'Tổng quan', icon: MdDashboard },
  { path: '/products', label: 'Quản lý Sản phẩm', icon: MdInventory },
  { path: '/imports', label: 'Phiếu nhập kho', icon: MdAddShoppingCart },
  { path: '/sales', label: 'Phiếu xuất/Bán hàng', icon: MdCallMade },
  { path: '/suppliers', label: 'Quản lý NCC', icon: MdPeople },
];

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation(); 

  return (
    <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}> 
      <div className="sidebar-header">
        <h1 className="logo-title">
          Cát Vi
        </h1>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Đóng menu">
          <MdChevronLeft size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                onClick={onClose} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                <item.icon size={20} className="nav-icon" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;