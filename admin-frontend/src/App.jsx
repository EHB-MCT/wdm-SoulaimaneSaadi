import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [events, setEvents] = useState([]);

  async function login() {
    const res = await fetch("http://localhost:3000/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      setAdmin(data);
    } else {
      alert("Login failed");
    }
  }

  async function loadChildren() {
    const res = await fetch("http://localhost:3000/children");
    const data = await res.json();
    setChildren(data);
  }

  async function loadEvents(childId) {
    if (!childId) {
      setEvents([]);
      return;
    }

    const res = await fetch(
      "http://localhost:3000/events?childId=" + childId
    );
    const data = await res.json();
    setEvents(data);
  }

  async function punishChild(childId) {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, type: "PUNISH" })
    });

    loadChildren();
    loadEvents(childId);
  }

  useEffect(() => {
    if (admin) loadChildren();
  }, [admin]);

  useEffect(() => {
    if (admin) loadEvents(selectedChildId);
  }, [selectedChildId, admin]);

  if (!admin) {
    return (
      <div className="login-container">
        <h1>Admin Login</h1>

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

        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <div className="dashboard-content">
        <div className="children-panel">
          <h2>Children</h2>

          {children.length === 0 && <p>No children yet.</p>}

          {children.map((c) => (
            <div
              key={c._id}
              className={`child-card ${
                selectedChildId === c._id ? "selected" : ""
              }`}
              onClick={() => setSelectedChildId(c._id)}
            >
              <strong>{c.name}</strong>
              <p>Status: {c.status}</p>
              <p>Restricted: {String(c.isRestricted)}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  punishChild(c._id);
                }}
              >
                Punish
              </button>
            </div>
          ))}
        </div>

        <div className="events-panel">
          <h2>Events</h2>

          {!selectedChildId && <p>Select a child to see events.</p>}

          {selectedChildId && events.length === 0 && (
            <p>No events for this child.</p>
          )}

          {events.map((ev) => (
            <div key={ev._id} className="event-item">
              <strong>{ev.type}</strong>
              <small>{new Date(ev.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}