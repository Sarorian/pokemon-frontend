import React, { useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];

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
    purchaseDate: today(),
    soldPrice: "",
    soldDate: "",
    notes: "",
    owner: "Joint",
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    let payload = { itemType, ...formData };

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
        showToast("✓ Item added successfully!");
        setFormData({
          name: "",
          set: "",
          number: "",
          condition: "NM",
          company: "",
          grade: "",
          purchasePrice: "",
          purchaseDate: today(),
          soldPrice: "",
          soldDate: "",
          notes: "",
          owner: "Joint",
        });
      } else {
        showToast("Error: " + data.error, "error");
      }
    } catch (err) {
      showToast("Error: " + err.message, "error");
    }
  };

  return (
    <div>
      <h1 className="page-title">Add New Item</h1>

      <div className="card" style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: 18 }}>
          {/* Type & Owner */}
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Item Type</label>
              <select
                className="form-select"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
              >
                <option value="Card">Card</option>
                <option value="Slab">Slab</option>
                <option value="Sealed">Sealed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Owner</label>
              <select
                className="form-select"
                name="owner"
                value={formData.owner}
                onChange={handleChange}
              >
                <option value="Owen">Owen</option>
                <option value="Ben">Ben</option>
                <option value="Joint">Joint</option>
              </select>
            </div>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              className="form-input"
              name="name"
              placeholder="e.g. Charizard VSTAR"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Set & Number */}
          {(itemType === "Card" || itemType === "Slab") && (
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Set</label>
                <input
                  className="form-input"
                  name="set"
                  placeholder="e.g. Brilliant Stars"
                  value={formData.set}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Number</label>
                <input
                  className="form-input"
                  name="number"
                  placeholder="e.g. 018/172"
                  value={formData.number}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {/* Condition */}
          {itemType === "Card" && (
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-select"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
              >
                <option value="NM">NM – Near Mint</option>
                <option value="LP">LP – Lightly Played</option>
                <option value="MP">MP – Moderately Played</option>
                <option value="HP">HP – Heavily Played</option>
                <option value="D">D – Damaged</option>
              </select>
            </div>
          )}

          {/* Slab fields */}
          {itemType === "Slab" && (
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Grading Company</label>
                <input
                  className="form-input"
                  name="company"
                  placeholder="e.g. PSA, BGS"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Grade</label>
                <input
                  className="form-input"
                  name="grade"
                  placeholder="e.g. 9, 10"
                  value={formData.grade}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="form-divider">Purchase Info</div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Purchase Price *</label>
              <input
                className="form-input"
                type="number"
                name="purchasePrice"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                className="form-input"
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-divider">
            Sold Info{" "}
            <span
              style={{
                fontWeight: 400,
                textTransform: "none",
                letterSpacing: 0,
              }}
            >
              (optional)
            </span>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Sold Price</label>
              <input
                className="form-input"
                type="number"
                name="soldPrice"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.soldPrice}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sold Date</label>
              <input
                className="form-input"
                type="date"
                name="soldDate"
                value={formData.soldDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <input
              className="form-input"
              name="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px" }}
          >
            Add Item
          </button>
        </form>
      </div>

      {toast.msg && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default AddItem;
