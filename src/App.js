import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ItemsTable from "./components/ItemsTable";
import AddItem from "./components/AddItem";
import Home from "./components/Home";
import Expenses from "./components/Expenses";
import Other from "./components/Other";
import ExportTransactions from "./components/ExportTransactions";
import MarketValueCalculator from "./components/MarketValueCalculator";

function App() {
  return (
    <Router>
      <div>
        {/* Navbar */}
        <nav
          style={{
            padding: "10px",
            backgroundColor: "#eee",
            marginBottom: "20px",
          }}
        >
          <Link to="/" style={{ marginRight: "20px" }}>
            Home
          </Link>
          <Link to="/inventory" style={{ marginRight: "20px" }}>
            Inventory
          </Link>
          <Link to="/add">Add Item</Link>
          <Link to="/expenses" style={{ marginLeft: "20px" }}>
            Expenses
          </Link>
          <Link to="/other" style={{ marginLeft: "20px" }}>
            Other
          </Link>
          <Link to="/exporttransactions" style={{ marginLeft: "20px" }}>
            Export
          </Link>
          <Link to="/marketvaluecalculator" style={{ marginLeft: "20px" }}>
            Calculator
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<ItemsTable />} />
          <Route path="/add" element={<AddItem />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/other" element={<Other />} />
          <Route path="/exporttransactions" element={<ExportTransactions />} />
          <Route
            path="/marketvaluecalculator"
            element={<MarketValueCalculator />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
