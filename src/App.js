import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import ItemsTable from "./components/ItemsTable";
import AddItem from "./components/AddItem";
import Home from "./components/Home";
import Expenses from "./components/Expenses";
import Other from "./components/Other";
import ExportTransactions from "./components/ExportTransactions";
import MarketValueCalculator from "./components/MarketValueCalculator";
import "./App.css";

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? "nav-link--active" : ""}`}>
      {children}
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar__brand">
            <span className="navbar__logo">◆</span>
            <span className="navbar__title">O2 Cards</span>
          </div>
          <div className="navbar__links">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/inventory">Inventory</NavLink>
            <NavLink to="/add">Add Item</NavLink>
            <NavLink to="/expenses">Expenses</NavLink>
            <NavLink to="/other">Other</NavLink>
            <NavLink to="/exporttransactions">Export</NavLink>
            <NavLink to="/marketvaluecalculator">Calculator</NavLink>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inventory" element={<ItemsTable />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/other" element={<Other />} />
            <Route
              path="/exporttransactions"
              element={<ExportTransactions />}
            />
            <Route
              path="/marketvaluecalculator"
              element={<MarketValueCalculator />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
