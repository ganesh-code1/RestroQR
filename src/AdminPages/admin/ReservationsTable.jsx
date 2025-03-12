import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, SELF_URL } from "../../config";

const ReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const storedSlug = localStorage.getItem("restaurantSlug");

  // Fetch reservations from the API
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reservations`, {
          credentials: "include",
        });
        if (!response.ok) {
          toast.error("Failed to fetch reservations");
          return;
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error(error.message);
        toast.error("Failed to fetch reservations");
      }
    };
    fetchReservations();
  }, []);

  // Function to determine reservation status based on date and time
  const getStatus = (reservationDate, reservationTime) => {
    const now = new Date();
    const todayDateStr = now.toISOString().split("T")[0];
    const reservationDateTime = new Date(`${reservationDate}T${reservationTime}:00`);
    if (reservationDate === todayDateStr) {
      if (reservationDateTime < now) {
        return { text: "Expired", color: "red", order: 3 };
      }
      return { text: "Today", color: "green", order: 1 };
    }
    if (reservationDateTime < now) return { text: "Expired", color: "red", order: 3 };
    return { text: "Upcoming", color: "blue", order: 2 };
  };

  // Sort reservations: Today → Upcoming → Expired (at the end)
  const sortedReservations = [...reservations]
    .map((reservation) => ({
      ...reservation,
      status: getStatus(reservation.reservationDate, reservation.reservationTime),
    }))
    .sort((a, b) => a.status.order - b.status.order);

  return (
    <div className="menu-container">
      <h2>My Reservations</h2>
      <button
        className="submit-button"
        onClick={() => window.open(`${SELF_URL}/${storedSlug}/book-table`, "_blank")}
      >
        Open Reservation Page
      </button>
      <table className="menu-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Mobile</th>
            <th>No of Persons</th>
            <th>Reservation Date</th>
            <th>Reservation Time</th>
            <th>Special Request</th>
            <th>Created At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedReservations.map((reservation) => (
            <tr key={reservation._id}>
              <td>{reservation.customerId.customerName}</td>
              <td>{reservation.customerId.customerMobile}</td>
              <td>🙍🏻‍♂️{reservation.persons}</td>
              <td>{reservation.reservationDate}</td>
              <td>{reservation.reservationTime}</td>
              <td>{reservation.specialRequest || "N/A"}</td>
              <td>{new Date(reservation.createdAt).toLocaleString()}</td>
              <td style={{ color: reservation.status.color, fontWeight: "bold" }}>
                {reservation.status.text}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationsTable;
