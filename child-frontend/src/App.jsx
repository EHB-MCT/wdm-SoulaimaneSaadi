import { useEffect, useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [child, setChild] = useState(null);

  // public children list 
  const [publicChildren, setPublicChildren] = useState([]);

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
        name: email,
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

  async function loadPublicChildren() {
    const res = await fetch("http://localhost:3000/children/public");
    const data = await res.json();
    setPublicChildren(data);
  }

  useEffect(() => {
    if (child) loadPublicChildren();
  }, [child]);

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

      /* Take ball */
      <button
        disabled={child.isRestricted}
        onClick={async () => {
          const res = await fetch("http://localhost:3000/loan/take", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childId: child._id,
              itemName: "Ball"
            })
          });

          if (res.ok) {
            alert("Ball taken ✅");
            loadPublicChildren();
          } else {
            alert("Error");
          }
        }}
      >
        Take the ball
      </button>

      {child.isRestricted && (
        <p>You need to be more kind buddy.</p>
      )}

      /* ÉTAPE 12 — Other kids */
      <h2 style={{ marginTop: 30 }}>Other kids</h2>

      {publicChildren.map((publicChild) => (
        <div key={publicChild._id}>
          <strong>{publicChild.name}</strong> —{" "}
          {publicChild.currentItem ? publicChild.currentItem : "nothing"}
        </div>
      ))}
    </div>
  );
}
