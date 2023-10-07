import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Create the AuthProvider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user is already authenticated (e.g., via a token stored in localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  // Define a login function
  const login = (jwtToken, userData) => {
    setUser({
      token: jwtToken,
      user: userData,
    });
    localStorage.setItem('user', JSON.stringify({ token: jwtToken, user: userData }));
  };
  
  // Define a logout function
  const logout = () => {
    // Remove the JWT token from storage
    localStorage.removeItem('user');
    setUser(null);
  };
  

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to access the context
export function useAuth() {
  return useContext(AuthContext);
}
