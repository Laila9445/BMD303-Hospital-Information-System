import apiClient from './apiClient';

// Simple localStorage user storage
const USERS_KEY = 'clinic_users';
const CURRENT_USER_KEY = 'clinic_current_user';

// Get all users from localStorage
const getUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Generate user ID
const generateUserId = () => {
  const users = getUsers();
  return users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1;
};

const authService = {
  // Login user
  login: async (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user;
      
      localStorage.setItem('token', 'local-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      return {
        success: true,
        token: 'local-token',
        user: userWithoutPassword,
        message: 'Login successful'
      };
    }
    
    return {
      success: false,
      message: 'Invalid email or password'
    };
  },

  // Register new user
  register: async (userData) => {
    const users = getUsers();
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        message: 'Email already registered'
      };
    }
    
    // Create new user
    const newUser = {
      ...userData,
      userId: generateUserId(),
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Remove password before storing in session
    const { password: _, ...userWithoutPassword } = newUser;
    
    localStorage.setItem('token', 'local-token-' + Date.now());
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    
    return {
      success: true,
      token: 'local-token',
      user: userWithoutPassword,
      message: 'Registration successful!'
    };
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await apiClient.get('/api/Auth/profile');
      return response.data;
    } catch (error) {
      // Fallback to localStorage
      const user = localStorage.getItem('user');
      if (user) {
        return JSON.parse(user);
      }
      return null;
    }
  },

  // Logout user — clear clinic session and physio portal token (separate mini auth)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('physio_token');
  },

  // Get authenticated user from local storage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get all registered users (for admin purposes)
  getAllUsers: () => {
    return getUsers();
  },

  // Clear all users (for testing)
  clearAllUsers: () => {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const initializeDefaultUsers = () => {
  const users = getUsers();
  const defaultUsers = [
    {
      userId: 1,
      email: 'doctor@clinic.com',
      password: '123',
      role: 'Doctor',
      firstName: 'Ahmed',
      lastName: 'Nabil'
    },
    {
      userId: 2,
      email: 'nurse@clinic.com',
      password: '123',
      role: 'Nurse',
      firstName: 'Sara',
      lastName: 'Mohamed'
    },
    {
      userId: 3,
      email: 'patient@clinic.com',
      password: '123',
      role: 'Patient',
      firstName: 'Mohamed',
      lastName: 'Ali'
    }
  ];
  defaultUsers.forEach(u => {
    if (!users.find(x => x.email === u.email)) {
      users.push(u);
    }
  });
  saveUsers(users);
};

initializeDefaultUsers();

export default authService;
