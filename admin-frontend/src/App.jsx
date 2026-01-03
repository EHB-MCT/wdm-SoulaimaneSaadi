import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(null);

  // label picker
  const [label, setLabel] = useState("mama");

  // filter present only
  const [showPresentOnly, setShowPresentOnly] = useState(false);

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

  // generic event creator
  async function createEvent(childId, type) {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, type, label })
    });

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

  // filtered list
  const filteredChildren = showPresentOnly
    ? children.filter((c) => c.status === "present")
    : children;

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

          {/* ✅ checkbox filter */}
          <label style={{ display: "block", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={showPresentOnly}
              onChange={(e) => setShowPresentOnly(e.target.checked)}
            />{" "}
            Show present today only
          </label>

          {filteredChildren.length === 0 && <p>No children yet.</p>}

          {filteredChildren.map((c) => (
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

              {/* label + check in/out */}
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{ marginTop: 8 }}
              >
                <option value="mama">mama</option>
                <option value="papa">papa</option>
                <option value="broer">broer</option>
                <option value="zus">zus</option>
                <option value="vriend">vriend</option>
                <option value="familie">familie</option>
              </select>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createEvent(c._id, "CHECK_IN");
                  }}
                >
                  Check-in
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createEvent(c._id, "CHECK_OUT");
                  }}
                >
                  Check-out
                </button>
              </div>

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
              <strong>
                {ev.type} {ev.label ? `(${ev.label})` : ""}
              </strong>
              <br />
              <small>{new Date(ev.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
