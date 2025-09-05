import React, { useEffect, useState } from "react";
import { API_BASE } from "../config";

const Home = () => {
  const [stats, setStats] = useState({
    netProfit: 0,
    totalItems: 0,
    soldItems: 0,
    unsoldItems: 0,
    inventoryValue: 0,
    totalExpenses: 0,
    otherProfit: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch items
        const itemsRes = await fetch("http://localhost:5000/api/items");
        const itemsData = await itemsRes.json();

        // Fetch expenses
        const expensesRes = await fetch("http://localhost:5000/api/expenses");
        const expensesData = await expensesRes.json();

        // Fetch Other profits
        const otherRes = await fetch("http://localhost:5000/api/other");
        const otherData = await otherRes.json();

        let profit = 0;
        let soldItems = 0;
        let unsoldItems = 0;
        let inventoryValue = 0;

        itemsData.forEach((item) => {
          if (item.soldPrice != null) {
            soldItems++;
            profit += Number(item.soldPrice) - Number(item.purchasePrice);
          } else {
            unsoldItems++;
            inventoryValue += Number(item.purchasePrice);
          }
        });

        const totalExpenses = expensesData.reduce(
          (sum, exp) => sum + Number(exp.amount),
          0
        );

        const otherProfit = otherData.reduce(
          (sum, o) => sum + Number(o.amount),
          0
        );

        const netProfit = profit - totalExpenses + otherProfit;

        setStats({
          netProfit,
          totalItems: itemsData.length,
          soldItems,
          unsoldItems,
          inventoryValue,
          totalExpenses,
          otherProfit,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>O2 Cards Dashboard</h2>
      <div style={{ marginTop: "20px" }}>
        <p>
          <strong>Net Profit:</strong> ${stats.netProfit.toFixed(2)}
        </p>
        <p>
          <strong>Total Expenses:</strong> ${stats.totalExpenses.toFixed(2)}
        </p>
        <p>
          <strong>Other Profits:</strong> ${stats.otherProfit.toFixed(2)}
        </p>
        <p>
          <strong>Total Items:</strong> {stats.totalItems}
        </p>
        <p>
          <strong>Sold Items:</strong> {stats.soldItems}
        </p>
        <p>
          <strong>Unsold Items:</strong> {stats.unsoldItems}
        </p>
        <p>
          <strong>Inventory Value:</strong> ${stats.inventoryValue.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default Home;
