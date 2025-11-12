// src/components/Modal.jsx
import React from 'react';
import '../styles/Modal.css'; // Import CSS cập nhật

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Đóng modal">
            <span>&times;</span>
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        <div className="modal-footer">
          {/* Optional: Thêm nút ngoài form nếu cần */}
        </div>
      </div>
    </div>
  );
};

export default Modal;