import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../config";
import { io } from "socket.io-client";
import { QRCodeSVG  } from 'qrcode.react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFiltered, setShowFiltered] = useState(false);
  const rowsPerPage = 10;
  const storedSlug = localStorage.getItem("restaurantSlug").toUpperCase();
  const UPI = localStorage.getItem("upi");

  useEffect(() => {
    fetchOrders();
  }, []);

  const socket = io(API_BASE_URL);
  const restaurantSlug = localStorage.getItem("restaurantSlug");
  useEffect(() => {
    if (!restaurantSlug) return;
    const orderEvent = `newOrder:${restaurantSlug}`;
    socket.on(orderEvent, fetchOrders);
    return () => {
      socket.off(orderEvent);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        toast.success("Order status updated");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Error updating order");
    }
  };

  const generateBillPDF = (order) => {
    const input = document.getElementById(`bill-${order.orderId}`);
    if (!input) {
      toast.error("Error generating bill: Element not found");
      return;
    }
    input.style.display = "flex";
    html2canvas(input, { scale: 8, useCORS: true })
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; // A4 width
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      // pdf.save(`bill-${order.orderId}.pdf`);
      const pdfBlob = pdf.output("blob");
      const pdfURL = URL.createObjectURL(pdfBlob);
      window.open(pdfURL, "_blank");
      input.style.display = "none"; 
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF");
      input.style.display = "none";
    });
  };

  // Filter Orders
  const filteredOrders = showFiltered
    ? orders.filter(
        (order) =>
          order.orderStatus === "New" || order.orderStatus === "Preparing"
      )
    : orders;

  // Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredOrders.slice(indexOfFirstRow, indexOfLastRow);
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrders.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="menu-container">
      <h2>All Orders</h2>

      {/* Checkbox to filter orders */}
      <label className="filter-checkbox">
        <input
          style={{width: 'fit-content'}}
          type="checkbox"
          checked={showFiltered}
          onChange={() => setShowFiltered(!showFiltered)}
        />
        Show Only "New" & "Preparing" Orders
      </label>

      <table className="menu-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Delivery Type</th>
            <th>Customer Note</th>
            <th>Items</th>
            <th>Coupon Code</th>
            <th>Total Price (₹)</th>
            <th>TableId</th>
            <th>Date</th>
            <th>Status</th>
            <th>Print Bill</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((order) => (
            <tr
              key={order._id}
              className={`status-${order.orderStatus.toLowerCase()}`}
            >
              <td>{order.orderId}</td>
              <td>{order.customerId.customerName || "N/A"}</td>
              <td>{order.deliveryType}</td>
              <td>{order.note || "No Notes"}</td>
              <td>
                {order.items.map((item, index) => (
                  <div key={index}>
                    {item.itemName} x {item.quantity}
                  </div>
                ))}
              </td>
              <td>{order.couponCode || ""} - {order.discountPercentage > 0 && order.discountPercentage + "%"}</td>
              <td>₹{order.discountedTotal}</td>
              <td>🪑{order.tableId}</td>
              <td>{new Date(order.createdAt).toLocaleString()}</td>
              <td>
                <select
                  value={order.orderStatus}
                  onChange={(e) =>
                    updateOrderStatus(order.orderId, e.target.value)
                  }
                >
                  <option value="New">New</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                {order.orderStatus === "Completed" && (
                  <button
                    className="submit-button"
                    style={{background: '#41b961'}}
                    onClick={() => generateBillPDF(order)}
                  >
                    Print Bill
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Hidden Bill Template for PDF */}
      {currentRows.map(
        (order) =>
          order.orderStatus === "Completed" && (
            <div
              key={order.orderId}
              id={`bill-${order.orderId}`}
              style={{ display: "none" }}
              className="bill"
            >
              <h1>{storedSlug}</h1>
              <h2>Order Details</h2>
              <p>Order ID: {order.orderId}</p>
              <p>Customer: {order.customerName || "N/A"}</p>
              <p>Delivery Type: {order.deliveryType}</p>
              <p>Customer Note: {order.note || "No Notes"}</p>
              <h3>Items:</h3>
              <ul style={{padding: '0'}}>
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.itemName} x {item.quantity}
                  </li>
                ))}
              </ul>
              {order.couponCode && <p>Coupon Code: {order.couponCode}</p>}
              {order.discountPercentage > 0 && <p>Discount: {order.discountPercentage}%</p>}
              <p>Total Price: ₹{order.discountedTotal}</p>
              
              {UPI && (
                <>
                <QRCodeSVG height={40} width={40}
                  value={`upi://pay?pa=${UPI}&am=${order.discountedTotal}&tn=Payment for Order ${order.orderId}&cu=INR`}
                />
                <p>Scan with any UPI app to Pay</p>
                </>
              )}
              <h3>Thank You Visit Again!</h3>
            </div>
          )
      )}

      <div className="pagination">
        <button
          className="submit-button"
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {Math.ceil(filteredOrders.length / rowsPerPage)}
        </span>
        <button
          className="submit-button"
          onClick={nextPage}
          disabled={currentPage === Math.ceil(filteredOrders.length / rowsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Orders;