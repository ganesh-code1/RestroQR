import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";

const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customer`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
        setFilteredCustomers(data);
      } else {
        toast.error("Failed to fetch customers");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error fetching customers");
    }
  };

  const fetchOrders = async (customerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/customer/orders/${customerId}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setShowModal(true);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(
      (customer) =>
        customer.customerName.toLowerCase().includes(term) ||
        customer.customerMobile.includes(term)
    );
    setFilteredCustomers(filtered);
  };

  return (
    <div className="menu-container">
      <h2>Customer Profiling & Purchase History</h2>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search by name or mobile..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

      <table className="menu-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Mobile</th>
            <th>Date of Birth</th>
            <th>Total Spent</th>
            <th>Total Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td>{customer.customerName}</td>
                <td>{customer.customerMobile}</td>
                <td>
                  {customer.customerDOB
                    ? new Date(customer.customerDOB).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>₹{customer.totalSpent}</td>
                <td>{customer.totalOrders}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedCustomer(customer);
                      fetchOrders(customer._id);
                    }}
                  >
                    View All Orders
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Order Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal"  style={{width: '800px'}}>
            <h3> Orders for {selectedCustomer?.customerName}</h3>

            <div className="modal-body">
              {orders.length > 0 ? (
                <>
                  <table className="menu-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Delivery Type</th>
                        <th>Items</th>
                        <th>Coupon Code</th>
                        <th>Total Price (₹)</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.orderId}</td>
                          <td>{order.deliveryType}</td>
                          <td>
                            {order.items.map((item, index) => (
                              <div key={index}>
                                {item.itemName} x {item.quantity}
                              </div>
                            ))}
                          </td>
                          <td>
                            {order.couponCode || ""} -{" "}
                            {order.discountPercentage > 0 &&
                              order.discountPercentage + "%"}
                          </td>
                          <td>₹{order.discountedTotal}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              ) : (
                <p>No orders found for this customer.</p>
              )}
            </div>
            <div className="modal-buttons" style={{ textAlign: "center" }}>
              <button
                className="submit-button"
                onClick={() => setShowModal(false)}
              >
                {" "}
                Close{" "}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTable;
