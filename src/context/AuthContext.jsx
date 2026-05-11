import { createContext, useState } from "react";
import { dummyUsers, emitDummyUpdate } from "../data/dummy";

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
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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
    localStorage.setItem("user", JSON.stringify(loggedInUser));
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
    // payload can be { name, email, password, role } or employer fields like { companyName, companyEmail, uploadedDocs }
    const email = String(payload.email || payload.companyEmail || "").trim();
    if (!email) return { success: false, error: "Email is required" };

    const localUsers = getLocalUsers();
    const emailTaken = (u) =>
      u &&
      (u.email === email ||
        (u.companyEmail && String(u.companyEmail).trim() === email));
    const existsInDummy = dummyUsers.find(emailTaken);
    const existsInLocal = localUsers.find(emailTaken);

    if (existsInDummy || existsInLocal) {
      return { success: false, error: "Email already registered" };
    }

    const role =
      payload.role ||
      (email.includes("@student.guc.edu.eg")
        ? "student"
        : email.includes("@guc.edu.eg")
        ? "instructor"
        : "employer");

    const baseUser = {
      id: Date.now(),
      role,
      favoriteProjectIds: [],
      favoritePortfolioIds: [],
      ...payload,
      email,
    };

    let newUser = baseUser;

    if (role === "employer") {
      const companyEmail = String(payload.companyEmail || email).trim();
      newUser = {
        ...baseUser,
        email,
        companyEmail,
        companyName: String(payload.companyName || "").trim() || baseUser.companyName,
        companyBio: payload.companyBio ?? "",
        address: payload.address ?? "",
        location: payload.location ?? "",
        companyPhone: payload.companyPhone ?? "",
        verificationStatus: "pending",
        uploadedDocs: Array.isArray(payload.uploadedDocs) ? payload.uploadedDocs : [],
        status: payload.status ?? "active",
      };
    }

    const next = [...localUsers, newUser];
    saveLocalUsers(next);

    const loggedInUser = { ...newUser };
    delete loggedInUser.password;

    if (role === "employer") {
      emitDummyUpdate();
      return { success: true, user: loggedInUser };
    }

    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    return { success: true, user: loggedInUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateVerificationStatus = (userEmail, status) => {
    if (!userEmail) return;

    const norm = (value) => String(value || "").trim().toLowerCase();
    const target = norm(userEmail);

    // 1. Update localStorage "localUsers" (match login or company email, case-insensitive)
    const localUsers = getLocalUsers();
    const updatedLocal = localUsers.map((u) =>
      norm(u.email) === target || norm(u.companyEmail) === target ? { ...u, verificationStatus: status } : u
    );
    saveLocalUsers(updatedLocal);

    // 2. Update localStorage "gucUserOverrides" for every key that refers to the same employer
    const overrides = getUserOverrides();
    const patch = { verificationStatus: status };
    const employerRecord = [...dummyUsers, ...localUsers].find(
      (u) =>
        u?.role === "employer" &&
        (norm(u.email) === target || norm(u.companyEmail) === target)
    );

    const keys = new Set([userEmail]);
    if (employerRecord?.email) keys.add(employerRecord.email);
    if (employerRecord?.companyEmail) keys.add(employerRecord.companyEmail);

    const next = { ...overrides };
    keys.forEach((key) => {
      if (!key) return;
      next[key] = { ...(next[key] || {}), ...patch };
    });
    saveUserOverrides(next);

    // 3. Update current logged in user if they are the target (either identifier)
    if (
      user &&
      (norm(user.email) === target ||
        norm(user.companyEmail) === target ||
        (employerRecord && norm(user.email) === norm(employerRecord.email)))
    ) {
      setUser((prev) => (prev ? { ...prev, verificationStatus: status } : prev));
    }

    emitDummyUpdate();
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
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        updateUser,
        updateVerificationStatus,
        register,
        getLocalUsers,
        requestPasswordReset,
        verifyOtpAndReset,
        resetOtp,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

