import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import "../assets/css/Menu.css";
import { API_BASE_URL } from "../config";

const MenuPage = () => {
  const { restaurantSlug, tableId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [deliveryType, setDeliveryType] = useState("EatIn");
  const [note, setNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [orderId, setOrderId] = useState(null);
  const socket = io(API_BASE_URL);

  // Place Order Function
  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    if (
      !customerMobile.trim() ||
      customerMobile.length !== 10 ||
      isNaN(customerMobile)
    ) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const orderData = {
      restaurantName: restaurantSlug,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      deliveryType,
      note: note.trim(),
      items: cart.map((item) => ({
        itemName: item.itemName,
        itemCost: item.itemCost,
        itemCategory: item.itemCategory,
        quantity: item.quantity || 1,
      })),
      couponCode: couponCode || null,
      tableId: tableId || null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrderId(data.order.orderId);
        toast.success("Order placed successfully!");
        socket.emit("orderPlaced", { restaurantSlug }); // Notify admin panel about the new order
        setCart([]);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to place order.");
      }
    } catch (error) {
      toast.error("Error placing order.");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/menu/${restaurantSlug}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();

        if (response.ok) {
          // const data = await response.json();
          setMenuItems(data);
        } else if (data.error == "Restaurant is Closed") {
          toast.error("Restaurant is Closed");
        } else {
          toast.error("Failed to load menu");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Error loading menu");
      }
    };

    fetchMenu();
  }, [restaurantSlug]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => cartItem._id === item._id
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast.success(`${item.itemName} added to cart!`);
  };

  const removeFromCart = (item) => {
    setCart((prevCart) =>
      prevCart
        .map((cartItem) =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const uniqueCategories = [
    ...new Set(menuItems.map((item) => item.itemCategory)),
  ];

  useEffect(() => {
    const total = cart.reduce(
      (acc, item) => acc + item.itemCost * item.quantity,
      0
    );
    const discountedAmount = total - (total * discount) / 100;
    setDiscountedTotal(discountedAmount);
  }, [cart, discount]); // Recalculate when cart or discount changes

  const verifyCoupon = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/offers/verify-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ couponCode, restaurantSlug }),
      });

      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discountPercentage);

        // Apply discount
        const total = cart.reduce(
          (acc, item) => acc + item.itemCost * item.quantity,
          0
        );
        const discountedAmount =
          total - (total * data.discountPercentage) / 100;
        setDiscountedTotal(discountedAmount);

        toast.success(`Coupon applied! ${data.discountPercentage}% discount.`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Invalid coupon code");
        setCouponCode("");
        setDiscount(0);
        setDiscountedTotal(0);
      }
    } catch (error) {
      console.error("Error verifying coupon:", error);
      toast.error("Error verifying coupon");
    }
  };

  return (
    <>
      <div className="item-container">
        <div className="text-center wow fadeInUp">
          <h5 className="section-title ff-secondary text-center text-primary fw-normal">
            Browse our menu
          </h5>
        </div>
        {orderId ? (
          // Order Success Message
          <>
            <div className="order-success">
              <h2>🎉 Order Placed Successfully!</h2>
              <p>
                Your Order ID: <strong>{orderId}</strong>
              </p>
            </div>
          </>
        ) : (
          <>
            {showCheckout ? (
              // Checkout View
              <div className="cart-container">
                <button
                  className="back-to-menu-btn"
                  onClick={() => setShowCheckout(false)}
                >
                  Back to Menu
                </button>
                <h3 className="cart-title">Your Order</h3>

                {cart.length > 0 ? (
                  <>
                    <ul className="cart-list">
                      {cart.map((item) => (
                        <li key={item._id} className="cart-item">
                          <span>
                            {item.itemName} - ₹{item.itemCost} x{" "}
                          </span>
                          <div>
                            <button
                              onClick={() => removeFromCart(item)}
                              className="remove-btn"
                            >
                              -
                            </button>
                            {item.quantity}
                            <button
                              onClick={() => addToCart(item)}
                              className="add-btn"
                            >
                              +
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="cart-total">
                      {discount > 0 ? (
                        <>
                          <span className="original-price">
                            Total Cost - ₹
                            {cart.reduce(
                              (acc, item) =>
                                acc + item.itemCost * item.quantity,
                              0
                            )}
                          </span>
                          <br />
                          <br />
                          <span className="discounted-price">
                            Cost after {discount}% - ₹{discountedTotal}
                          </span>
                        </>
                      ) : (
                        <>
                          Total: ₹
                          {cart.reduce(
                            (acc, item) => acc + item.itemCost * item.quantity,
                            0
                          )}
                        </>
                      )}
                    </p>

                    {/* Delivery Type Selection */}
                    <div className="delivery-type">
                      <h4>Delivery Type</h4>
                      <button
                        className={`delivery-btn ${
                          deliveryType === "EatIn" ? "active" : ""
                        }`}
                        onClick={() => setDeliveryType("EatIn")}
                      >
                        Eat In
                      </button>
                      <button
                        className={`delivery-btn ${
                          deliveryType === "Takeaway" ? "active" : ""
                        }`}
                        onClick={() => setDeliveryType("Takeaway")}
                      >
                        Takeaway
                      </button>
                    </div>

                    {/* Customer Details */}
                    <div className="customer-details">
                      <input
                        type="text"
                        className="customer-details-input"
                        placeholder="Your Name"
                        value={customerName}
                        required
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="customer-details-input"
                        placeholder="Mobile Number"
                        value={customerMobile}
                        minLength={10}
                        maxLength={10}
                        required
                        onChange={(e) => setCustomerMobile(e.target.value)}
                      />
                      <textarea
                        placeholder="Additional Notes (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                      <div className="coupon-section">
                        <input
                          type="text"
                          className="customer-details-input"
                          placeholder="Enter Coupon Code (Optional)"
                          value={couponCode}
                          onChange={(e) =>
                            setCouponCode(e.target.value.toUpperCase())
                          }
                        />
                        <button onClick={verifyCoupon}>Verify</button>
                      </div>
                    </div>

                    <button onClick={placeOrder} className="place-order-btn">
                      Place Order
                    </button>
                  </>
                ) : (
                  <p className="empty-cart">Cart is empty.</p>
                )}
              </div>
            ) : (
              // Menu View
              <>
                {/* Search */}
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="What would you like to eat?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* Category Selection as Buttons */}
                <div className="category-buttons">
                  <button
                    onClick={() => setCategoryFilter("")}
                    className={categoryFilter === "" ? "active" : ""}
                  >
                    All
                  </button>
                  {uniqueCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={categoryFilter === category ? "active" : ""}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Menu Items Grouped by Category */}
                <div className="menu-list">
                  {uniqueCategories
                    .filter(
                      (category) =>
                        !categoryFilter || category === categoryFilter
                    )
                    .map((category) => (
                      <div key={category} className="category-section">
                        <h3 className="category-title">{category}</h3>
                        <div className="menu-items">
                          {menuItems
                            .filter(
                              (item) =>
                                item.itemCategory === category &&
                                item.itemName
                                  .toLowerCase()
                                  .includes(search.toLowerCase())
                            )
                            .map((item) => (
                              <div key={item._id} className="menu-item">
                                <img
                                  src={
                                    item.itemImage instanceof File
                                      ? URL.createObjectURL(item.itemImage)
                                      : `${API_BASE_URL}${item.itemImage}`
                                  }
                                  alt={item.itemName}
                                  className="item-image"
                                />
                                <div className="item-details">
                                  <h4 className="item-header">
                                    <span className="item-name">
                                      {item.itemName}
                                    </span>
                                    <span className="price">
                                      ₹{item.itemCost}
                                    </span>
                                  </h4>
                                  <p className="description">
                                    {item.itemDescription}
                                  </p>
                                  {cart.some(
                                    (cartItem) => cartItem._id === item._id
                                  ) ? (
                                    <div className="quantity-controls">
                                      <button
                                        onClick={() => removeFromCart(item)}
                                      >
                                        -
                                      </button>
                                      <span>
                                        {cart.find(
                                          (cartItem) =>
                                            cartItem._id === item._id
                                        )?.quantity || 0}
                                      </span>
                                      <button onClick={() => addToCart(item)}>
                                        +
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => addToCart(item)}
                                      className="add-to-cart-btn"
                                    >
                                      ADD
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Proceed to Checkout Button */}
                {cart.length > 0 && (
                  <button
                    className="checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    {cart.length} Items Selected - Proceed to Checkout
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MenuPage;
