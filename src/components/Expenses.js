import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    date: today(),
    notes: "",
  });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchExpenses = async () => {
    const res = await fetch(`${API_BASE}/api/expenses`);
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({
      name: "",
      category: "",
      amount: "",
      date: today(),
      notes: "",
    });
    showToast("✓ Expense added!");
    fetchExpenses();
  };

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <h1 className="page-title">Expenses</h1>

      <div className="card" style={{ maxWidth: 640, marginBottom: 28 }}>
        <p className="form-label" style={{ marginBottom: 16 }}>
          Add Expense
        </p>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: 14 }}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                className="form-input"
                name="name"
                placeholder="e.g. Binder sleeves"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                name="category"
                placeholder="e.g. Supplies"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                className="form-input"
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              className="form-input"
              name="notes"
              placeholder="Optional..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add Expense
          </button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </span>
        <span style={{ fontWeight: 700, color: "var(--danger)", fontSize: 15 }}>
          Total: -${total.toFixed(2)}
        </span>
      </div>

      {loading ? (
        <div
          className="skeleton"
          style={{ height: 200, borderRadius: "var(--radius)" }}
        />
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: 32,
                    }}
                  >
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td>{exp.name}</td>
                    <td>
                      {exp.category ? (
                        <span
                          className="badge"
                          style={{
                            background: "rgba(255,203,5,0.1)",
                            color: "var(--accent)",
                          }}
                        >
                          {exp.category}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ color: "var(--danger)", fontWeight: 600 }}>
                      ${Number(exp.amount).toFixed(2)}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td
                      style={{
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      {exp.notes || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  );
};

export default Expenses;
