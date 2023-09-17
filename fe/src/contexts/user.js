import axios from "axios";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext();

const UserState = (props) => {
    const URL = process.env.REACT_APP_API;

    const token = localStorage.getItem("token")
        ? localStorage.getItem("token")
        : "";
    const config = {
        headers: {
        "access-token": token,
        },
    };

    const [auth, setAuth] = useState(
        localStorage.getItem("token") ? true : false
    );

    const [userData, setUserData] = useState([]);
    const [userType, setUserType] = useState(null);

    const handleLogin = (token, userType) => {
        localStorage.setItem("token", token);
        setAuth(true);
        setUserType(userType);
    };

    const handleLogout = () => {
        if (localStorage.getItem("token")) {
            localStorage.removeItem("token");
        }
        setAuth(false);
    };


    return (
        <UserContext.Provider
            value={{
                auth,
                userType,
                userData,
                token,
                config,
                handleLogin,
                handleLogout,
            }}
            >
            {props.children}
        </UserContext.Provider>
    );
};

export { UserContext, UserState };