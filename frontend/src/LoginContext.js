// LoginContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase-config";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const LoginContext = createContext();

export async function getIdToken() {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      return idToken;
    } else {
      throw new Error("User not logged in");
    }
  } catch (error) {
    console.error("Error getting ID token: ", error.message);
    throw error;
  }
}

export function useLogin() {
  return useContext(LoginContext);
}

export function LoginProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error during login: ", error.message);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  return (
    <LoginContext.Provider value={{ user, login, logout, getIdToken }}>
      {children}
    </LoginContext.Provider>
  );
}

export default LoginContext;
