import React, { useState } from "react";

const MarketValueCalculator = () => {
  const [items, setItems] = useState([
    { name: "", marketValue: 0, percent: 0 },
  ]);
  const [globalPercent, setGlobalPercent] = useState(0);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] =
      field === "marketValue" || field === "percent"
        ? parseFloat(value) || 0
        : value;
    setItems(newItems);
  };

  const addItem = () =>
    setItems([...items, { name: "", marketValue: 0, percent: globalPercent }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleGlobalPercentChange = (value) => {
    const percent = parseFloat(value) || 0;
    setGlobalPercent(percent);
    setItems(items.map((item) => ({ ...item, percent })));
  };

  const total = items.reduce(
    (acc, item) => acc + item.marketValue * (item.percent / 100),
    0,
  );

  return (
    <div>
      <h1 className="page-title">Market Value Calculator</h1>

      <div className="card" style={{ maxWidth: 640 }}>
        {/* Global % setter */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            className="form-label"
            style={{ marginBottom: 0, whiteSpace: "nowrap" }}
          >
            Set All %:
          </span>
          <input
            type="number"
            className="form-input"
            value={globalPercent}
            onChange={(e) => handleGlobalPercentChange(e.target.value)}
            style={{ width: 100 }}
            min="0"
            max="100"
          />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Applied to all rows
          </span>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 36px",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span className="form-label">Item Name</span>
          <span className="form-label">Market Value</span>
          <span className="form-label">% of Value</span>
          <span />
        </div>

        {/* Item rows */}
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 36px",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <input
              className="form-input"
              placeholder="Item name"
              value={item.name}
              onChange={(e) => handleItemChange(index, "name", e.target.value)}
            />
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              value={item.marketValue}
              onChange={(e) =>
                handleItemChange(index, "marketValue", e.target.value)
              }
              min="0"
              step="0.01"
            />
            <input
              type="number"
              className="form-input"
              placeholder="%"
              value={item.percent}
              onChange={(e) =>
                handleItemChange(index, "percent", e.target.value)
              }
              min="0"
              max="100"
            />
            <button
              className="btn btn-danger btn-sm"
              onClick={() => removeItem(index)}
              style={{ padding: "0 10px" }}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          className="btn btn-secondary btn-sm"
          onClick={addItem}
          style={{ marginTop: 8, marginBottom: 24 }}
        >
          + Add Item
        </button>

        {/* Total */}
        <div
          style={{
            borderTop: "2px solid var(--border)",
            paddingTop: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 20,
              letterSpacing: 1,
              color: "var(--text-muted)",
            }}
          >
            Total
          </span>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32,
              color: "var(--accent)",
              letterSpacing: 1,
            }}
          >
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Per-item breakdown */}
        {items.some((i) => i.marketValue > 0) && (
          <div
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
          >
            <p className="form-label" style={{ marginBottom: 10 }}>
              Breakdown
            </p>
            {items
              .filter((i) => i.marketValue > 0)
              .map((item, i) => {
                const val = item.marketValue * (item.percent / 100);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      padding: "4px 0",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>
                      {item.name || `Item ${i + 1}`} ({item.percent}%)
                    </span>
                    <span style={{ color: "var(--text)" }}>
                      ${val.toFixed(2)}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketValueCalculator;
