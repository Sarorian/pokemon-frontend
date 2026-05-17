import React, { useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];

const defaultItem = () => ({
  name: "",
  itemType: "Card",
  set: "",
  number: "",
  condition: "NM",
  company: "PSA",
  grade: "",
  marketValue: "",
  percent: "",
  purchasePrice: "",
  owner: "Joint",
});

const MarketValueCalculator = () => {
  const [items, setItems] = useState([defaultItem()]);
  const [globalPercent, setGlobalPercent] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [buying, setBuying] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Auto-calculate purchase price when market value or percent changes
    if (field === "marketValue" || field === "percent") {
      const mv =
        field === "marketValue"
          ? parseFloat(value) || 0
          : parseFloat(newItems[index].marketValue) || 0;
      const pct =
        field === "percent"
          ? parseFloat(value) || 0
          : parseFloat(newItems[index].percent) || 0;
      newItems[index].purchasePrice =
        pct > 0 ? (mv * (pct / 100)).toFixed(2) : newItems[index].purchasePrice;
    }

    setItems(newItems);
  };

  const addItem = () =>
    setItems([...items, { ...defaultItem(), percent: globalPercent }]);

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleGlobalPercentChange = (value) => {
    setGlobalPercent(value);
    const pct = parseFloat(value) || 0;
    setItems(
      items.map((item) => {
        const mv = parseFloat(item.marketValue) || 0;
        return {
          ...item,
          percent: value,
          purchasePrice:
            pct > 0 && mv > 0
              ? (mv * (pct / 100)).toFixed(2)
              : item.purchasePrice,
        };
      }),
    );
  };

  const total = items.reduce((acc, item) => {
    const mv = parseFloat(item.marketValue) || 0;
    const pct = parseFloat(item.percent) || 0;
    return acc + mv * (pct / 100);
  }, 0);

  const handleBuyCards = async () => {
    const incomplete = items.filter(
      (item) => !item.name || !item.purchasePrice,
    );
    if (incomplete.length > 0) {
      showToast("All items need a name and purchase price.", "error");
      return;
    }

    setBuying(true);
    let successCount = 0;
    let errors = [];

    for (const item of items) {
      const payload = {
        itemType: item.itemType,
        name: item.name,
        purchasePrice: parseFloat(item.purchasePrice),
        purchaseDate,
        owner: item.owner,
        notes: "",
      };

      if (item.itemType === "Card") {
        payload.set = item.set;
        payload.number = item.number;
        payload.condition = item.condition;
      } else if (item.itemType === "Slab") {
        payload.set = item.set;
        payload.number = item.number;
        payload.company = item.company;
        payload.grade = item.grade;
      }

      try {
        const res = await fetch(`${API_BASE}/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          successCount++;
        } else {
          const data = await res.json();
          errors.push(`${item.name}: ${data.error}`);
        }
      } catch (err) {
        errors.push(`${item.name}: ${err.message}`);
      }
    }

    setBuying(false);

    if (errors.length === 0) {
      showToast(
        `✓ ${successCount} item${successCount !== 1 ? "s" : ""} added to inventory!`,
      );
      setItems([defaultItem()]);
      setGlobalPercent("");
    } else {
      showToast(
        `${successCount} added, ${errors.length} failed: ${errors.join("; ")}`,
        "error",
      );
    }
  };

  return (
    <div>
      <h1 className="page-title">Market Value Calculator</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        {/* Global controls */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: "1px solid var(--border)",
            alignItems: "flex-end",
          }}
        >
          <div className="form-group" style={{ flex: "0 0 160px" }}>
            <label className="form-label">Set All %</label>
            <input
              type="number"
              className="form-input"
              value={globalPercent}
              onChange={(e) => handleGlobalPercentChange(e.target.value)}
              placeholder="e.g. 80"
              min="0"
              max="100"
            />
          </div>
          <div className="form-group" style={{ flex: "0 0 180px" }}>
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              className="form-input"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div className="form-label">Total Cost</div>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  color: "var(--accent)",
                  letterSpacing: 1,
                }}
              >
                ${total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Item rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                background: "var(--bg)",
                borderRadius: "var(--radius-sm)",
                padding: 14,
                border: "1px solid var(--border)",
              }}
            >
              {/* Row header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                  }}
                >
                  Item {index + 1}
                  {item.name && (
                    <span style={{ color: "var(--text)", marginLeft: 8 }}>
                      — {item.name}
                    </span>
                  )}
                </span>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(index)}
                  style={{ padding: "3px 10px" }}
                >
                  ✕
                </button>
              </div>

              {/* Type, Owner, Name */}
              <div
                className="form-grid form-grid-3"
                style={{ marginBottom: 10 }}
              >
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={item.itemType}
                    onChange={(e) =>
                      handleItemChange(index, "itemType", e.target.value)
                    }
                  >
                    <option value="Card">Card</option>
                    <option value="Slab">Slab</option>
                    <option value="Sealed">Sealed</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: "span 2" }}>
                  <label className="form-label">Item Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Charizard VSTAR"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Card-specific fields */}
              {item.itemType === "Card" && (
                <div
                  className="form-grid form-grid-3"
                  style={{ marginBottom: 10 }}
                >
                  <div className="form-group">
                    <label className="form-label">Set</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Brilliant Stars"
                      value={item.set}
                      onChange={(e) =>
                        handleItemChange(index, "set", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 018/172"
                      value={item.number}
                      onChange={(e) =>
                        handleItemChange(index, "number", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Condition</label>
                    <select
                      className="form-select"
                      value={item.condition}
                      onChange={(e) =>
                        handleItemChange(index, "condition", e.target.value)
                      }
                    >
                      <option value="NM">NM</option>
                      <option value="LP">LP</option>
                      <option value="MP">MP</option>
                      <option value="HP">HP</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Slab-specific fields */}
              {item.itemType === "Slab" && (
                <div
                  className="form-grid form-grid-3"
                  style={{ marginBottom: 10 }}
                >
                  <div className="form-group">
                    <label className="form-label">Set</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Base Set"
                      value={item.set}
                      onChange={(e) =>
                        handleItemChange(index, "set", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 4/102"
                      value={item.number}
                      onChange={(e) =>
                        handleItemChange(index, "number", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <select
                      className="form-select"
                      value={item.company}
                      onChange={(e) =>
                        handleItemChange(index, "company", e.target.value)
                      }
                    >
                      <option value="PSA">PSA</option>
                      <option value="BGS">BGS</option>
                      <option value="CGC">CGC</option>
                      <option value="TAG">TAG</option>
                      <option value="SGC">SGC</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Grade</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 9, 10"
                      value={item.grade}
                      onChange={(e) =>
                        handleItemChange(index, "grade", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}

              {/* Pricing row */}
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label className="form-label">Market Value ($)</label>
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
                </div>
                <div className="form-group">
                  <label className="form-label">% of Value</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 80"
                    value={item.percent}
                    onChange={(e) =>
                      handleItemChange(index, "percent", e.target.value)
                    }
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Purchase Price ($) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0.00"
                    value={item.purchasePrice}
                    onChange={(e) =>
                      handleItemChange(index, "purchasePrice", e.target.value)
                    }
                    min="0"
                    step="0.01"
                    style={{
                      borderColor: item.purchasePrice
                        ? "var(--border)"
                        : "rgba(255,203,5,0.4)",
                    }}
                  />
                </div>
              </div>

              {/* Owner */}
              <div
                className="form-group"
                style={{ marginTop: 10, maxWidth: 180 }}
              >
                <label className="form-label">Owner</label>
                <select
                  className="form-select"
                  value={item.owner}
                  onChange={(e) =>
                    handleItemChange(index, "owner", e.target.value)
                  }
                >
                  <option value="Owen">Owen</option>
                  <option value="Ben">Ben</option>
                  <option value="Joint">Joint</option>
                </select>
              </div>

              {/* Per-item calculated value */}
              {item.marketValue && item.percent && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: "var(--text-muted)",
                  }}
                >
                  {item.percent}% of ${parseFloat(item.marketValue).toFixed(2)}{" "}
                  ={" "}
                  <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                    $
                    {(
                      parseFloat(item.marketValue) *
                      (parseFloat(item.percent) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={addItem}
          style={{ marginTop: 16 }}
        >
          + Add Item
        </button>
      </div>

      {/* Breakdown + Buy */}
      {items.some((i) => parseFloat(i.marketValue) > 0) && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="form-label" style={{ marginBottom: 12 }}>
            Breakdown
          </p>
          {items
            .filter((i) => i.name || parseFloat(i.marketValue) > 0)
            .map((item, i) => {
              const mv = parseFloat(item.marketValue) || 0;
              const pct = parseFloat(item.percent) || 0;
              const val = mv * (pct / 100);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    padding: "5px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>
                    {item.name || `Item ${i + 1}`}
                    {item.condition && item.itemType === "Card" && (
                      <span style={{ marginLeft: 6, opacity: 0.6 }}>
                        [{item.condition}]
                      </span>
                    )}
                    {item.grade && item.itemType === "Slab" && (
                      <span style={{ marginLeft: 6, opacity: 0.6 }}>
                        [{item.company} {item.grade}]
                      </span>
                    )}
                    {pct > 0 && <span style={{ marginLeft: 6 }}>({pct}%)</span>}
                  </span>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>
                    ${val.toFixed(2)}
                  </span>
                </div>
              );
            })}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22,
              letterSpacing: 1,
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>Total</span>
            <span style={{ color: "var(--accent)" }}>${total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Buy Cards button */}
      <button
        className="btn btn-primary"
        onClick={handleBuyCards}
        disabled={buying}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: 16,
          letterSpacing: "0.5px",
        }}
      >
        {buying
          ? "Adding to Inventory..."
          : `🛒 Buy Cards — Add ${items.length} Item${items.length !== 1 ? "s" : ""} to Inventory`}
      </button>

      {toast.msg && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default MarketValueCalculator;
