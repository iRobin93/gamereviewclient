import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminButton({ user }) {
  const navigate = useNavigate();

  if (!user) {
    return null; // Hide if not admin
  }

  const handleClick = () => {
    navigate("/adminPage");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
    >
      🛠 Admin Panel
    </button>
  );
}
