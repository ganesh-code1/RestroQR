import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useNavigate, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import "../assets/css/Home.css";
import { API_BASE_URL } from "../config";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    HotelName: "",
    OwnerName: "",
    Email: "",
    Mnumber: "",
    Password: "",
    ConPass: "",
  });

  const navigate = useNavigate();
  const [showPass, setPass] = useState(false);
  const [showconPass, setconPass] = useState(false);

  const changeHandler = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (formData.Password !== formData.ConPass) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isValidPassword(formData.Password)) {
      toast.error("Password must be 8+ chars, include 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Account Created Successfully");
        navigate("/login");
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="container">
        <div className="header"></div>
        <div className="form-container">
          <h2 className="title">Register your Restaurant</h2>
          <form onSubmit={submitHandler}>
            <div className="section-title">Restaurant Information</div>
            <div className="form-group">
              <label className="label">Restaurant Name</label>
              <input
                type="text"
                name="HotelName"
                value={formData.HotelName}
                onChange={changeHandler}
                className="input"
                placeholder="Enter restaurant name"
                required
              />
            </div>

            <div className="section-title">Owner Information</div>
            <div className="form-group">
              <label className="label">Owner Name</label>
              <input
                type="text"
                name="OwnerName"
                value={formData.OwnerName}
                onChange={changeHandler}
                className="input"
                placeholder="Enter owner name"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={changeHandler}
                className="input"
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Mobile Number</label>
              <input
                type="tel"
                name="Mnumber"
                value={formData.Mnumber}
                minLength={10} maxLength={10}
                onChange={changeHandler}
                className="input"
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  name="Password"
                  value={formData.Password}
                  onChange={changeHandler}
                  className="input"
                  placeholder="Create password"
                  required
                />
                <span className="eye-icon" onClick={() => setPass((prev) => !prev)}>
                  {showPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  type={showconPass ? "text" : "password"}
                  name="ConPass"
                  value={formData.ConPass}
                  onChange={changeHandler}
                  className="input"
                  placeholder="Confirm password"
                  required
                />
                <span className="eye-icon" onClick={() => setconPass((prev) => !prev)}>
                  {showconPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </span>
              </div>
            </div>

            <button type="submit" className="button">
              Register
            </button>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <NavLink to="/login">Already Have an Account? Login!</NavLink>
            </div>
          </form>
        </div>
      </div>
      <div className="footer">
        <div className="row">
          <div className="col-lg-12">@2025 RestroQR | All Rights Reserved</div>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;
