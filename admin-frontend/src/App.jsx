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

  // Filter states
  const [filterPresent, setFilterPresent] = useState(false);
  const [filterRestricted, setFilterRestricted] = useState(false);
  const [filterHasItem, setFilterHasItem] = useState(false);
  const [sortBy, setSortBy] = useState("name");

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

    await loadChildren();
    await loadEvents(childId);
  }

  // Punish start function
  async function punishStart(childId) {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: childId, type: "PUNISH_START", label })
    });

    await loadChildren();
    await loadEvents(childId);
  }

  // Punish end function
  async function punishEnd(childId) {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId: childId, type: "PUNISH_END", label })
    });

    await loadChildren();
    await loadEvents(childId);
  }

  useEffect(() => {
    if (admin) loadChildren();
  }, [admin]);

  useEffect(() => {
    if (admin) loadEvents(selectedChildId);
  }, [selectedChildId, admin]);

  /* Statistics Calculations */
  const punishmentEndEvents = events.filter((event) => event.type === "PUNISH_END");
  const totalPunishments = punishmentEndEvents.length;

  const totalPunishmentMinutes = punishmentEndEvents.reduce((sum, event) => {
    return sum + (event.durationMinutes || 0);
  }, 0);

  const loanStartEvents = events.filter((event) => event.type === "LOAN_START");
  const totalLoans = loanStartEvents.length;

  const borrowedItems = loanStartEvents.map((event) => event.label).filter(Boolean);

  const checkInEvents = events.filter((event) => event.type === "CHECK_IN");
  const checkOutEvents = events.filter((event) => event.type === "CHECK_OUT");

  function countEventsByLabel(eventList) {
    const labelCounts = {};
    for (const event of eventList) {
      const label = event.label || "unknown";
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    }
    return labelCounts;
  }

  const dropOffCounts = countEventsByLabel(checkInEvents);
  const pickUpCounts = countEventsByLabel(checkOutEvents);

  const filteredChildren = showPresentOnly
    ? children.filter((child) => child.status === "present")
    : children;

  const selectedChild = children.find(child => child._id === selectedChildId);

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

          {filteredChildren.map((child) => (
            <div
              key={child._id}
              className={`child-card ${
                selectedChildId === child._id ? "selected" : ""
              }`}
              onClick={() => setSelectedChildId(child._id)}
            >
              <strong>{child.name}</strong>
              <p>Status: {child.status}</p>
              <p>Restricted: {String(child.isRestricted)}</p>
              <p>Restricted until: {child.restrictedUntil ? new Date(child.restrictedUntil).toLocaleString() : "no"}</p>
              <p>Item: {child.currentItem ? child.currentItem : "none"}</p>

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
                    createEvent(child._id, "CHECK_IN");
                  }}
                >
                  Check-in
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createEvent(child._id, "CHECK_OUT");
                  }}
                >
                  Check-out
                </button>
              </div>

              {/* Punish buttons */}
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    punishStart(child._id);
                  }}
                >
                  Punish start
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    punishEnd(child._id);
                  }}
                >
                  Punish end
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="events-panel">
          <h2>Events</h2>

          {selectedChild && (
            <div>
              <div className="child-profile">
                <p><strong>Name:</strong> {selectedChild.name}</p>
                <p><strong>Email:</strong> {selectedChild.email}</p>
                <p><strong>Current item:</strong> {selectedChild.currentItem || "none"}</p>
                <p><strong>Restricted:</strong> {selectedChild.isRestricted ? "Yes" : "No"}</p>
              </div>

              <div className="child-stats">
                <h3>Stats</h3>
                <p><strong>Punishments:</strong> {totalPunishments}</p>
                <p><strong>Punish time total:</strong> {totalPunishmentMinutes} min</p>

                <p><strong>Loans:</strong> {totalLoans}</p>
                <p><strong>Loan items:</strong> {borrowedItems.join(", ") || "none"}</p>

                <p><strong>Dropped by:</strong></p>
                {Object.keys(dropOffCounts).map((label) => (
                  <p key={label}>{label}: {dropOffCounts[label]}</p>
                ))}

                <p><strong>Picked up by:</strong></p>
                {Object.keys(pickUpCounts).map((label) => (
                  <p key={label}>{label}: {pickUpCounts[label]}</p>
                ))}
              </div>
            </div>
          )}

          {!selectedChildId && <p>Select a child to see events.</p>}

          {selectedChildId && events.length === 0 && (
            <p>No events for this child.</p>
          )}

          {events.map((event) => (
            <div key={event._id} className="event-item">
              <strong>
                {event.type} {event.label ? `(${event.label})` : ""}
                {event.durationMinutes != null && ` - ${event.durationMinutes} min`}
              </strong>
              <br />
              <small>{new Date(event.timestamp).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}