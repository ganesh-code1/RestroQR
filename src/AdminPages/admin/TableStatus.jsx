import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";
import "../../assets/css/Table.css";

const TableStatus = () => {
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableData, setTableData] = useState({
    tableId: "",
    peopleCount: 1,
  });

  useEffect(() => {
    fetchTables();
    fetchOrders();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      } else {
        toast.error("Failed to fetch tables");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Error fetching tables");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error fetching orders");
    }
  };

  const handleInputChange = (e) => {
    setTableData({ ...tableData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingTable ? "PUT" : "POST";
      const endpoint = editingTable
        ? `${API_BASE_URL}/api/tables/${editingTable._id}`
        : `${API_BASE_URL}/api/tables`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(tableData),
      });

      if (response.ok) {
        toast.success(`Table ${editingTable ? "updated" : "added"} successfully!`);
        fetchTables();
        setShowModal(false);
        setEditingTable(null);
        setTableData({ tableId: "", peopleCount: 1 });
      } else {
        toast.error("Failed to save table");
      }
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error("Error saving table");
    }
  };

  const handleDelete = async (tableId) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/tables/${tableId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Table deleted successfully!");
        fetchTables();
      } else {
        toast.error("Failed to delete table");
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      toast.error("Error deleting table");
    }
  };

  const openEditModal = (table) => {
    setEditingTable(table);
    setTableData({ tableId: table.tableId, peopleCount: table.peopleCount });
    setShowModal(true);
  };

  return (
    <div className="menu-container">
      <h2>Table Management</h2>
      <button className="submit-button" onClick={() => setShowModal(true)}>
      ➕ Add Table
      </button>

      <div className="tables-grid">
        {tables.map((table) => {
          const activeOrder = orders.find(
            (order) => order.tableId === table.tableId && order.orderStatus !== "Completed" && order.orderStatus !== "Cancelled"
          );
          return (
            <div key={table._id} className="table-card">
              <img src="./src/assets/img/table.png" alt="Table" className="table-image" />
              <div className="table-overlay">
                <p><strong>Table No:</strong> {table.tableId}</p>
                {activeOrder ? (
                  <>
                    <p><strong>Order ID:</strong> {activeOrder.orderId}</p>
                    <p><strong>Status:</strong> {activeOrder.orderStatus}</p>
                  </>
                ) : (
                  <p>No Active Orders</p>
                )}
              </div>
              <button className="table-button" onClick={() => openEditModal(table)}>Edit Table</button>
              <button className="table-button" onClick={() => handleDelete(table._id)}>Delete Table</button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingTable ? "Edit Table" : "Add Table"}</h3>
            <form onSubmit={handleSubmit}>
              <label>Table ID:</label>
              <input
                type="text"
                name="tableId"
                value={tableData.tableId}
                onChange={handleInputChange}
                required
              />

              <label>Number of People:</label>
              <input
                type="number"
                name="peopleCount"
                value={tableData.peopleCount}
                onChange={handleInputChange}
                min="1"
                required
              />

              <div className="modal-buttons">
                <button className="submit-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  {editingTable ? "Update Table" : "Add Table"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableStatus;
