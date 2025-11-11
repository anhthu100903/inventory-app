import { Routes, Route, Link } from 'react-router-dom';
import Suppliers from "./pages/Suppliers";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Dashboard from "./pages/Dashboard";
import Imports from "./pages/Imports";

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/suppliers">Suppliers</Link>
        <Link to="/products">Products</Link>
        <Link to="/imports">Imports</Link>
        <Link to="/sales">Sales</Link>
      </nav>
      <Routes>
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/imports" element={<Imports />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App
