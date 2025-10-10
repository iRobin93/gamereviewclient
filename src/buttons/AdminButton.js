import React from "react";
import { useNavigate } from "react-router-dom";
import "../pages/GameListPage.css"; // Ensure this path is correct
export default function AdminButton({ user }) {
  const navigate = useNavigate();

  if (!user || !user.isAdmin) {
    return null; // Hide if not admin
  }

  const handleClick = () => {
    navigate("/adminPage");
  };

  return (
    <button
      onClick={handleClick}
      className="button-gamelist admin-button-gamelist"
    >
      🛠 Admin Panel
    </button>
  );
}
