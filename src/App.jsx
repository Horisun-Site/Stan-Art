// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import Home from "./pages/Home";
// import Shop from "./pages/Shop";
// import Cart from "./Pages/Cart";
// import Admin from "./pages/AdminDashboard";
// import Login from "./pages/Login";
// import ProtectedRoute from "./component/ProtectedRoute";

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/shop" element={<Shop />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route
//           path="/main"
//           element={
//             <ProtectedRoute>
//               <Admin/>
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/login" element={<Login />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;



import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./Pages/Cart";
import Admin from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./component/ProtectedRoute";
import NavigationGuard from "./component/NavigationGuard";

const App = () => {
  return (
    <Router>

      <NavigationGuard />

      <Routes>

        {/* PUBLIC PAGES */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* ADMIN LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PROTECTED ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

      </Routes>

    </Router>
  );
};

export default App;