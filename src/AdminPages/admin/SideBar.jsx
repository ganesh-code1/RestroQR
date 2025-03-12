import React, { useState } from "react";
import MenuForm from "./MenuForm";
import Orders from "./Orders";
import QRCodeGenerator from "./QRCodeGenerator";
import ReportsDashboard from "./ReportsDashboard";
import Settings from "./Settings";
import AdminOffer from "./AdminOffer";
import ReservationsTable from "./ReservationsTable";
import AnalyticsDashboard from "./AnalyticsDashboard";
import CustomersTable from "./CustomersTable";
import TableStatus from "./TableStatus";

const SideBar = () => {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div id="wrapper">
      <div className="content-container">
        {/* Sidebar Navigation */}
        <nav className="sidebar">
          <ul className="nav">
            <li className={`nav-item ${activeTab === "orders" ? "active" : ""}`} onClick={() => setActiveTab("orders")} >
              <i className="fa fa-bar-chart-o"></i> Orders List
            </li>
            <li className={`nav-item ${activeTab === "menu" ? "active" : ""}`} onClick={() => setActiveTab("menu")} >
              <i className="fa fa-qrcode"></i> Menu
            </li>
            <li className={`nav-item ${activeTab === "offers" ? "active" : ""}`} onClick={() => setActiveTab("offers")} >
              <i className="fa fa-edit"></i> Offer and Coupons
            </li>
            <li className={`nav-item ${activeTab === "table" ? "active" : ""}`} onClick={() => setActiveTab("table")} >
              <i className="fa fa-edit"></i> Table Management
            </li>
            <li className={`nav-item ${activeTab === "qr" ? "active" : ""}`} onClick={() => setActiveTab("qr")} >
              <i className="fa fa-edit"></i> Generate QR
            </li>
            <li className={`nav-item ${activeTab === "reservation" ? "active" : ""}`} onClick={() => setActiveTab("reservation")}>
              <i className="fa fa-edit"></i> Reservation
            </li>
            <li className={`nav-item ${activeTab === "customer" ? "active" : ""}`} onClick={() => setActiveTab("customer")}>
              <i className="fa fa-edit"></i> Customers
            </li>
            <li className={`nav-item ${activeTab === "report" ? "active" : ""}`} onClick={() => setActiveTab("report")} >
              <i className="fa fa-edit"></i> Reports
            </li>
            <li className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")} >
              <i className="fa fa-edit"></i> Settings
            </li>
          </ul>
        </nav>

        <div className="right-content">
          <div className="content-wrapper">
            {activeTab === "menu" && <MenuForm />}
            {activeTab === "orders" && <Orders />}
            {activeTab === "qr" && <QRCodeGenerator />}
            {activeTab === "reservation" && <ReservationsTable />}
            {activeTab === "customer" && <CustomersTable />}
            {activeTab === "offers" && <AdminOffer />}
            {activeTab === "table" && <TableStatus />}
            {activeTab === "report" && <AnalyticsDashboard />}
            {/* {activeTab === "report" && <ReportsDashboard />} */}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
