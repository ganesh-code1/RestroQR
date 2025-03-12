import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config";
import "../assets/css/BookTable.css";

const BookTable = () => {
  const { restaurantSlug } = useParams();
  const [restaurantId, setRestaurantId] = useState(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [persons, setPersons] = useState(1);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reservations/${restaurantSlug}`);
        const data = await response.json();
        if (response.ok) {
          setRestaurantId(data._id);
        } else {
          console.error("Failed to fetch restaurant ID");
          toast.error("Error fetching restaurant");
        }
      } catch (error) {
        console.error("Error fetching restaurant ID:", error);
        toast.error("Error fetching restaurant");
      }
    };
    fetchRestaurantId();
  }, [restaurantSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) {
      toast.error("Restaurant not found!");
      return;
    }

    const bookingData = {
      restaurantId,
      name,
      mobile,
      persons,
      reservationDate,
      reservationTime,
      specialRequest,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/reservations/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Table booked for ${reservationDate} at ${reservationTime}!`);
        setName("");
        setMobile("");
        setPersons(1);
        setReservationDate("");
        setReservationTime("");
        setSpecialRequest("");
      } else {
        console.log(data.message);
        toast.error("Failed to book table");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book table");
    }
  };

  return (
    <div className="item-container">
      <h2 className="restaurant-name">{restaurantSlug.toUpperCase()}</h2>
      <form onSubmit={handleSubmit} className="cart-container">
        <div className="text-center wow fadeInUp">
          <h5 className="section-title ff-secondary text-center text-primary fw-normal">Book a Table</h5>
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Mobile:</label>
          <input type="tel" value={mobile} onChange={(e) => {
              const value = e.target.value.replace(/\D/, ""); 
              setMobile(value);
            }}
            pattern="[0-9]{10}"
            maxLength={10} required />
        </div>
        <div className="form-group">
          <label>No. of Persons:</label>
          <input type="number" value={persons} min="1" onChange={(e) => setPersons(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Reservation Date:</label>
          <input type="date" value={reservationDate} min={today} onChange={(e) => setReservationDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Reservation Time:</label>
          <input type="time" value={reservationTime} onChange={(e) => setReservationTime(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Special Request:</label>
          <textarea
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            placeholder="Any special requests?"
          />
        </div>
        <button type="submit" className="book-button">Book Now</button>
      </form>
    </div>
  );
};

export default BookTable;
