import React, { useState } from "react";
import * as XLSX from "xlsx";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];
const thirtyDaysAgo = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
};

const fmt = (n) => `$${Number(n).toFixed(2)}`;

const SummaryCard = ({ label, value, color, sub }) => (
  <div className="stat-card">
    <div className="stat-card__label">{label}</div>
    <div
      className="stat-card__value"
      style={{ color: color || "var(--text)", fontSize: 28 }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
        {sub}
      </div>
    )}
  </div>
);

const ExportTransactions = () => {
  const [startDate, setStartDate] = useState(thirtyDaysAgo());
  const [endDate, setEndDate] = useState(today());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/export/summary?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      setError("Could not load summary. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const downloadExcel = () => {
    if (!summary) return;

    const wb = XLSX.utils.book_new();

    // ── Summary sheet ──
    const summaryData = [
      ["Statis Cards — Session Summary"],
      [`Date Range: ${startDate} to ${endDate}`],
      [],
      ["METRIC", "AMOUNT"],
      ["Total Money In", summary.totalMoneyIn],
      ["Total Profit", summary.totalProfit],
      ["Total Cash", summary.totalCash],
      ["Total Digital (needs conversion)", summary.totalDigital],
      ["  Digital - Ben", summary.digitalBen],
      ["  Digital - Owen", summary.digitalOwen],
      [],
      ["Items Sold", summary.itemCount],
      ["Other Profit Entries", summary.otherCount],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 36 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

    // ── Sales sheet ──
    if (summary.items.length > 0) {
      const salesHeaders = [
        "Name",
        "Type",
        "Owner",
        "Purchase Price",
        "Sold Price",
        "Profit",
        "Payment Method",
        "Sold Date",
      ];
      const salesRows = summary.items.map((r) => [
        r.name,
        r.itemType,
        r.owner,
        r.purchasePrice,
        r.soldPrice,
        r.profit,
        r.paymentMethod,
        r.soldDate,
      ]);
      const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesRows]);
      salesSheet["!cols"] = [
        { wch: 30 },
        { wch: 10 },
        { wch: 10 },
        { wch: 14 },
        { wch: 12 },
        { wch: 10 },
        { wch: 18 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(wb, salesSheet, "Sales");
    }

    // ── Other Profits sheet ──
    if (summary.other.length > 0) {
      const otherHeaders = ["Name", "Amount", "Date", "Notes"];
      const otherRows = summary.other.map((r) => [
        r.name,
        r.amount,
        r.date,
        r.notes,
      ]);
      const otherSheet = XLSX.utils.aoa_to_sheet([otherHeaders, ...otherRows]);
      otherSheet["!cols"] = [
        { wch: 30 },
        { wch: 12 },
        { wch: 14 },
        { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, otherSheet, "Other Profits");
    }

    XLSX.writeFile(wb, `statis_cards_${startDate}_to_${endDate}.xlsx`);
  };

  // Legacy CSV downloads
  const downloadCSV = async (type) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/export/${type}?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(`Error downloading ${type} CSV.`);
    }
  };

  return (
    <div>
      <h1 className="page-title">Export & Session Summary</h1>

      {/* Date picker */}
      <div className="card" style={{ marginBottom: 24 }}>
        <p className="form-label" style={{ marginBottom: 16 }}>
          Select Date Range
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <div className="form-group" style={{ flex: "0 0 180px" }}>
            <label className="form-label">Start Date</label>
            <input
              className="form-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: "0 0 180px" }}>
            <label className="form-label">End Date</label>
            <input
              className="form-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={fetchSummary}
            disabled={loading}
            style={{ height: 42 }}
          >
            {loading ? "Loading..." : "Generate Summary"}
          </button>
        </div>
        {error && (
          <p style={{ color: "var(--danger)", marginTop: 12, fontSize: 14 }}>
            {error}
          </p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: 1,
                color: "var(--text-muted)",
              }}
            >
              Session Results — {summary.itemCount} sale
              {summary.itemCount !== 1 ? "s" : ""} + {summary.otherCount} other
              entr{summary.otherCount !== 1 ? "ies" : "y"}
            </h2>
            <button className="btn btn-success" onClick={downloadExcel}>
              ⬇ Download Excel
            </button>
          </div>

          {/* Key numbers */}
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            <div
              className="stat-card stat-card--accent"
              style={{ gridColumn: "span 2" }}
            >
              <div className="stat-card__label">Total Money In</div>
              <div
                className="stat-card__value"
                style={{ fontSize: 44, color: "var(--green)" }}
              >
                {fmt(summary.totalMoneyIn)}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                Total revenue collected (sold price of all items + other
                profits)
              </div>
            </div>
            <SummaryCard
              label="Total Profit"
              value={fmt(summary.totalProfit)}
              color={
                summary.totalProfit >= 0 ? "var(--green)" : "var(--danger)"
              }
              sub="After subtracting purchase costs"
            />
          </div>

          {/* Cash vs Digital */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <SummaryCard
              label="Already Cash"
              value={fmt(summary.totalCash)}
              color="var(--green)"
              sub="No action needed"
            />
            <SummaryCard
              label="Digital — Ben needs to convert"
              value={fmt(summary.digitalBen)}
              color="var(--blue)"
              sub="Venmo / Apple Cash / Zelle → cash"
            />
            <SummaryCard
              label="Digital — Owen needs to convert"
              value={fmt(summary.digitalOwen)}
              color="var(--accent)"
              sub="Venmo / Apple Cash / Zelle → cash"
            />
            <SummaryCard
              label="Total Digital"
              value={fmt(summary.totalDigital)}
              color="var(--text-muted)"
              sub="Combined conversion needed"
            />
          </div>

          {/* Sales breakdown table */}
          {summary.items.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                Sales Breakdown
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Owner</th>
                      <th>Bought</th>
                      <th>Sold</th>
                      <th>Profit</th>
                      <th>Payment</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {item.owner}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {fmt(item.purchasePrice)}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {fmt(item.soldPrice)}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color:
                              item.profit >= 0
                                ? "var(--green)"
                                : "var(--danger)",
                          }}
                        >
                          {item.profit >= 0 ? "+" : ""}
                          {fmt(item.profit)}
                        </td>
                        <td>
                          {item.paymentMethod === "Cash" && (
                            <span
                              className="badge"
                              style={{
                                background: "rgba(76,175,125,0.15)",
                                color: "var(--green)",
                              }}
                            >
                              Cash
                            </span>
                          )}
                          {item.paymentMethod === "Digital - Ben" && (
                            <span
                              className="badge"
                              style={{
                                background: "rgba(74,179,216,0.15)",
                                color: "var(--blue)",
                              }}
                            >
                              Digital - Ben
                            </span>
                          )}
                          {item.paymentMethod === "Digital - Owen" && (
                            <span
                              className="badge"
                              style={{
                                background: "rgba(232,184,75,0.12)",
                                color: "var(--accent)",
                              }}
                            >
                              Digital - Owen
                            </span>
                          )}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>
                          {item.soldDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other profits table */}
          {summary.other.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20,
                  letterSpacing: 1,
                  marginBottom: 12,
                }}
              >
                Other Profits
              </h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.other.map((o, i) => (
                      <tr key={i}>
                        <td>{o.name}</td>
                        <td style={{ color: "var(--green)", fontWeight: 600 }}>
                          +{fmt(o.amount)}
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{o.date}</td>
                        <td
                          style={{
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          {o.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            className="btn btn-success"
            onClick={downloadExcel}
            style={{ width: "100%", padding: 14, fontSize: 15 }}
          >
            ⬇ Download Excel Report
          </button>
        </>
      )}

      {/* Legacy CSV downloads */}
      <div
        style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: "1px solid var(--border)",
        }}
      >
        <p className="form-label" style={{ marginBottom: 12 }}>
          Raw CSV Downloads
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["transactions", "expenses", "other"].map((type) => (
            <button
              key={type}
              className="btn btn-secondary btn-sm"
              onClick={() => downloadCSV(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} CSV
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExportTransactions;
