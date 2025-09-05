import React, { useState } from "react";

const MarketValueCalculator = () => {
  const [items, setItems] = useState([
    { name: "", marketValue: "", percent: "" },
  ]);
  const [total, setTotal] = useState(0);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
    calculateTotal(newItems);
  };

  const addItem = () => {
    setItems([...items, { name: "", marketValue: "", percent: "" }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  const calculateTotal = (itemsList) => {
    const sum = itemsList.reduce((acc, item) => {
      const value = parseFloat(item.marketValue) || 0;
      const pct = parseFloat(item.percent) || 0;
      return acc + value * (1 + pct / 100);
    }, 0);
    setTotal(sum.toFixed(2));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Market Value Calculator</h2>

      {items.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            placeholder="Item Name"
            value={item.name}
            onChange={(e) => handleItemChange(index, "name", e.target.value)}
            style={{ flex: "2 1 120px" }}
          />
          <input
            type="number"
            placeholder="Market Value"
            value={item.marketValue}
            onChange={(e) =>
              handleItemChange(index, "marketValue", e.target.value)
            }
            style={{ flex: "1 1 100px" }}
          />
          <input
            type="number"
            placeholder="%"
            value={item.percent}
            onChange={(e) => handleItemChange(index, "percent", e.target.value)}
            style={{ flex: "1 1 80px" }}
          />
          <button
            onClick={() => removeItem(index)}
            style={{ flex: "0 0 50px" }}
          >
            ✕
          </button>
        </div>
      ))}

      <button onClick={addItem} style={{ marginBottom: "20px" }}>
        + Add Item
      </button>

      <h3>Total: ${total}</h3>
    </div>
  );
};

export default MarketValueCalculator;
