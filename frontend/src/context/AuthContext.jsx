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

    const logout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/Login");
    }

    return(
        <AuthContext.Provider value={{user, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}