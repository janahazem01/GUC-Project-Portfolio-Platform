/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import { dummyUsers } from "../data/dummy";

export const AuthContext = createContext();

// Simple OTP generator for demo
const generateOtp = () => Math.random().toString().slice(2, 6);
const userOverridesStorageKey = "gucUserOverrides";

const getUserOverrides = () => {
  try {
    const raw = localStorage.getItem(userOverridesStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveUserOverrides = (overrides) => {
  localStorage.setItem(userOverridesStorageKey, JSON.stringify(overrides));
};

const mergeWithLatestDummyUser = (savedUser) => {
  if (!savedUser?.email) return savedUser;

  const latestDummyUser = dummyUsers.find((dummyUser) => dummyUser.email === savedUser.email);
  const savedOverrides = getUserOverrides()[savedUser.email] || {};
  const mergedUser = latestDummyUser
    ? { ...latestDummyUser, ...savedUser, ...savedOverrides }
    : { ...savedUser, ...savedOverrides };
  delete mergedUser.password;
  return mergedUser;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [resetOtp, setResetOtp] = useState(null);
  const loading = false;

  const login = (email, password) => {
    const localUsers = getLocalUsers();
    const allUsers = [...dummyUsers, ...localUsers];
    
    const foundUser = allUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!foundUser) {
      return { success: false, error: "Invalid email or password" };
    }

    const loggedInUser = mergeWithLatestDummyUser({ ...foundUser });
    delete loggedInUser.password; // Don't store password
    
    setUser(loggedInUser);
    return { success: true, user: loggedInUser };
  };

  const getLocalUsers = () => {
    try {
      const raw = localStorage.getItem("localUsers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveLocalUsers = (arr) => {
    localStorage.setItem("localUsers", JSON.stringify(arr));
  };

  const persistUserProfile = (nextUser) => {
    if (!nextUser?.email) return;

    const cleanUser = { ...nextUser };
    delete cleanUser.password;

    const localUsers = getLocalUsers();
    const hasLocalUser = localUsers.some((localUser) => localUser.email === cleanUser.email);

    if (hasLocalUser) {
      saveLocalUsers(
        localUsers.map((localUser) =>
          localUser.email === cleanUser.email
            ? { ...localUser, ...cleanUser, password: localUser.password }
            : localUser
        )
      );
    }

    const overrides = getUserOverrides();
    saveUserOverrides({
      ...overrides,
      [cleanUser.email]: {
        ...(overrides[cleanUser.email] || {}),
        ...cleanUser,
      },
    });
  };

  const register = (payload) => {
    // payload can be { name, email, password, role } or employer fields like { companyName, companyEmail }
    const email = payload.email || payload.companyEmail;
    if (!email) return { success: false, error: "Email is required" };

    const localUsers = getLocalUsers();
    const existsInDummy = dummyUsers.find((u) => u.email === email);
    const existsInLocal = localUsers.find((u) => u.email === email);

    if (existsInDummy || existsInLocal) {
      return { success: false, error: "Email already registered" };
    }

    const role = payload.role || "student";

    const newUser = {
      id: Date.now(),
      role,
      favoriteProjectIds: [],
      favoritePortfolioIds: [],
      ...payload,
      email,
    };

    const next = [...localUsers, newUser];
    saveLocalUsers(next);

    const loggedInUser = { ...newUser };
    delete loggedInUser.password;
    setUser(loggedInUser);

    return { success: true, user: loggedInUser };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updatedData) => {
    if (!user) return;
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    persistUserProfile(newUser);
  };

  const requestPasswordReset = (email) => {
    const allUsers = [...dummyUsers, ...getLocalUsers()];
    const foundUser = allUsers.find((u) => u.email === email);
    if (!foundUser) {
      return { success: false, error: "Email not found" };
    }

    const otp = generateOtp();
    setResetOtp({ email, otp, timestamp: Date.now() });
    return { success: true, message: "OTP sent", otp };
  };

  const verifyOtpAndReset = (email, otp, newPassword) => {
    if (!resetOtp || resetOtp.email !== email || resetOtp.otp !== otp) {
      return { success: false, error: "Invalid OTP" };
    }

    if (Date.now() - resetOtp.timestamp > 10 * 60 * 1000) {
      return { success: false, error: "OTP expired" };
    }

    const localUsers = getLocalUsers();
    const foundInLocal = localUsers.find((u) => u.email === email);

    if (foundInLocal) {
      const updated = localUsers.map((u) =>
        u.email === email ? { ...u, password: newPassword } : u
      );
      saveLocalUsers(updated);
      setResetOtp(null);
      return { success: true, message: "Password reset successfully" };
    }

    setResetOtp(null);
    return { success: true, message: "Password reset successfully (seeded user)" };
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, updateUser, register, requestPasswordReset, verifyOtpAndReset, resetOtp, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
