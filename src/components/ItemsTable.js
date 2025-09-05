import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const ItemsTable = () => {
  const [items, setItems] = useState([]);
  const [showSold, setShowSold] = useState(false);
  const [typeFilter, setTypeFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [soldData, setSoldData] = useState({
    soldPrice: "",
    soldDate: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const res = await fetch(`${API_BASE}/api/items`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleEditChange = (e) => {
    setSoldData({ ...soldData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (itemId) => {
    await fetch(`${API_BASE}/api/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(soldData),
    });
    setEditingItemId(null);
    setSoldData({ soldPrice: "", soldDate: "", notes: "" });
    fetchItems();
  };

  if (loading) return <p>Loading...</p>;

  // Filtered & searched items
  const filteredItems = items.filter((item) => {
    const soldCondition = showSold || item.soldPrice == null;
    const typeCondition = typeFilter === "All" || item.itemType === typeFilter;
    const searchCondition =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.set &&
        item.set.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.number &&
        item.number.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.owner &&
        item.owner.toLowerCase().includes(searchQuery.toLowerCase()));
    return soldCondition && typeCondition && searchCondition;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inventory</h2>

      {/* Filters & Search */}
      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button onClick={() => setShowSold((prev) => !prev)}>
          {showSold ? "Hide Sold Items" : "Show Sold Items"}
        </button>

        <label>
          Filter by Type:{" "}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Card">Card</option>
            <option value="Slab">Slab</option>
            <option value="Sealed">Sealed</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Search by Name, Set, Number, Owner..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: "1 1 200px", padding: "5px" }}
        />
      </div>

      {/* Items as responsive cards */}
      <div
        style={{
          display: "grid",
          gap: "15px",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>
              {item.name} ({item.itemType})
            </h3>

            <div style={{ marginBottom: "8px" }}>
              <strong>Details:</strong>
              {item.itemType === "Card" && (
                <div>
                  Set: {item.set || "-"} | Number: {item.number || "-"} | Cond:{" "}
                  {item.condition || "-"}
                </div>
              )}
              {item.itemType === "Slab" && (
                <div>
                  Company: {item.company || "-"} | Set: {item.set || "-"} |
                  Grade: {item.grade || "-"}
                </div>
              )}
              {item.itemType === "Sealed" && <div>-</div>}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Purchase:</strong>
              <div>Price: ${item.purchasePrice}</div>
              <div>
                Date:{" "}
                {item.purchaseDate
                  ? new Date(item.purchaseDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Sold:</strong>
              {editingItemId === item._id ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >
                  <input
                    type="number"
                    name="soldPrice"
                    value={soldData.soldPrice}
                    onChange={handleEditChange}
                    placeholder="Price"
                  />
                  <input
                    type="date"
                    name="soldDate"
                    value={soldData.soldDate}
                    onChange={handleEditChange}
                  />
                </div>
              ) : item.soldPrice != null ? (
                <div>
                  <div>Price: ${item.soldPrice}</div>
                  <div>
                    Date: {new Date(item.soldDate).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div>-</div>
              )}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <strong>Notes:</strong>{" "}
              {editingItemId === item._id ? (
                <input
                  type="text"
                  name="notes"
                  value={soldData.notes}
                  onChange={handleEditChange}
                />
              ) : (
                item.notes || "-"
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <strong>Owner:</strong> {item.owner || "-"}
              </div>
              <div>
                {item.soldPrice == null ? (
                  editingItemId === item._id ? (
                    <>
                      <button onClick={() => handleSubmit(item._id)}>
                        Save
                      </button>
                      <button onClick={() => setEditingItemId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditingItemId(item._id)}>
                      Mark as Sold
                    </button>
                  )
                ) : (
                  "Sold"
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemsTable;
