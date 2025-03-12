import React, { useEffect, useState } from "react";
import "../../assets/css/Report.css";
import { API_BASE_URL } from "../../config";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell} from "recharts";

const ReportsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setLoading(false);
      } else {
        setError("Failed to fetch orders");
        setLoading(false);
      }
    } catch (error) {
        setError("Failed to fetch orders");
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Calculate Total Revenue (excluding canceled orders) using discountedTotal
  const totalRevenue = orders
  .filter(order => order.orderStatus !== "Cancelled") // Exclude canceled orders
  .reduce((acc, order) => acc + order.discountedTotal, 0);

  // Calculate Daily Customers
  const dailyCustomers = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  const dailyCustomersData = Object.keys(dailyCustomers).map((date) => ({
    date,
    customers: dailyCustomers[date],
  }));

  // Calculate Most and Least Sold Items
  const itemSales = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (!acc[item.itemName]) {
        acc[item.itemName] = 0;
      }
      acc[item.itemName] += item.quantity;
    });
    return acc;
  }, {});

  const sortedItems = Object.keys(itemSales).sort(
    (a, b) => itemSales[b] - itemSales[a]
  );
  const mostSoldItem = sortedItems[0];
  const leastSoldItem = sortedItems[sortedItems.length - 1];

  // Pie Chart Data for Item Sales
  const pieChartData = sortedItems.map((item) => ({
    name: item,
    value: itemSales[item],
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="reports-dashboard">
      <h1>Reports Dashboard</h1>

      <div className="metrics">
        <div className="metric">
          <h2>Total Revenue</h2>
          <p>₹ {totalRevenue.toFixed(2)}</p>
        </div>

        <div className="metric">
          <h2>Most Sold Item</h2>
          <p>{mostSoldItem}</p>
        </div>

        <div className="metric">
          <h2>Least Sold Item</h2>
          <p>{leastSoldItem}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart">
          <h2>Daily Customers</h2>
          <BarChart
            width={600}
            height={300}
            data={dailyCustomersData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="customers" fill="#8884d8" />
          </BarChart>
        </div>

        <div className="chart">
          <h2>Item Sales Distribution</h2>
          <PieChart width={400} height={400}>
            <Pie
              data={pieChartData}
              cx={200}
              cy={200}
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default ReportsDashboard;