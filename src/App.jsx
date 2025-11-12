import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import Suppliers from "./pages/Supplier/Suppliers";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import Imports from "./pages/Imports";

function App() {
  return (
    <Layout> 
      <Routes>
        {/* Tuyến mặc định: Trang Chủ/Dashboard */}
        <Route path="/" element={<Dashboard />} /> 
        
        {/* Các tuyến chức năng */}
        <Route path="/products" element={<Products />} /> 
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
