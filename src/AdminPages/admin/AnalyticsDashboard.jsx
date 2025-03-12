import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { API_BASE_URL } from "../../config";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend,} from "chart.js";
import { Container, Typography, Grid, Paper, CircularProgress, Alert,} from "@mui/material";
import "../../assets/css/Report.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch orders from the API
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

  // Helper functions for data processing
  const getTotalRevenue = () => {
    return orders
      .filter((order) => order.orderStatus !== "Cancelled")
      .reduce((sum, order) => sum + order.discountedTotal, 0);
  };

  const getAverageOrderValue = () => {
    const validOrders = orders.filter((order) => order.orderStatus !== "Cancelled");
    return validOrders.length > 0 ? getTotalRevenue() / validOrders.length : 0;
  };

  const getRevenueByItem = () => {
    const itemRevenue = {};
    orders.forEach((order) => {
      if (order.orderStatus !== "Cancelled") {
        order.items.forEach((item) => {
          itemRevenue[item.itemName] =
            (itemRevenue[item.itemName] || 0) + item.itemCost * item.quantity;
        });
      }
    });
    return Object.entries(itemRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5); // Top 5 items
  };

  const getRevenueOverTime = () => {
    const revenueByDate = {};
    orders.forEach((order) => {
      if (order.orderStatus !== "Cancelled") {
        const date = new Date(order.createdAt).toLocaleDateString();
        revenueByDate[date] = (revenueByDate[date] || 0) + order.discountedTotal;
      }
    });
    return revenueByDate;
  };

  const getOrdersOverTime = () => {
    const ordersByDate = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      ordersByDate[date] = (ordersByDate[date] || 0) + 1;
    });
    return ordersByDate;
  };

  const getItemPairing = () => {
    const itemPairs = {};
    orders.forEach((order) => {
      if (order.items.length > 1) {
        order.items.forEach((item1, i) => {
          order.items.slice(i + 1).forEach((item2) => {
            const pair = `${item1.itemName} + ${item2.itemName}`;
            itemPairs[pair] = (itemPairs[pair] || 0) + 1;
          });
        });
      }
    });
    return Object.entries(itemPairs).sort((a, b) => b[1] - a[1]).slice(0, 5); // Top 5 pairs
  };

  const getPeakHours = () => {
    const hourCounts = Array(24).fill(0);
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour]++;
    });
    return hourCounts;
  };

  const getDayOfWeekAnalysis = () => {
    const dayCounts = Array(7).fill(0);
    orders.forEach((order) => {
      const day = new Date(order.createdAt).getDay(); // 0 = Sunday, 6 = Saturday
      dayCounts[day]++;
    });
    return dayCounts;
  };

  const getCancellationRate = () => {
    const cancelledOrders = orders.filter((order) => order.orderStatus === "Cancelled").length;
    return (cancelledOrders / orders.length) * 100 || 0;
  };

  // Chart data and options
  const revenueByItemData = {
    labels: getRevenueByItem().map((item) => item[0]),
    datasets: [
      {
        label: "Revenue by Item",
        data: getRevenueByItem().map((item) => item[1]),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const revenueOverTimeData = {
    labels: Object.keys(getRevenueOverTime()),
    datasets: [
      {
        label: "Revenue Over Time",
        data: Object.values(getRevenueOverTime()),
        borderColor: "#36A2EB",
        fill: false,
      },
    ],
  };

  const ordersOverTimeData = {
    labels: Object.keys(getOrdersOverTime()),
    datasets: [
      {
        label: "Orders Over Time",
        data: Object.values(getOrdersOverTime()),
        borderColor: "#FF6384",
        fill: false,
      },
    ],
  };

  const itemPairingData = {
    labels: getItemPairing().map((pair) => pair[0]),
    datasets: [
      {
        label: "Item Pairing",
        data: getItemPairing().map((pair) => pair[1]),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  const peakHoursData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "No of Orders",
        data: getPeakHours(),
        backgroundColor: "#36A2EB",
      },
    ],
  };

  const dayOfWeekData = {
    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [
      {
        label: "Orders by Day of Week",
        data: getDayOfWeekAnalysis(),
        backgroundColor: "#FF6384",
      },
    ],
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <div className="reports-dashboard">
      <h1>Reports Dashboard</h1>
      <Grid container spacing={3}>
        {/* Total Revenue */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Total Revenue (Except Cancelled Orders)</Typography>
            <Typography variant="h4">₹{getTotalRevenue()}</Typography>
          </Paper>
        </Grid>

        {/* Average Order Value */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Average Order Value</Typography>
            <Typography variant="h4">₹{getAverageOrderValue().toFixed(2)}</Typography>
          </Paper>
        </Grid>
        
        {/* Cancellation Rate */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Cancellation Rate</Typography>
            <Typography variant="h4">
              {getCancellationRate().toFixed(2)}%
            </Typography>
          </Paper>
        </Grid>

        {/* Revenue by Item: Analyze which items contribute the most to revenue */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Revenue by Item (Top 5 Items)</Typography>
            <Bar data={revenueByItemData} />
          </Paper>
        </Grid>

        {/* Revenue Over Time: Track revenue trends over days, weeks, or months. */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Revenue Over Time</Typography>
            <Line data={revenueOverTimeData} />
          </Paper>
        </Grid>

        {/* Orders Over Time */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Orders Over Time</Typography>
            <Line data={ordersOverTimeData} />
          </Paper>
        </Grid>

        {/* Item Pairing */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Item Pairing - items that are frequently ordered together</Typography>
            <Bar data={itemPairingData} />
          </Paper>
        </Grid>

        {/* Peak Hours */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Peak Hours</Typography>
            <Bar data={peakHoursData} />
          </Paper>
        </Grid>

        {/* Day of Week Analysis */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Day of Week Analysis</Typography>
            <Bar data={dayOfWeekData} />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AnalyticsDashboard;