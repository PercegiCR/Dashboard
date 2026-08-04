import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize default data if not present
    let roles = JSON.parse(localStorage.getItem('roles'));
    if (!roles) {
      roles = [
        { id: '1', name: 'administration', access: ['all'] }
      ];
      localStorage.setItem('roles', JSON.stringify(roles));
    }

    let users = JSON.parse(localStorage.getItem('users'));
    if (!users) {
      users = [
        { 
          id: '1', 
          name: 'Administrator', 
          username: 'admin', 
          password: 'admin', 
          roleId: '1', 
          profilePic: null 
        }
      ];
      localStorage.setItem('users', JSON.stringify(users));
    }

    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = useCallback((username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
    }
    
    return { success: false, message: 'Username atau password salah' };
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateProfile = useCallback((updates) => {
    setCurrentUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Also update in users list
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
      }
      return updatedUser;
    });
  }, []);

  const getRole = useCallback((roleId) => {
    const roles = JSON.parse(localStorage.getItem('roles')) || [];
    return roles.find(r => r.id === roleId);
  }, []);

  const hasAccess = useCallback((pageId) => {
    if (!currentUser) return false;
    const role = getRole(currentUser.roleId);
    if (!role) return false;
    if (role.access.includes('all')) return true;
    return role.access.includes(pageId);
  }, [currentUser, getRole]);

  const value = useMemo(() => ({
    currentUser, login, logout, updateProfile, getRole, hasAccess
  }), [currentUser, login, logout, updateProfile, getRole, hasAccess]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
