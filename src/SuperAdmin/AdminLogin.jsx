import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(errorData.message);
      }
      const data = await response.json();
      localStorage.setItem("superAdminToken", data.token);
      navigate("/admin-home");
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <>
    <div className="container">
      <div className="header"></div>
      <div className="form-container" style={{ width: "40%"}}>
        <h2 className="title">Super Admin Login</h2>
        <form onSubmit={handleLogin}>
        <div className="form-group">
            <label className="label">Restaurant Email</label>
            <input type="text" placeholder="Username" className="input"
            value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
            <label className="label">Restaurant Email</label>
                <input type="password" placeholder="Password" className="input"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          <button type="submit" className="button">Login</button>
        </form>
      </div>
    </div>
    <div className="footer">
        <div className="row">
        <div className="col-lg-12">
            @2025 RestroQR | All Rights Reserved
        </div>
        </div>
    </div>
  </>
  );
};

export default AdminLogin;
