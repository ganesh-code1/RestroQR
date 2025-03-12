import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";
import "../../assets/css/Settings.css";

const Settings = () => {
  const [upiId, setUpiId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurant/settings`, {
        credentials: "include",
      });
      const data = await response.json();
      setUpiId(data.upiId);
      setEmail(data.Email);
      setMobile(data.Mnumber);
      setIsOpen(data.isOpen);
    } catch (err) {
      toast.error("Error fetching settings:");
      console.error("Error fetching settings:", err);
    }
  };

  const handleUpdate = async (field, value) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/restaurant/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        if(field == "upiId") {
          localStorage.setItem("upi", upiId);
        }
        toast.success("Settings updated successfully");
        fetchSettings();
      } else {
        toast.error("Failed to update");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Failed to update");
    }
  };

  return (
    <div className="menu-container">
      <h2>Restaurant Settings</h2>

      {/* Open/Close Toggle */}
      <div className="settings-toggle">
        <span>Restaurant Status:</span><span className="setting-label">CLOSE</span>   
        <div className={`toggle-switch ${isOpen ? "active" : ""}`} onClick={() => handleUpdate("isOpen", !isOpen)}>
          <div className="toggle-thumb"></div>
        </div>
        <span className="setting-label">OPEN</span> 
      </div>

      {/* Update UPI ID */}
      <div className="mb-4">
        <label>UPI ID: (Used to generate qr code for payment in bill)</label>
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          className="settings-input"
        />
        <button onClick={() => handleUpdate("upiId", upiId)} className="submit-button">
          Update UPI ID
        </button>
      </div>

      {/* Update Email */}
      <div className="mb-4">
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="settings-input"
        />
        <button onClick={() => handleUpdate("email", email)} className="submit-button">
          Update Email
        </button>
      </div>

      {/* Update Mobile */}
      <div className="mb-4">
        <label>Mobile Number:</label>
        <input
          type="tel"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="settings-input"
        />
        <button onClick={() => handleUpdate("mobile", mobile)} className="submit-button">
          Update Mobile
        </button>
      </div>

      {/* Update Password */}
      {/* <div className="mb-4">
        <label>New Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="settings-input"
        />
        <button onClick={() => handleUpdate("password", password)} className="submit-button">
          Update Password
        </button>
      </div> */}
    </div>
  );
};

export default Settings;