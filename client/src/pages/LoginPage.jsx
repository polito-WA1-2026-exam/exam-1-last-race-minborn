import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logIn } from "../API.js";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const user = await logIn({ username, password });
      onLogin(user);
      navigate("/ranking");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h1>Login</h1>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Username
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">Login</button>
      </form>
    </section>
  );
}

export default LoginPage;
