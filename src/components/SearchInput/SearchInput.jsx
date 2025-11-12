// src/components/SearchInput.jsx
import React from 'react';
import { MdSearch } from 'react-icons/md';
import styles from './SearchInput.module.css';

const SearchInput = ({ searchTerm, onSearchChange, placeholder = "Tìm kiếm..." }) => {
  return (
    <div className={styles.searchContainer}>
      <MdSearch size={20} className={styles.searchIcon} />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.searchInput}
      />
    </div>
  );
};

export default SearchInput;