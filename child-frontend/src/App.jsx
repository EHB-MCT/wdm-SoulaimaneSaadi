import { useEffect, useState } from "react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [child, setChild] = useState(null);

  // public children list
  const [publicChildren, setPublicChildren] = useState([]);

  // Navigation security check
  function checkAdminAuthAndRedirect() {
    // Check if admin is logged in (token in localStorage or session)
    const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
    
    if (adminToken) {
      window.location.href = 'http://localhost:5173'; // Admin app URL
    } else {
      window.location.href = 'http://localhost:5173/login'; // Admin login page
    }
  }

  // Clean up child token on logout
  function logout() {
    localStorage.removeItem('childToken');
    sessionStorage.removeItem('childToken');
    setChild(null);
  }

  async function login() {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      const data = await res.json();
      setChild(data);
      // Store child token for secure navigation
      localStorage.setItem('childToken', data.token || 'child-logged-in');
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

  async function refreshChild() {
    const res = await fetch(
      "http://localhost:3000/children/" + child._id
    );
    const data = await res.json();
    setChild(data);
  }

  useEffect(() => {
    if (child) loadPublicChildren();
  }, [child]);

if (!child) {
    return (
      <div className="login-container">
        <h1>Child Login</h1>

        <div className="form-group">
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button onClick={login}>Login</button>
          <button onClick={register}>Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <div className="nav-header">
        <h1 style={{ margin: 0, fontSize: '18px' }}>Child Dashboard</h1>
        <button 
          className="nav-button"
          onClick={checkAdminAuthAndRedirect}
          title="Go to Admin Dashboard"
        >
          Admin
        </button>
      </div>
      
      <div className="child-dashboard">
        <div className="welcome-section">
          <h1>Welcome {child.name}</h1>
        </div>

        <div className="info-card">
          <div className="user-info">
            <p><strong>Your item:</strong> {child.currentItem ? child.currentItem : "none"}</p>
          </div>

          <div className="button-group">
            <button
              disabled={child.isRestricted || !!child.currentItem}
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
                  await refreshChild();
                  await loadPublicChildren();
                  alert("You took the ball");
                } else {
                  const err = await res.json();
                  alert(err.message || "Error");
                }
              }}
            >
              Take the ball
            </button>

            <button
              disabled={!child.currentItem}
              onClick={async () => {
                const res = await fetch("http://localhost:3000/loan/return", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    childId: child._id
                  })
                });

                if (res.ok) {
                  await refreshChild();
                  await loadPublicChildren();
                  alert("Returned");
                } else {
                  const err = await res.json();
                  alert(err.message || "Error");
                }
              }}
            >
              Return item
            </button>
          </div>

          {child.isRestricted && (
            <div className="restricted-message">
              You need to be more kind buddy
            </div>
          )}

          {child.restrictedUntil && (
            <div className="status-section">
              <p><strong>Restricted until:</strong> {new Date(child.restrictedUntil).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div className="info-card children-list">
          <h2>Other kids</h2>

          {publicChildren.map((publicChild) => (
            <div key={publicChild._id} className="child-item">
              <strong>{publicChild.name}</strong> —{" "}
              <span className="text-secondary">
                {publicChild.currentItem ? publicChild.currentItem : "nothing"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



}