import React, { useState } from "react";
import axios from "axios";
import "./Styles/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [correspondent, setCorrespondent] = useState("");

  const login = async () => {
    try {
      const response = await axios.post(
        "https://one-place-clone.onrender.com/login",
        { username, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        window.location.href = "/";
      } else {
        setCorrespondent(response.data.message);
        console.log(correspondent);
      }
    } catch (error) {
      console.log("Error  registering User ", error);
    }
  };

  return (
    <div className="bodyWrap flex flex-col relative">
      <div className="contentLoginWrap">
        <div className="loginSide">
          <div className="-translate-y-14">
            <h1>Login</h1>
            <div className="input-group">
              <input
                type="text"
                className="input"
                onChange={(e) => setUsername(e.target.value)}
                required="required"
                name="username"
              />
              <label className={`${username.length > 0 ? "focusLabel" : ""}`}>
                Username
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                className="input password"
                onChange={(e) => setPassword(e.target.value)}
                required="required"
                name="password"
              />
              <label className={`${password.length > 0 ? "focusLabel" : ""}`}>
                Password
              </label>
            </div>
            <button onClick={login}>Login</button>
            {
              <div className="correspondent font-medium text-sm mt-2 text-red-500">
                {correspondent}
              </div>
            }
          </div>
        </div>
        <div className="infoSide">
          <div className="loginWrap">
            <h2>Hello again!</h2>
            <p>Log in to your account to get access to app. </p>
          </div>
        </div>
      </div>
      <a
        href="/register"
        className="absolute right-5 bottom-5 rounded-lg bg-stone-200 px-3 py-1 font-semibold underline underline-offset-2 decoration-black decoration-1 hover:decoration-stone-200 transition-colors duration-200 ease-in-out"
      >
        <span className="text-sm font-normal">Don't have an account?</span>
        Register
      </a>
    </div>
  );
}
