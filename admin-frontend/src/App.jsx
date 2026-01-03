import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);

  // ✅ label selected in UI
  const [label, setLabel] = useState("mama");

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

    const res = await fetch("http://localhost:3000/events?childId=" + childId);
    const data = await res.json();
    setEvents(data);
  }

  // ✅ generic create event (check-in / check-out / punish / etc.)
  async function createEvent(childId, type) {
    const res = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        type,
        label
      })
    });

    if (!res.ok) {
      alert("Event failed");
      return;
    }

    loadChildren();
    loadEvents(childId);
  }

  async function punishChild(childId) {
    await createEvent(childId, "PUNISH");
  }

  useEffect(() => {
    if (admin) loadChildren();
  }, [admin]);

  useEffect(() => {
    if (admin) loadEvents(selectedChildId);
  }, [selectedChildId, admin]);

  // 🔐 LOGIN SCREEN
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

  // 📊 DASHBOARD
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* ✅ LABEL PICKER */}
      <div style={{ marginBottom: 16 }}>
        <strong>Label:</strong>{" "}
        <button
          onClick={() => setLabel("mama")}
          style={{
            marginLeft: 8,
            fontWeight: label === "mama" ? "bold" : "normal"
          }}
        >
          mama
        </button>
        <button
          onClick={() => setLabel("papa")}
          style={{
            marginLeft: 8,
            fontWeight: label === "papa" ? "bold" : "normal"
          }}
        >
          papa
        </button>

        <span style={{ marginLeft: 12 }}>Selected: {label}</span>
      </div>

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

              {/* ✅ CHECK IN / CHECK OUT */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createEvent(c._id, "CHECK_IN");
                  }}
                >
                  Check In
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createEvent(c._id, "CHECK_OUT");
                  }}
                >
                  Check Out
                </button>
              </div>

              {/* ✅ PUNISH */}
              <button
                style={{ marginTop: 10 }}
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
              <strong>{ev.type}</strong>{" "}
              {ev.label && <em>({ev.label})</em>}
              <br />
              <small>{new Date(ev.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
