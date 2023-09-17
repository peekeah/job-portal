import axios from "axios";
import { createContext, useEffect, useState } from "react";

const UserContext = createContext();

const UserState = (props) => {
    const host = process.env.REACT_APP_BACKEND_URL

    const token = localStorage.getItem("token")
        ? localStorage.getItem("token")
        : "";

    const config = {
        headers: {
            "authorization": `Bearer ${token}`,
        },
    };

    const [auth, setAuth] = useState(
        localStorage.getItem("token") ? true : false
    );

    const [userData, setUserData] = useState([]);

    const [userType, setUserType] = useState(
        localStorage.getItem("userType") || null
    );

    useEffect(() => {
        if (auth && userType) {
            getProfileData();
        }
    }, [])

    const handleLogin = (token, userType) => {
        localStorage.setItem("token", token);
        setAuth(true);
        localStorage.setItem("userType", userType);
        setUserType(userType);
    };

    const handleLogout = () => {
        if (localStorage.getItem("token")) {
            localStorage.removeItem("token");
        }

        if (localStorage.getItem("userType")) {
            localStorage.removeItem("userType");
        }

        setAuth(false);
        setUserType(null);
    };

    const getProfileData = async () => {
        try {
            const url = `${host}/${userType}/profile`;
            const res = await axios.get(url, config);
            setUserData(res.data.data);
            return res.data.data;
        } catch (err) {
            console.log(err);
        }
    }


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
            {props.children}
        </UserContext.Provider>
    );
};

export { UserContext, UserState };