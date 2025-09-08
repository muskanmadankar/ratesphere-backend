import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "../config";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true,
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Auth check failed:", error);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const { user } = response.data;
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData, {
        withCredentials: true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setCurrentUser(null);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put(
        `${API_URL}/auth/update-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Password update failed",
      };
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updatePassword,
    isAdmin: currentUser?.role === "admin",
    isStoreOwner: currentUser?.role === "store_owner",
    isUser: currentUser?.role === "user",
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};