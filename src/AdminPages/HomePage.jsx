import React from "react";
import "../assets/css/HomePage.css";
import { NavLink } from "react-router-dom";
import { API_BASE_URL } from "../config";

const HomePage = () => {
  return (
    <>
      <div className="landing">
        <nav className="home-header">
          <h1 className="header-title">🍽 RestoQR</h1>
          <button type="submit" className="headder-button">
            <NavLink to="/login" style={{ color: "black" }}>LOGIN</NavLink>
          </button>
        </nav>

        <div className="home-body">
          <div className="home-content">
            <h1 className="">Contact-less QR Menu</h1>
            <p className="text-white animated slideInLeft mb-4 pb-2">
                The most comprehensive platform for QR digital menu. 
                Create your menu directly on our platform. Update anytime. Easy And Simple
            </p>
            <button type="submit" className="headder-button">
              <NavLink to="/register" style={{ color: "black" }}>
                REGISTER YOUR RESTAURANT
              </NavLink>
            </button>
          </div>

          <div className="hero-header">
            <div className="img"></div>
            {/* <img src="../assets/img/hero.png" alt="" /> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
