import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../config";
import "../../assets/css/Offer.css";

const AdminOffer = () => {
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);

  const [couponCode, setCouponCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/offers`, {
          credentials: "include",
        });
        if (response.ok) {
          setCoupons(await response.json());
        } else {
          toast.error("Failed to fetch coupons");
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    };
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCouponId(coupon._id);
      setCouponCode(coupon.couponCode);
      setDescription(coupon.description);
      setDiscountPercentage(coupon.discountPercentage);
      setStartDate(coupon.startDate.split("T")[0]);
      setEndDate(coupon.endDate.split("T")[0]);
    } else {
      setEditingCouponId(null);
      setCouponCode("");
      setDescription("");
      setDiscountPercentage("");
      setStartDate("");
      setEndDate("");
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCouponId(null);
  };

  const validateForm = () => {
    if (
      !couponCode ||
      !description ||
      !discountPercentage ||
      !startDate ||
      !endDate
    ) {
      toast.error("All fields are required!");
      return false;
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      toast.error("Discount percentage must be between 1 and 100.");
      return false;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be later than end date.");
      return false;
    }

    return true;
  };

  const saveCoupon = async () => {
    if (!validateForm()) return;

    const couponData = {
      couponCode: couponCode.toUpperCase(),
      description,
      discountPercentage: parseFloat(discountPercentage),
      startDate,
      endDate,
    };

    try {
      let response;
      if (editingCouponId) {
        response = await fetch(
          `${API_BASE_URL}/api/offers/${editingCouponId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(couponData),
          }
        );
      } else {
        response = await fetch(`${API_BASE_URL}/api/offers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(couponData),
        });
      }

      if (response.ok) {
        const data = await response.json();
        setCoupons(
          editingCouponId
            ? coupons.map((c) => (c._id === editingCouponId ? data : c))
            : [...coupons, data]
        );
        toast.success(
          editingCouponId
            ? "Coupon updated successfully!"
            : "Coupon added successfully!"
        );
        closeModal();
      } else {
        toast.error("Failed to save coupon");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Error saving coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setCoupons(coupons.filter((c) => c._id !== id));
        toast.success("Coupon deleted successfully!");
      } else {
        toast.error("Failed to delete coupon");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      toast.error("Error deleting coupon");
    }
  };

  const getStatus = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
  
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999); 
  
    if (today >= start && today <= end) {
      return "Ongoing";
    } else if (today < start) {
      return "Upcoming";
    } else {
      return "Expired";
    }
  };  

  return (
    <div className="menu-container">
      <h2>Manage Coupons</h2>
      <button className="submit-button" onClick={() => openModal()}>Add Coupon</button>

      <table className="menu-table">
        <thead>
          <tr>
            <th>Coupon Code</th>
            <th>Description</th>
            <th>Discount %</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon._id}>
              <td>{coupon.couponCode}</td>
              <td>{coupon.description}</td>
              <td>{coupon.discountPercentage}%</td>
              <td>{new Date(coupon.startDate).toLocaleDateString()}</td>
              <td>{new Date(coupon.endDate).toLocaleDateString()}</td>
              <td>{getStatus(coupon.startDate, coupon.endDate)}</td>
              <td>
                <button onClick={() => openModal(coupon)}>Edit</button>
                <button onClick={() => handleDelete(coupon._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingCouponId ? "Edit Coupon" : "Add Coupon"}</h3>
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <input
              type="number"
              placeholder="Discount Percentage"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="submit-button" onClick={closeModal}>Cancel</button>
              <button className="submit-button" onClick={saveCoupon}>{editingCouponId ? "Update" : "Add"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOffer;
