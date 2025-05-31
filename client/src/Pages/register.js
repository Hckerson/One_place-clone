import React, { useState } from "react";
import axios from "axios";
import "./Styles/login.css";
import clsx from "clsx";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [exist, setExist] = useState(false);
  const [email, setEmail] = useState("");

  const register = async () => {
    setEmail("");
    setUsername("");
    setPassword("");
    try {
      const response = await axios.post(
        "https://one-place-clone.onrender.com/register",
        { username, password, email },
        { withCredentials: true }
      );
      console.log(response.data);
      if (response.data.message === "success") {
        window.location.href = "/";
      } else if (response.data.message === "User already exists") {
        setEmail("User already exists");
        setExist(true);
        const id = setTimeout(() => {
          setExist(false);
          setEmail("");
        }, 3000);

        return () => clearTimeout(id);
      } else {
        window.location.href = "/register";
      }
    } catch (error) {
      console.log("Error  registering  ", error);
    }
  };

  return (
    <div className="bodyWrap flex flex-col relative">
      <div className="contentLoginWrap">
        <div className="loginSide">
          <div className="-translate-y-14">
            <h1>Register</h1>
            <div className="input-group">
              <input
                type="text"
                className="input"
                name="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                required="required"
              />
              <label className={`${email.length > 0 ? "focusLabel" : ""}  `}>
                Email
              </label>
            </div>
            <div className="input-group">
              <input
                type="text"
                className="input"
                value={username}
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
                value={password}
                name="password"
              />
              <label className={`${password.length > 0 ? "focusLabel" : ""}`}>
                Password
              </label>
            </div>
            <button onClick={register}>Register</button>
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
        href="/login"
        className={clsx(
          "absolute right-5 bottom-5 rounded-lg bg-stone-200 px-3 py-1 font-semibold underline underline-offset-2 decoration-black decoration-1 hover:decoration-stone-200  duration-200 ease-in-out animate__animated transition-all",
          exist && "animate__bounce"
        )}
      >
        <span className="text-sm font-normal">Already have an account?</span>
        Login
      </a>
    </div>
  );
}
