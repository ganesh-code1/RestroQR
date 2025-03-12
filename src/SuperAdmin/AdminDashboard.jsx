import { useEffect, useState } from "react";
import RestaurantManagement from "./RestaurantManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

const AdminDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("superAdminToken")}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        } else {
          toast.error("Failed to fetch data");
          console.error("Error fetching data:");
        }
      } catch(error) {
        toast.error("Failed to fetch data");
        console.error("Error fetching data:", error);
        // window.location.href = "/admin-login";
        localStorage.clear();
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <div className="menu-container">
      <h2>Super Admin Dashboard</h2>
      <RestaurantManagement />
      <SubscriptionManagement />
    </div>
  );
};

export default AdminDashboard;
