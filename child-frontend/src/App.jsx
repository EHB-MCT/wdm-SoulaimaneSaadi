import { useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [child, setChild] = useState(null);

  async function login() {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      setChild(data);
    } else {
      alert("Login failed");
    }
  }

  async function register() {
    const res = await fetch("http://localhost:3000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: email, // simple: use email as name
        email,
        password
      })
    });

    if (res.ok) {
      const data = await res.json();
      setChild(data);
    } else {
      alert("Register failed");
    }
  }

  if (!child) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Child Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ marginTop: 10 }}>
          <button onClick={login}>Login</button>
          <button onClick={register} style={{ marginLeft: 8 }}>
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome {child.name}</h1>

      <button
  disabled={child.isRestricted}
  onClick={async () => {
    const res = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: child._id,
        type: "LOAN_BALL"
      })
    });

    if (res.ok) {
      alert("Ball asked ✅");
    } else {
      alert("Error");
    }
  }}
>
  Take the ball
</button>

      {child.isRestricted && (
        <p>This item is not available today.</p>
      )}
    </div>
  );
}
