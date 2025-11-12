// src/components/Header.jsx
import React from 'react';
import { MdMenu } from 'react-icons/md';
import '../styles/Header.css';

const Header = ({ onToggleSidebar }) => {
  return (
    <header className="header-mobile"> 
      <button className="menu-btn" onClick={onToggleSidebar} aria-label="Mở menu">
        <MdMenu size={24} />
      </button>
      <h2 className="header-title">
        Ứng dụng Quản lý Cát Vi
      </h2>
    </header>
  );
};

export default Header;