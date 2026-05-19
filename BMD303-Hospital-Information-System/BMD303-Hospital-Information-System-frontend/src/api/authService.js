import apiClient from "./apiClient";

const CURRENT_USER_KEY = "clinic_current_user";

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/Auth/login", { email, password });
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: "Login successful"
        };
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid email or password"
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post("/api/Auth/register", userData);
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.data.user));
        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
          message: "Registration successful!"
        };
      }
      return { success: false, message: "Registration failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration error"
      };
    }
  },

  getProfile: async () => {
    try {
      const response = await apiClient.get("/api/Auth/profile");
      return response.data;
    } catch (error) {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("physio_token");
    window.location.href = "/login";
  },

  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};

export default authService;
