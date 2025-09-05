import React, { useState } from "react";
import { API_BASE } from "../config";

const AddItem = () => {
  const [itemType, setItemType] = useState("Card");
  const [formData, setFormData] = useState({
    name: "",
    set: "",
    number: "",
    condition: "NM",
    company: "",
    grade: "",
    purchasePrice: "",
    purchaseDate: "",
    soldPrice: "",
    soldDate: "",
    notes: "",
    owner: "Joint",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload = { itemType, ...formData };

    // Remove irrelevant fields
    if (itemType === "Card") {
      delete payload.company;
      delete payload.grade;
    } else if (itemType === "Slab") {
      delete payload.condition;
    } else if (itemType === "Sealed") {
      delete payload.set;
      delete payload.number;
      delete payload.condition;
      delete payload.company;
      delete payload.grade;
    }

    try {
      const res = await fetch(`${API_BASE}/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Item added successfully!");
        setFormData({
          name: "",
          set: "",
          number: "",
          condition: "NM",
          company: "",
          grade: "",
          purchasePrice: "",
          purchaseDate: "",
          soldPrice: "",
          soldDate: "",
          notes: "",
          owner: "Joint",
        });
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Add New Item
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* Item Type & Owner */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <label style={{ flex: "1 1 200px" }}>
            Item Type:
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              style={{ marginLeft: "5px", width: "100%" }}
            >
              <option value="Card">Card</option>
              <option value="Slab">Slab</option>
              <option value="Sealed">Sealed</option>
            </select>
          </label>

          <label style={{ flex: "1 1 200px" }}>
            Owner:
            <select
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              style={{ marginLeft: "5px", width: "100%" }}
            >
              <option value="Owen">Owen</option>
              <option value="Ben">Ben</option>
              <option value="Joint">Joint</option>
            </select>
          </label>
        </div>

        {/* Name */}
        <input
          name="name"
          placeholder="Item Name"
          value={formData.name}
          onChange={handleChange}
          required
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* Card / Slab Fields */}
        {(itemType === "Card" || itemType === "Slab") && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <input
              name="set"
              placeholder="Set"
              value={formData.set}
              onChange={handleChange}
              style={{
                flex: "1 1 100px",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <input
              name="number"
              placeholder="Number"
              value={formData.number}
              onChange={handleChange}
              style={{
                flex: "1 1 100px",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        {/* Condition */}
        {itemType === "Card" && (
          <select
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            style={{
              padding: "8px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
          >
            <option value="NM">NM</option>
            <option value="LP">LP</option>
            <option value="MP">MP</option>
            <option value="HP">HP</option>
            <option value="D">D</option>
          </select>
        )}

        {/* Slab Fields */}
        {itemType === "Slab" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <input
              name="company"
              placeholder="Company"
              value={formData.company}
              onChange={handleChange}
              style={{
                flex: "1 1 150px",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <input
              name="grade"
              placeholder="Grade"
              value={formData.grade}
              onChange={handleChange}
              style={{
                flex: "1 1 100px",
                padding: "8px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        )}

        {/* Purchase Info */}
        <input
          type="number"
          name="purchasePrice"
          placeholder="Purchase Price"
          value={formData.purchasePrice}
          onChange={handleChange}
          required
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="date"
          name="purchaseDate"
          value={formData.purchaseDate}
          onChange={handleChange}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* Sold Info */}
        <input
          type="number"
          name="soldPrice"
          placeholder="Sold Price"
          value={formData.soldPrice}
          onChange={handleChange}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="date"
          name="soldDate"
          value={formData.soldDate}
          onChange={handleChange}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        {/* Notes */}
        <input
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "10px",
            borderRadius: "5px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
          }}
        >
          Add Item
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "15px", textAlign: "center" }}>{message}</p>
      )}
    </div>
  );
};

export default AddItem;
