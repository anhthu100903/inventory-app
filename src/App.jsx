import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Suppliers from '@features/Supplier/page/Suppliers.jsx';
import Products from '@features/Product/page/product.jsx';
import Categories from '@features/Category/page/Categories.jsx';
import Sales from '@features/Sales/page/Sales.jsx';
import Dashboard from '@features/Dashboard/page/Dashboard.jsx';
import Imports from '@features/Import/page/Imports.jsx';

function App() {
  return (
    <Layout> 
      <Routes>
        {/* Tuyến mặc định: Trang Chủ/Dashboard */}
        <Route path="/" element={<Dashboard />} /> 
        
        {/* Các tuyến chức năng */}
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} /> 
        <Route path="/sales" element={<Sales />} /> 
        <Route path="/imports" element={<Imports />} /> 
        <Route path="/suppliers" element={<Suppliers />} />

        {/* Tuyến xử lý URL không tồn tại (Tùy chọn) */}
        <Route path="*" element={<h1>404 - Không tìm thấy trang</h1>} />
      </Routes>
    </Layout>
  );
}

export default App
