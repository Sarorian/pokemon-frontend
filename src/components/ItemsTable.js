import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const today = () => new Date().toISOString().split("T")[0];

const typeBadge = (type) => {
  const cls = {
    Card: "badge-card",
    Slab: "badge-slab",
    Sealed: "badge-sealed",
  };
  return <span className={`badge ${cls[type] || ""}`}>{type}</span>;
};

const paymentBadge = (method) => {
  if (!method || method === "Cash")
    return (
      <span
        className="badge"
        style={{ background: "rgba(76,175,125,0.15)", color: "var(--green)" }}
      >
        Cash
      </span>
    );
  if (method === "Digital - Ben")
    return (
      <span
        className="badge"
        style={{ background: "rgba(74,179,216,0.15)", color: "var(--blue)" }}
      >
        Digital - Ben
      </span>
    );
  if (method === "Digital - Owen")
    return (
      <span
        className="badge"
        style={{ background: "rgba(232,184,75,0.12)", color: "var(--accent)" }}
      >
        Digital - Owen
      </span>
    );
  return null;
};

const ItemsTable = () => {
  const [items, setItems] = useState([]);
  const [showSold, setShowSold] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [soldData, setSoldData] = useState({
    soldPrice: "",
    soldDate: today(),
    paymentMethod: "Cash",
    notes: "",
  });
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [loading, setLoading] = useState(true);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const fetchItems = async () => {
    const res = await fetch(`${API_BASE}/api/items`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditChange = (e) =>
    setSoldData({ ...soldData, [e.target.name]: e.target.value });

  const handleMarkSold = (item) => {
    setEditingItemId(item._id);
    setSoldData({
      soldPrice: "",
      soldDate: today(),
      paymentMethod: "Cash",
      notes: item.notes || "",
    });
  };

  const handleSubmit = async (itemId) => {
    const res = await fetch(`${API_BASE}/api/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soldData),
    });
    if (res.ok) {
      setEditingItemId(null);
      setSoldData({
        soldPrice: "",
        soldDate: today(),
        paymentMethod: "Cash",
        notes: "",
      });
      showToast("✓ Item marked as sold!");
      fetchItems();
    } else {
      const data = await res.json();
      showToast("Error: " + data.error, "error");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`${API_BASE}/api/items/${id}`, { method: "DELETE" });
    showToast("Item deleted.");
    fetchItems();
  };

  const filteredItems = items.filter((item) => {
    const soldCondition = showSold || item.soldPrice == null;
    const typeCondition = typeFilter === "All" || item.itemType === typeFilter;
    const q = searchQuery.toLowerCase();
    const searchCondition =
      item.name.toLowerCase().includes(q) ||
      (item.set && item.set.toLowerCase().includes(q)) ||
      (item.number && item.number.toLowerCase().includes(q)) ||
      (item.owner && item.owner.toLowerCase().includes(q));
    return soldCondition && typeCondition && searchCondition;
  });

  if (loading) {
    return (
      <div>
        <h1 className="page-title">Inventory</h1>
        <div className="inventory-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="card">
                <div
                  className="skeleton"
                  style={{ height: 16, width: "70%", marginBottom: 14 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 12, width: "50%", marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 12, width: "90%", marginBottom: 8 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 12, width: "60%" }}
                />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h1 className="page-title" style={{ marginBottom: 0 }}>
          Inventory
        </h1>
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
          {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="filter-bar">
        <button
          className={`btn btn-sm ${showSold ? "btn-secondary" : "btn-primary"}`}
          onClick={() => setShowSold((p) => !p)}
        >
          {showSold ? "Hide Sold" : "Show Sold"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="form-label" style={{ marginBottom: 0 }}>
            Type:
          </span>
          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="All">All</option>
            <option value="Card">Card</option>
            <option value="Slab">Slab</option>
            <option value="Sealed">Sealed</option>
          </select>
        </div>

        <input
          type="text"
          className="form-input"
          placeholder="Search name, set, number, owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: "1 1 200px" }}
        />
      </div>

      {filteredItems.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 48,
            color: "var(--text-muted)",
          }}
        >
          No items match your filters.
        </div>
      ) : (
        <div className="inventory-grid">
          {filteredItems.map((item) => {
            const profit =
              item.soldPrice != null
                ? Number(item.soldPrice) - Number(item.purchasePrice)
                : null;

            return (
              <div
                key={item._id}
                className={`item-card ${item.soldPrice != null ? "item-card--sold" : ""}`}
              >
                <div className="item-card__header">
                  <div className="item-card__name">{item.name}</div>
                  <div
                    style={{
                      display: "flex",
                      gap: 5,
                      flexShrink: 0,
                      flexWrap: "wrap",
                    }}
                  >
                    {typeBadge(item.itemType)}
                    {item.soldPrice != null ? (
                      <span className="badge badge-sold">Sold</span>
                    ) : (
                      <span className="badge badge-unsold">Active</span>
                    )}
                  </div>
                </div>

                {item.itemType === "Card" && (
                  <div className="item-card__row">
                    <span className="item-card__row-label">Set / # / Cond</span>
                    <span className="item-card__row-value">
                      {item.set || "—"} · {item.number || "—"} ·{" "}
                      {item.condition || "—"}
                    </span>
                  </div>
                )}
                {item.itemType === "Slab" && (
                  <div className="item-card__row">
                    <span className="item-card__row-label">Grade</span>
                    <span className="item-card__row-value">
                      {item.company || "—"} {item.grade || "—"}
                    </span>
                  </div>
                )}

                <div className="item-card__row">
                  <span className="item-card__row-label">Owner</span>
                  <span className="item-card__row-value">
                    {item.owner || "—"}
                  </span>
                </div>

                <div className="item-card__row">
                  <span className="item-card__row-label">Bought</span>
                  <span className="item-card__row-value">
                    ${Number(item.purchasePrice).toFixed(2)}
                    {item.purchaseDate
                      ? ` · ${new Date(item.purchaseDate).toLocaleDateString()}`
                      : ""}
                  </span>
                </div>

                {item.soldPrice != null && (
                  <>
                    <div className="item-card__row">
                      <span className="item-card__row-label">Sold</span>
                      <span className="item-card__row-value">
                        ${Number(item.soldPrice).toFixed(2)}
                        {item.soldDate
                          ? ` · ${new Date(item.soldDate).toLocaleDateString()}`
                          : ""}
                      </span>
                    </div>
                    <div className="item-card__row">
                      <span className="item-card__row-label">Payment</span>
                      <span className="item-card__row-value">
                        {paymentBadge(item.paymentMethod)}
                      </span>
                    </div>
                  </>
                )}

                {profit !== null && (
                  <div className="item-card__row">
                    <span className="item-card__row-label">Profit</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: profit >= 0 ? "var(--green)" : "var(--danger)",
                      }}
                    >
                      {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                    </span>
                  </div>
                )}

                {item.notes && (
                  <div className="item-card__row">
                    <span className="item-card__row-label">Notes</span>
                    <span
                      className="item-card__row-value"
                      style={{ fontStyle: "italic" }}
                    >
                      {item.notes}
                    </span>
                  </div>
                )}

                {/* Mark as Sold inline form */}
                {item.soldPrice == null && editingItemId === item._id && (
                  <div className="sell-form">
                    <div className="form-group">
                      <label className="form-label">Sold Price</label>
                      <input
                        type="number"
                        name="soldPrice"
                        className="form-input"
                        value={soldData.soldPrice}
                        onChange={handleEditChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        autoFocus
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sold Date</label>
                      <input
                        type="date"
                        name="soldDate"
                        className="form-input"
                        value={soldData.soldDate}
                        onChange={handleEditChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        name="paymentMethod"
                        className="form-select"
                        value={soldData.paymentMethod}
                        onChange={handleEditChange}
                      >
                        <option value="Cash">Cash</option>
                        <option value="Digital - Ben">Digital - Ben</option>
                        <option value="Digital - Owen">Digital - Owen</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        className="form-input"
                        value={soldData.notes}
                        onChange={handleEditChange}
                        placeholder="Optional..."
                      />
                    </div>
                  </div>
                )}

                <div className="item-card__actions">
                  {item.soldPrice == null &&
                    (editingItemId === item._id ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleSubmit(item._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingItemId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMarkSold(item)}
                      >
                        Mark as Sold
                      </button>
                    ))}
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item._id, item.name)}
                    style={{ marginLeft: "auto" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast.msg && (
        <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
};

export default ItemsTable;
