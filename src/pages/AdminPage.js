import React, { useEffect, useState, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { getUsers, updateUserRole, resetUserPassword } from '../api/usersApi';
import { getAllUserGames, putUserGameToDatabase } from '../api/userGamesApi';
import { getGames } from '../api/gameApi';
import { useNavigate } from 'react-router-dom';
import '../css/adminPage.css';

function AdminPage() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editData, setEditData] = useState({ rating: '', reviewText: '', status: '' });
  const navigate = useNavigate();

  // 🧭 Load users
  const loadUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      const normalized = data.map(u => ({ ...u, isAdmin: u.isAdmin ?? u.is_admin }));
      setUsers(normalized);
      return normalized;
    } catch (err) {
      console.error('Failed to load users:', err);
      return [];
    }
  }, []);

  // 🧭 Load reviews
  const loadRecentReviews = useCallback(async (usersList) => {
    try {
      const [data, gamesList] = await Promise.all([getAllUserGames(), getGames()]);
      const reviewed = data.filter(g => g.reviewed).sort((a, b) => 0);

      const enriched = reviewed
        .map(r => ({
          ...r,
          username:
            usersList.find(u => u.id === r.user_id)?.username || 'Unknown User',
          gameTitle:
            gamesList.find(g => g.id === r.game_id)?.name ||
            gamesList.find(g => g.id === r.game_id)?.title ||
            'Unknown Game',
        }));

      setReviews(enriched);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  }, []);

  // 🪄 Load everything once
  useEffect(() => {
    if (user?.isAdmin) {
      (async () => {
        const u = await loadUsers();
        await loadRecentReviews(u);
      })();
    }
  }, [user, loadUsers, loadRecentReviews]);

  // 🔁 Toggle admin
  const handleRoleToggle = async (userId, currentStatus) => {
    try {
      await updateUserRole(userId, !currentStatus);
      setUsers(users.map(u =>
        u.id === userId ? { ...u, isAdmin: !currentStatus } : u
      ));
    } catch (error) {
      alert('Failed to update user role');
    }
  };

  // 🔐 Reset password
  const handleResetPassword = async (userId) => {
    if (!window.confirm('Reset password for this user?')) return;
    try {
      const newPassword = await resetUserPassword(userId);

      await navigator.clipboard.writeText(newPassword);
      alert(`Password reset successful.\nTemporary password: ${newPassword} \n(copied to clipboard ✅)`);
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  // 🗑️ "Delete" review (clear fields)
  const handleDeleteReview = async (review) => {
    if (!window.confirm(`Delete ${review.username}'s review for ${review.gameTitle}?`)) return;

    try {
      const clearedReview = {
        id: review.id,
        user_id: review.user_id,
        game_id: review.game_id,
        reviewed: false,
        rating: null,
        reviewText: null,
        reviewedDate: null,
        favourite: review.favourite ?? false,
        status: review.status ?? 'NotStarted'
      };

      await putUserGameToDatabase(review.id, clearedReview);
      setReviews(prev => prev.filter(r => r.id !== review.id));
    } catch (err) {
      console.error('Failed to clear review:', err);
      alert('Failed to delete review.');
    }
  };

  // ✏️ Start editing
  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditData({
      rating: review.rating ?? '',
      reviewText: review.reviewText ?? '',
      status: review.status ?? 'NotStarted'
    });
  };

  // 💾 Save edits
  const handleSaveClick = async (review) => {
    try {
      const updated = {
        id: review.id,
        user_id: review.user_id,
        game_id: review.game_id,
        reviewed: review.reviewed,
        rating: review.rating,
        reviewText: editData.reviewText ?? review.reviewText ?? '',
        reviewedDate: review.reviewedDate,
        favourite: review.favourite,
        status: review.status
      };

      console.log('PUT payload:', updated); // 👈 check this in console
      await putUserGameToDatabase(review.id, updated);

      setReviews(prev =>
        prev.map(r => (r.id === review.id ? { ...r, ...updated } : r))
      );

      setEditingReviewId(null);
    } catch (err) {
      console.error('Failed to update review:', err);
      alert('Failed to update review.');
    }
  };


  const handleCancelClick = () => {
    setEditingReviewId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // if (!user?.isAdmin) {
  //   return <div className="access-denied">Access denied — admins only.</div>;
  // }

  return (
    <div className="page-wrapper">
      <div className="page-content admin-container">
        <header className="page-header">
          <h1>Admin Dashboard</h1>
          <p>
            Welcome, <span className="admin-username">{user.username}</span>
          </p>
          <button className="button secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </header>

        {/* === Manage Users === */}
        <section className="admin-section">
          <h2>Manage Users</h2>

          <div className="card table-card">
            {/* Static header (always visible) */}
            <div className="table-header">
              <div>ID</div>
              <div>Username</div>
              <div>Role</div>
              <div>Actions</div>
            </div>

            {/* Scrollable list of users */}
            <div className="table-body">
              {users.map((u) => (
                <div key={u.id} className="table-row">
                  <div>{u.id}</div>
                  <div>{u.username}</div>
                  <div>{u.isAdmin ? "Admin" : "User"}</div>
                  <div className="actions">
                    <button
                      className={`button small ${u.isAdmin ? "demote" : "promote"}`}
                      onClick={() => handleRoleToggle(u.id, u.isAdmin)}
                    >
                      {u.isAdmin ? "Demote" : "Promote"}
                    </button>
                    <button
                      className="button small neutral"
                      onClick={() => handleResetPassword(u.id)}
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* === Recent Reviews === */}
        <section className="admin-section">
          <h2>Recent Reviews</h2>
          <div className="card reviews-card">
            {reviews.length === 0 ? (
              <p>No recent reviews found.</p>
            ) : (
              reviews.slice(0, 10).map((r) => (
                <div key={r.id} className="review-card">
                  <strong>{r.username}</strong> reviewed <em>{r.gameTitle}</em>

                  {editingReviewId === r.id ? (
                    <>
                      <label>
                        Review:
                        <textarea
                          name="reviewText"
                          value={editData.reviewText}
                          onChange={handleChange}
                        />
                      </label>
                      <div className="review-actions">
                        <button
                          className="button small"
                          onClick={() => handleSaveClick(r)}
                        >
                          💾 Save
                        </button>
                        <button
                          className="button small neutral"
                          onClick={handleCancelClick}
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>Rating: {r.rating ?? "N/A"}</p>
                      <p>{r.reviewText ?? "N/A"}</p>
                      <div className="review-actions">
                        <button
                          className="button small"
                          onClick={() => handleEditClick(r)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="button small danger"
                          onClick={() => handleDeleteReview(r)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );


}

export default AdminPage;
