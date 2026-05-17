import React, { useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const ExportTransactions = () => {
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [loading, setLoading] = useState({});

  const exportCSV = async (type) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const endpoint = `${API_BASE}/api/export/${type}?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch CSV");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(`Error exporting ${type}. Check console for details.`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const exports = [
    { type: "transactions", label: "Export Items", icon: "📦" },
    { type: "expenses", label: "Export Expenses", icon: "💸" },
    { type: "other", label: "Export Other", icon: "📊" },
  ];

  return (
    <div>
      <h1 className="page-title">Export Data</h1>

      <div className="card" style={{ maxWidth: 520 }}>
        <p className="form-label" style={{ marginBottom: 16 }}>
          Date Range
        </p>

        <div className="form-grid form-grid-2" style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              className="form-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exports.map(({ type, label, icon }) => (
            <button
              key={type}
              className="btn btn-secondary"
              onClick={() => exportCSV(type)}
              disabled={loading[type]}
              style={{ justifyContent: "flex-start", gap: 10 }}
            >
              <span>{icon}</span>
              <span>{loading[type] ? "Downloading..." : label}</span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {startDate} → {endDate}
              </span>
            </button>
          ))}
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
          Downloads as .csv — open in Excel or Google Sheets.
        </p>
      </div>
    </div>
  );
};

export default ExportTransactions;
