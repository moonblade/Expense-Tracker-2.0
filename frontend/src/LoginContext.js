// LoginContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase-config";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const LoginContext = createContext();

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
    <LoginContext.Provider value={{ user, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
}

