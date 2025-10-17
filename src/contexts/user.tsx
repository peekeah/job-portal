"use client";
import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";

export type UserType = "student" | "company" | "admin" | null;

type UserContextType = {
  auth: boolean;
  userType: UserType;
  userData: any;
  token: string | null;
  config: { headers: { authorization: string } };
  getProfileData: () => Promise<any>;
  handleLogin: (token: string, userType: Exclude<UserType, null>) => void;
  handleLogout: () => void;
};

export const UserContext = createContext<UserContextType>({
  auth: false,
  userType: "student",
  userData: null,
  token: null,
  config: { headers: { authorization: "" } },
  getProfileData: async () => [],
  handleLogin: () => {},
  handleLogout: () => {},
});

export const UserState = ({ children }: { children: ReactNode }) => {
  const host = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [auth, setAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedType = localStorage.getItem("userType") as UserType | null;

    if (storedToken) {
      setToken(storedToken);
      setAuth(true);
    }
    if (storedType) {
      setUserType(storedType);
    }
  }, []);

  const config = {
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  };

  const handleLogin = (token: string, userType: Exclude<UserType, null>) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userType", userType);
    setToken(token);
    setUserType(userType);
    setAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setToken(null);
    setUserType(null);
    setAuth(false);
  };

  const getProfileData = async () => {
    if (!userType || !host) return null;
    try {
      const url = `${host}/${userType}/profile`;
      const res = await axios.get(url, config);
      setUserData(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error("Profile fetch failed:", err);
      return null;
    }
  };

  useEffect(() => {
    if (auth && userType) {
      getProfileData();
    }
  }, [auth, userType]);

  return (
    <UserContext.Provider
      value={{
        auth,
        userType,
        userData,
        token,
        config,
        getProfileData,
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
