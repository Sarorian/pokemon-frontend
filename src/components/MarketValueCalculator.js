import React, { useState } from "react";

const MarketValueCalculator = () => {
  const [items, setItems] = useState([
    { name: "", marketValue: 0, percent: 0 },
  ]);
  const [total, setTotal] = useState(0);

  // Handle changes to item inputs
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    // Ensure numeric fields are stored as numbers
    if (field === "marketValue" || field === "percent") {
      newItems[index][field] = parseFloat(value) || 0;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
    calculateTotal(newItems);
  };

  // Add a new item row
  const addItem = () => {
    setItems([...items, { name: "", marketValue: 0, percent: 0 }]);
  };

  // Remove an item row
  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    calculateTotal(newItems);
  };

  // Calculate total as sum of (marketValue * percent/100)
  const calculateTotal = (itemsList) => {
    const sum = itemsList.reduce((acc, item) => {
      return acc + item.marketValue * (item.percent / 100);
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
