import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];

const Other = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: today(),
    notes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const fetchEntries = async () => {
    const res = await fetch(`${API_BASE}/api/other`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleEditChange = (e) =>
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/other`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      setFormData({ name: "", amount: "", date: today(), notes: "" });
      showToast("✓ Profit entry added!");
      fetchEntries();
    } else {
      const data = await res.json();
      showToast("Error: " + data.error, "error");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setEditData({
      name: entry.name,
      amount: entry.amount,
      date: entry.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : today(),
      notes: entry.notes || "",
    });
  };

  const handleEditSave = async (id) => {
    const res = await fetch(`${API_BASE}/api/other/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      setEditingId(null);
      showToast("✓ Entry updated!");
      fetchEntries();
    } else {
      const data = await res.json();
      showToast("Error: " + data.error, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    await fetch(`${API_BASE}/api/other/${id}`, { method: "DELETE" });
    showToast("Entry deleted.");
    fetchEntries();
  };

  const total = entries.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div>
      <h1 className="page-title">Other Profits</h1>

      <div className="card" style={{ maxWidth: 640, marginBottom: 28 }}>
        <p className="form-label" style={{ marginBottom: 16 }}>
          Add Profit Entry
        </p>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: 14 }}>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Name / Description *</label>
              <input
                className="form-input"
                name="name"
                placeholder="e.g. Trade profit"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Profit Amount *</label>
              <input
                className="form-input"
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-grid form-grid-2">
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
          </div>
          <button type="submit" className="btn btn-primary">
            Add Profit
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
          {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
        </span>
        <span style={{ fontWeight: 700, color: "var(--green)", fontSize: 15 }}>
          Total: +${total.toFixed(2)}
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
                <th>Amount</th>
                <th>Date</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      padding: 32,
                    }}
                  >
                    No entries yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id}>
                    {editingId === entry._id ? (
                      <>
                        <td>
                          <input
                            className="form-input"
                            name="name"
                            value={editData.name}
                            onChange={handleEditChange}
                            style={{ minWidth: 120 }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="number"
                            name="amount"
                            value={editData.amount}
                            onChange={handleEditChange}
                            style={{ minWidth: 80 }}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            type="date"
                            name="date"
                            value={editData.date}
                            onChange={handleEditChange}
                          />
                        </td>
                        <td>
                          <input
                            className="form-input"
                            name="notes"
                            value={editData.notes}
                            onChange={handleEditChange}
                            style={{ minWidth: 100 }}
                          />
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditSave(entry._id)}
                            >
                              Save
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{entry.name}</td>
                        <td style={{ color: "var(--green)", fontWeight: 600 }}>
                          +${Number(entry.amount).toFixed(2)}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {new Date(entry.date).toLocaleDateString()}
                        </td>
                        <td
                          style={{
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          {entry.notes || "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleEdit(entry)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(entry._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {toast.msg && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default Other;
