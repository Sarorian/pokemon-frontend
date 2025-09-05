import React, { useState } from "react";
import { API_BASE } from "../config";
const ExportTransactions = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const exportCSV = async (type) => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    try {
      // Backend endpoint based on type
      let endpoint = `${API_BASE}/api/export/${type}?startDate=${startDate}&endDate=${endDate}`;
      console.log("Fetching CSV from:", endpoint);

      const res = await fetch(endpoint, { method: "GET" });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server error:", text);
        throw new Error("Failed to fetch CSV");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_${startDate}_to_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      console.log(`${type} CSV download triggered`);
    } catch (err) {
      console.error(err);
      alert(`Error exporting ${type}. Check console for details.`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Export Data</h2>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ marginRight: "10px" }}>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => exportCSV("transactions")}
          style={{ marginRight: "10px" }}
        >
          Export Items
        </button>
        <button
          onClick={() => exportCSV("expenses")}
          style={{ marginRight: "10px" }}
        >
          Export Expenses
        </button>
        <button onClick={() => exportCSV("other")}>Export Other</button>
      </div>
    </div>
  );
};

export default ExportTransactions;
