import React, { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthLoginInfo = createContext({});
export function AuthLogin(props) {
  const [user, setUser] = useState();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await axios.get(
          "https://one-place-clone.onrender.com/user",
          {
            withCredentials: true,
          }
        );
        const response = user.data;
        setUser(response);
      } catch (error) {
        console.log("Error fetching user");
      }
    };
    fetchData();
  }, []);
  return (
    <AuthLoginInfo.Provider value={user}>
      {props.children}
    </AuthLoginInfo.Provider>
  );
}
