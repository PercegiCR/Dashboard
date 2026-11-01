import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { collection, deleteField, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { hashUserPassword, verifyUserPassword } from '../utils/userCredentials';

const AuthContext = createContext();
const DEFAULT_ROLE = { id: '1', name: 'administration', access: ['all'] };
const safeParse = (value, fallback) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};
const normalizeUsername = (value) => String(value || '').trim().toLowerCase();
const publicUser = (user) => {
  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.passwordHash;
  delete safeUser.passwordSalt;
  delete safeUser.passwordIterations;
  return safeUser;
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedRoles = safeParse(localStorage.getItem('roles'), null);
    if (!storedRoles) localStorage.setItem('roles', JSON.stringify([DEFAULT_ROLE]));

    const initialize = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const legacyUsers = safeParse(localStorage.getItem('users'), []);
        const roles = safeParse(localStorage.getItem('roles'), [DEFAULT_ROLE]);
        const usersToImport = usersSnapshot.empty && legacyUsers.length === 0
          ? [{ id: '1', name: 'Administrator', username: 'admin', password: 'admin', roleId: '1' }]
          : legacyUsers;
        for (const user of usersToImport) {
          if (!user?.username || !user?.password) continue;
          const username = normalizeUsername(user.username);
          const existingUser = usersSnapshot.docs.some(item => normalizeUsername(item.data().username) === username);
          if (existingUser) continue;
          const role = roles.find(item => String(item.id) === String(user.roleId)) || DEFAULT_ROLE;
          const credentials = await hashUserPassword(user.password);
          const userRef = user.id && !usersSnapshot.docs.some(item => item.id === String(user.id))
            ? doc(db, 'users', String(user.id))
            : doc(collection(db, 'users'));
          await setDoc(userRef, {
            ...credentials,
            name: user.name || user.username,
            username,
            roleId: String(role.id), roleName: role.name,
            roleAccess: Array.isArray(role.access) ? role.access : [],
            profilePic: user.profilePic || null,
            createdAt: new Date().toISOString()
          });
        }
        localStorage.removeItem('users');
        const storedUser = safeParse(localStorage.getItem('currentUser'), null);
        if (storedUser?.id) {
          const userRef = doc(db, 'users', String(storedUser.id));
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) setCurrentUser(publicUser({ id: userSnapshot.id, ...userSnapshot.data() }));
          else localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Firebase user initialization failed:', error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const login = useCallback(async (username, password) => {
    const normalizedUsername = normalizeUsername(username);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const matchingDocs = usersSnapshot.docs.filter(userDoc =>
        normalizeUsername(userDoc.data().username) === normalizedUsername
      );
      let matchedUser = null;

      for (const userDoc of matchingDocs) {
        const candidate = { id: userDoc.id, ...userDoc.data() };
        const localRoles = safeParse(localStorage.getItem('roles'), [DEFAULT_ROLE]);
        const roleFromLocal = localRoles.find(role => String(role.id) === String(candidate.roleId));
        candidate.roleName = candidate.roleName || roleFromLocal?.name;
        candidate.roleAccess = Array.isArray(candidate.roleAccess) ? candidate.roleAccess : roleFromLocal?.access;
        const validPassword = candidate.passwordHash
          ? await verifyUserPassword(password, candidate)
          : candidate.password === password;
        const roleIsValid = candidate.roleId && candidate.roleName && Array.isArray(candidate.roleAccess);
        if (validPassword && roleIsValid) {
          matchedUser = candidate;
          break;
        }
      }

      if (!matchedUser && normalizedUsername === 'admin' && password === 'admin' && matchingDocs.length === 0) {
        const credentials = await hashUserPassword('admin');
        matchedUser = {
          id: usersSnapshot.empty ? '1' : 'fallback-admin',
          name: 'Administrator', username: 'admin', roleId: DEFAULT_ROLE.id,
          roleName: DEFAULT_ROLE.name, roleAccess: DEFAULT_ROLE.access, profilePic: null,
          createdAt: new Date().toISOString(), ...credentials
        };
        await setDoc(doc(db, 'users', matchedUser.id), matchedUser);
      }

      if (!matchedUser) return { success: false, message: 'Username, password, atau role tidak valid.' };

      if (!matchedUser.passwordHash) {
        const credentials = await hashUserPassword(password);
        await updateDoc(doc(db, 'users', matchedUser.id), {
          ...credentials, password: deleteField(),
          roleId: String(matchedUser.roleId),
          roleName: matchedUser.roleName,
          roleAccess: matchedUser.roleAccess
        });
        matchedUser = { ...matchedUser, ...credentials };
      } else if (!Array.isArray(matchedUser.roleAccess) || !matchedUser.roleName) {
        await updateDoc(doc(db, 'users', matchedUser.id), {
          roleName: matchedUser.roleName || DEFAULT_ROLE.name,
          roleAccess: matchedUser.roleAccess || DEFAULT_ROLE.access
        });
      }

      const safeUser = publicUser(matchedUser);
      setCurrentUser(safeUser);
      localStorage.setItem('currentUser', JSON.stringify(safeUser));
      return { success: true };
    } catch (error) {
      console.error('Firebase login failed:', error);
      return { success: false, message: 'Tidak dapat memverifikasi akun di Firebase. Periksa koneksi dan izin database.' };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  }, []);

  const updateProfile = useCallback(async (updates) => {
    if (!currentUser?.id) return;
    const userUpdates = { ...updates };
    if (userUpdates.password) {
      Object.assign(userUpdates, await hashUserPassword(userUpdates.password));
      userUpdates.password = deleteField();
    }
    await updateDoc(doc(db, 'users', currentUser.id), userUpdates);
    const updatedUser = { ...currentUser, ...updates };
    delete updatedUser.password;
    delete updatedUser.passwordHash;
    delete updatedUser.passwordSalt;
    delete updatedUser.passwordIterations;
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  }, [currentUser]);

  const getRole = useCallback((roleId) => {
    if (currentUser && String(currentUser.roleId) === String(roleId) && currentUser.roleName) {
      return { id: String(currentUser.roleId), name: currentUser.roleName, access: currentUser.roleAccess || [] };
    }
    const roles = safeParse(localStorage.getItem('roles'), [DEFAULT_ROLE]);
    return roles.find(role => String(role.id) === String(roleId));
  }, [currentUser]);

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
