import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getUsers, updateUserRole } from '../api/usersApi';
import { useNavigate } from 'react-router-dom';
import '../css/adminPage.css';

function AdminPage() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isAdmin) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    const data = await getUsers();
    const normalized = data.map(u => ({ ...u, isAdmin: u.isAdmin ?? u.is_admin }));
    setUsers(normalized);
  };

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

  if (!user?.isAdmin) {
    return <div className="access-denied">Access denied — admins only.</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, <span className="admin-username">{user.username}</span></p>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.isAdmin ? 'Admin' : 'User'}</td>
              <td>
                <button
                  className={`role-btn ${u.isAdmin ? 'demote' : 'promote'}`}
                  onClick={() => handleRoleToggle(u.id, u.isAdmin)}
                >
                  {u.isAdmin ? 'Demote' : 'Promote'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
