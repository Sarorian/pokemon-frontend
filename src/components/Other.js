import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const Other = () => {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    notes: "",
  });

  const fetchEntries = async () => {
    const res = await fetch(`${API_BASE}/api/other`);
    const data = await res.json();
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/api/other`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", amount: "", date: "", notes: "" });
    fetchEntries();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Other Profits</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          name="name"
          placeholder="Name/Description"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Profit Amount"
          value={formData.amount}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
        <input
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
        />
        <button type="submit">Add Profit</button>
      </form>

      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.name}</td>
              <td>${entry.amount}</td>
              <td>{new Date(entry.date).toLocaleDateString()}</td>
              <td>{entry.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Other;
