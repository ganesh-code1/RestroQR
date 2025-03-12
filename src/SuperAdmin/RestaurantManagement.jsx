import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";
import toast from "react-hot-toast";

const RestaurantManagement = () => {
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
            toast.error("Error fetching restaurants");
          }
        } catch (error) {
          toast.error("Error fetching restaurants");
        }
      };
      fetchRestaurants();
    }, []);
  
    const handleStatusChange = async (id, approved) => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurant/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("superAdminToken")}`,
          },
          body: JSON.stringify({ approved: !approved }),
          credentials: "include",
        });
  
        if (response.ok) {
          toast.success("Resraurant Status updated Successfully")
          setRestaurants((prev) =>
            prev.map((rest) => (rest._id === id ? { ...rest, approved: !approved } : rest))
          );
        } else {
          toast.error("Failed to update status");
        }
      } catch (error) {
        toast.error("Error updating status");
      }
    };
  
    return (
      <div className="content-wrapper">
        <h2>Restaurant Management</h2>
        <table className="menu-table">
          <thead>   
            <tr>
              <th>Hotel Name</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((resto) => (
              <tr key={resto._id}>
                <td>{resto.HotelName}</td>
                <td>{resto.OwnerName}</td>
                <td>{resto.approved ? "Approved" : "Deactivated"}</td>
                <td>
                  <button
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                    onClick={() => handleStatusChange(resto._id, resto.approved)}
                  >
                    {resto.approved ? "Deactivate" : "Approve"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default RestaurantManagement;