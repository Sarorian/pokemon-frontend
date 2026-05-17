import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const SkeletonCard = () => (
  <div className="stat-card">
    <div
      className="skeleton"
      style={{ height: 11, width: "55%", marginBottom: 10 }}
    />
    <div className="skeleton" style={{ height: 30, width: "75%" }} />
  </div>
);

const StatCard = ({ label, value, color, accent }) => (
  <div className={`stat-card ${accent ? "stat-card--accent" : ""}`}>
    <div className="stat-card__label">{label}</div>
    <div className="stat-card__value" style={{ color: color || "var(--text)" }}>
      {value}
    </div>
  </div>
);

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, expensesRes, otherRes] = await Promise.all([
          fetch(`${API_BASE}/api/items`),
          fetch(`${API_BASE}/api/expenses`),
          fetch(`${API_BASE}/api/other`),
        ]);
        const [itemsData, expensesData, otherData] = await Promise.all([
          itemsRes.json(),
          expensesRes.json(),
          otherRes.json(),
        ]);

        let totalPurchaseValue = 0,
          totalSoldValue = 0;
        let soldItems = 0,
          unsoldItems = 0,
          inventoryValue = 0;

        itemsData.forEach((item) => {
          totalPurchaseValue += Number(item.purchasePrice);
          if (item.soldPrice != null) {
            soldItems++;
            totalSoldValue += Number(item.soldPrice);
          } else {
            unsoldItems++;
            inventoryValue += Number(item.purchasePrice);
          }
        });

        const totalExpenses = expensesData.reduce(
          (s, e) => s + Number(e.amount),
          0,
        );
        const otherProfit = otherData.reduce((s, o) => s + Number(o.amount), 0);
        const totalMoneyIn = totalSoldValue + otherProfit;
        const totalMoneyOut = totalPurchaseValue + totalExpenses;
        const netProfit = totalMoneyIn - totalMoneyOut;

        setStats({
          netProfit,
          totalItems: itemsData.length,
          soldItems,
          unsoldItems,
          inventoryValue,
          totalExpenses,
          otherProfit,
          totalMoneyIn,
          totalMoneyOut,
        });
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fmt = (n) => `$${Math.abs(n).toFixed(2)}`;
  const sign = (n) => (n >= 0 ? "+" : "-");

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      {loading || !stats ? (
        <div className="stats-grid">
          {error && !loading ? (
            <div
              style={{
                gridColumn: "1 / -1",
                color: "var(--danger)",
                padding: 20,
              }}
            >
              ⚠️ Could not load data. Check your connection or try refreshing.
            </div>
          ) : (
            Array(9)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          )}
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ marginBottom: 16 }}>
            <div
              className="stat-card stat-card--accent"
              style={{ gridColumn: "span 2" }}
            >
              <div className="stat-card__label">Net Profit</div>
              <div
                className="stat-card__value"
                style={{
                  fontSize: 48,
                  color:
                    stats.netProfit >= 0 ? "var(--green)" : "var(--danger)",
                }}
              >
                {sign(stats.netProfit)}
                {fmt(stats.netProfit)}
              </div>
            </div>
            <StatCard
              label="Total Money In"
              value={`+${fmt(stats.totalMoneyIn)}`}
              color="var(--green)"
            />
            <StatCard
              label="Total Money Out"
              value={`-${fmt(stats.totalMoneyOut)}`}
              color="var(--danger)"
            />
            <StatCard
              label="Total Expenses"
              value={`-${fmt(stats.totalExpenses)}`}
              color="var(--danger)"
            />
            <StatCard
              label="Other Profits"
              value={`+${fmt(stats.otherProfit)}`}
              color="var(--green)"
            />
          </div>

          <div className="stats-grid">
            <StatCard label="Total Items" value={stats.totalItems} />
            <StatCard
              label="Sold Items"
              value={stats.soldItems}
              color="var(--green)"
            />
            <StatCard
              label="Unsold Items"
              value={stats.unsoldItems}
              color="var(--accent)"
            />
            <StatCard
              label="Inventory Value"
              value={fmt(stats.inventoryValue)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
