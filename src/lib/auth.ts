
// Simple mock authentication service

// Pre-defined user credentials
const DEFAULT_USER = {
  email: "aditya1234@gmail.com",
  password: "12345678",
  name: "Aditya"
};

// Store session in localStorage
const TOKEN_KEY = "scoutant_auth_token";
const USER_KEY = "scoutant_user";

export type User = {
  email: string;
  name: string;
};

export const auth = {
  // Login with credentials
  login: (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
          // Create a fake token
          const token = `token_${Math.random().toString(36).substring(2)}`;
          // Store token and user in localStorage
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem(USER_KEY, JSON.stringify({ email: DEFAULT_USER.email, name: DEFAULT_USER.name }));
          resolve({ email: DEFAULT_USER.email, name: DEFAULT_USER.name });
        } else {
          reject(new Error("Invalid email or password"));
        }
      }, 800);
    });
  },

  // Register a new user
  register: (name: string, email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        // In a real app, you would validate and save the user
        // For demo, just simulate success and use the DEFAULT_USER
        const token = `token_${Math.random().toString(36).substring(2)}`;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify({ email: DEFAULT_USER.email, name: DEFAULT_USER.name }));
        resolve({ email: DEFAULT_USER.email, name: DEFAULT_USER.name });
      }, 800);
    });
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return localStorage.getItem(TOKEN_KEY) !== null;
  },

  // Get current user
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch (e) {
      return null;
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get default credentials for demo
  getDefaultCredentials: () => {
    return {
      email: DEFAULT_USER.email,
      password: DEFAULT_USER.password
    };
  }
};
