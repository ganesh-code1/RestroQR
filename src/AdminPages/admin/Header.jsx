import toast from "react-hot-toast";
import { useNavigate, NavLink } from "react-router-dom";
import { API_BASE_URL } from "../../config";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.clear();
        toast.success("Logged out successfully!");
        navigate("/");
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <nav className="home-header" style={{position: "sticky"}}>
        <h1 className="header-title">🍽 RestoQR</h1>
        <button onClick={handleLogout} className="headder-button">
          LOGOUT{" "}
        </button>
      </nav>
    </>
  );
};

export default Header;
