import { api } from "../model/generalData";

// 🧩 Get all users
export const getUsers = async () => {
  const response = await api.get(`/User`);
  return response.data; // assuming it returns an array of users
};

// 🧩 Create a new user
export const postUserToDatabase = async (userInfo) => {
  try{
 const response = await api.post(`/User`, userInfo);
  return response.data;
  }
 catch(err){
  throw(err);
 }
};

// 🧩 Login
export const loginToSite = async (userInfo) => {
  try {
    const response = await api.post(`/User/Login`, userInfo, {
      validateStatus: () => true, // don't throw on 4xx
    });

    if (response.status >= 200 && response.status < 300) {
      // ✅ Successful login
      const { user, token } = response.data;

      // Save to localStorage (so interceptor can attach token)
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

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
    console.error("Network error during login:", err);
    return {
      success: false,
      status: null,
      error: "Network error. Please try again.",
    };
  }
};

// 🧩 Update user role (admin only)
export const updateUserRole = async (userId, isAdmin) => {
  try {
    const response = await api.put(`/User/${userId}/role`, { isAdmin });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    throw error;
  }
};

// 🧩 Admin: Reset user password
export const resetUserPassword = async (userId) => {
  try {
    const newPassword = Math.random().toString(36).slice(-8); // random temp password
    await api.put(`/User/${userId}/reset_password`, { password: newPassword });
    console.log(api, newPassword)
    return newPassword; // return to display to admin
  } catch (err) {
    console.error("Failed to reset user password:", err);
    throw err;
  }
};

// 🧩 User: Change own password
export const changeUserPassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await api.put(`/User/${userId}/change_password`, {
      currentPassword,
      newPassword,
    });
    return response;
  } catch (err) {
    console.error("Failed to change user password:", err);
    throw err;
  }
};


export const resendVerificationEmail = async (user) => {
  try {
    const response = await api.post(`/User/verify/resend`, { username: user.username });
    return response;
  } catch (err) {
    throw err;
  }
};


