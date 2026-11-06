import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Admin from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Add from "./pages/Add";
import ProtectedRoute from "./component/ProtectedRoute";
import { CartProvider } from "./context/CartContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/login"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/add-artwork"
            element={
              <ProtectedRoute>
                <Add />
              </ProtectedRoute>
            }
          />

          {/* Legacy dashboard URL kept so old bookmarks still work. */}
          <Route path="/main" element={<Navigate to="/admin" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
};

export default App;
