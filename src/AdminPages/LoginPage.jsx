import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";

const LoginPage = () => {
  const [logData, setLogdata] = useState({
    Email: "",
    Password: "",
  });

  const changeHandler = (e) => {
    setLogdata((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify(logData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Login Successful!");
        localStorage.setItem("restaurantSlug", data.restaurantSlug);
        localStorage.setItem("upi", data.upiId);
        window.location.href = "/home"; // Redirect to home after login
      } else {
        toast.error(`Error: ${data.error || "Login failed"}`);
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="container">
        <div className="header"></div>
        <div className="form-container" style={{ width: "40%"}}>
          <h2 className="title">Restaurant Login</h2>
          <form onSubmit={submitHandler}>
            <div className="form-group">
              <label className="label">Restaurant Email</label>
              <input
                type="email"
                placeholder="Email address"
                value={logData.Email}
                name="Email"
                className="input"
                onChange={changeHandler}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                placeholder="Password"
                value={logData.Password}
                className="input"
                onChange={changeHandler}
                name="Password"
                required
              />
            </div>
            <button type="submit" className="button">
              Log In
            </button>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <NavLink to="/Register">Create New Account</NavLink>
              <a href="#" style={{ color: "#1877f2", textDecoration: "none" }}>Forgot Password?</a>
            </div>
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

export default LoginPage;
