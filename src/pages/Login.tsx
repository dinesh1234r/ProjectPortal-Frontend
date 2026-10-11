import { useState } from "react";
import type { LoginRequest } from "../types/auth";
import { login } from "../services/authService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const loginRequest: LoginRequest = {
      email,
      password,
    };

    try {
      const result = await login(loginRequest);

      console.log("Login successful:", result);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      <h1>ProjectPortal</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;