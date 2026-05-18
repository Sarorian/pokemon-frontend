import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { API_BASE } from "../config";

const MIN_DATE = new Date("2020-01-01");

const isValidDate = (d) => {
  const date = new Date(d);
  return d && !isNaN(date.getTime()) && date >= MIN_DATE;
};

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          fontSize: 13,
        }}
      >
        <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>
          {label}
        </div>
        <div
          style={{
            fontWeight: 700,
            color: val >= 0 ? "var(--green)" : "var(--danger)",
          }}
        >
          {val >= 0 ? "+" : ""}${val.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

const Home = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
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

        // ── Stats ──
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

        // ── Chart data ──
        // Build list of all events with date + profit impact
        const events = [];

        itemsData.forEach((item) => {
          // Purchase = negative on purchase date
          if (isValidDate(item.purchaseDate)) {
            events.push({
              date: new Date(item.purchaseDate),
              amount: -Number(item.purchasePrice),
            });
          }
          // Sale = positive (sold price) on sold date
          if (item.soldPrice != null && isValidDate(item.soldDate)) {
            events.push({
              date: new Date(item.soldDate),
              amount: Number(item.soldPrice),
            });
          }
        });

        expensesData.forEach((exp) => {
          if (isValidDate(exp.date)) {
            events.push({
              date: new Date(exp.date),
              amount: -Number(exp.amount),
            });
          }
        });

        otherData.forEach((o) => {
          if (isValidDate(o.date)) {
            events.push({
              date: new Date(o.date),
              amount: Number(o.amount),
            });
          }
        });

        // Sort by date
        events.sort((a, b) => a.date - b.date);

        // Build cumulative profit by date
        const byDate = {};
        events.forEach(({ date, amount }) => {
          const key = date.toISOString().split("T")[0];
          byDate[key] = (byDate[key] || 0) + amount;
        });

        let cumulative = 0;
        const points = Object.entries(byDate)
          .sort(([a], [b]) => new Date(a) - new Date(b))
          .map(([date, amount]) => {
            cumulative += amount;
            return {
              date,
              profit: parseFloat(cumulative.toFixed(2)),
            };
          });

        setChartData(points);
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
          {/* Hero row */}
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

          <div className="stats-grid" style={{ marginBottom: 32 }}>
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

          {/* Profit over time chart */}
          {chartData.length > 1 && (
            <div className="card">
              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 20,
                      letterSpacing: 1,
                      color: "var(--text)",
                    }}
                  >
                    Cumulative Profit Over Time
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 2,
                    }}
                  >
                    Each purchase & expense is −, each sale & other profit is +
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 24,
                    color:
                      stats.netProfit >= 0 ? "var(--green)" : "var(--danger)",
                  }}
                >
                  {sign(stats.netProfit)}
                  {fmt(stats.netProfit)}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--border)" }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                    width={70}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={0}
                    stroke="var(--border-light)"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="var(--blue)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--blue)",
                      stroke: "var(--bg-card)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
