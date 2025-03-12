import "./assets/css/App.css";
import LoginPage from "./AdminPages/LoginPage";
import HomePage from "./AdminPages/HomePage";
import RegistrationForm from "./AdminPages/RegistrationForm ";
import { createBrowserRouter, Navigate, RouterProvider} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Applayout from "./AdminPages/admin/Applayout";
import MenuPage from "./UserPages/MenuPage";
import BookTable from "./UserPages/BookTable";
import AdminLogin from "./SuperAdmin/AdminLogin";
import AdminDashboard from "./SuperAdmin/AdminDashboard";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    { 
      path: "/register", 
      element: <RegistrationForm /> },
    {
      path: "/home",
      element: <Applayout />,
    },
    {
      path: "/:restaurantSlug/menu/:tableId?",
      element: <MenuPage />,
    },
    {
      path: "/:restaurantSlug/book-table",
      element: <BookTable />,
    },
    {
      path: "/admin-login",
      element: <AdminLogin />,
    },
    {
      path: "/admin-home",
      element: <AdminDashboard />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
