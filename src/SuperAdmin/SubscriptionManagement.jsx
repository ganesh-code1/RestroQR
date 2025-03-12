import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/subscriptions`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("superAdminToken")}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSubscriptions(data);
        } else {
          toast.error("Error fetching subscriptions");
        }
      } catch (error) {
        toast.error("Error fetching subscriptions");
      }
    };
    fetchSubscriptions();
  }, []);

  return (
    <div className="content-wrapper">
      <h2>Subscription Management</h2>
      <table className="menu-table">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub._id}>
              <td>{sub.HotelName}</td>
              <td>{sub.subscription.status}</td>
              <td>
                {sub.subscription.startDate
                  ? new Date(sub.subscription.startDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                {sub.subscription.endDate
                  ? new Date(sub.subscription.endDate).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionManagement;
