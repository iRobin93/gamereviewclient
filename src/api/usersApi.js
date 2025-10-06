import axios from 'axios';
import { BASE_URL } from '../model/generalData';
// replace with actual URL

export const getUsers = async () => {
  const response = await axios.get(`${BASE_URL}/User`);
  return response.data; // assuming it returns an array of users
};

export const postUserToDatabase = async (userInfo) => {
  const response = await axios.post(`${BASE_URL}/User`, userInfo);
  return response.data;
};



export const loginToSite = async (userInfo) => {
  try {
    const response = await axios.post(`${BASE_URL}/User/Login`, userInfo, {
      validateStatus: () => true, // don't throw on 4xx
    });

    if (response.status >= 200 && response.status < 300) {
      // ✅ Successful login
      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } else {
      // ❌ Backend returned an error (e.g. 401)
      return {
        success: false,
        status: response.status,
        error: response.data?.error || "Login failed",
      };
    }
  } catch (err) {
    // ❌ Network or unexpected error
    return {
      success: false,
      status: null,
      error: "Network error. Please try again.",
    };
  }
};

// ✅ Update user role (admin / normal)
export async function updateUserRole(userId, isAdmin) {
  try {
    const response = await axios.put(`${BASE_URL}/User/${userId}/role`, { isAdmin });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  }
}


export async function resetUserPassword(userId) {
  try {
    // generate a random temporary password
    const newPassword = Math.random().toString(36).slice(-8); // e.g. "a9k2x8qz"

    // send the update request
    await axios.put(`${BASE_URL}/User/${userId}/password`, {
      password: newPassword,
    });

    // return the new password (for admin to show)
    return newPassword;
  } catch (err) {
    console.error("Failed to reset user password:", err);
    throw err;
  }
}