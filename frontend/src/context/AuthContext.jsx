import React, {createContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
export const AuthProvider = ({children})=>{
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(()=>{
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if(storedUser && token){
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (data)=>{
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
    }

    const updateUser = (patch) => {
        setUser((prev) => {
            const nextUser = { ...(prev || {}), ...(patch || {}) };
            localStorage.setItem("user", JSON.stringify(nextUser));
            return nextUser;
        });
    };

    const logout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/");
    }

    return(
        <AuthContext.Provider value={{user, login, logout, updateUser}}>
            {children}
        </AuthContext.Provider>
    )
}
