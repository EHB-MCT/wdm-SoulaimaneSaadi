import { useEffect, useState } from "react";

export default function App() {
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [selectedChild, setSelectedChild] = useState(null);

  async function fetchChildren() {
    const response = await fetch("http://localhost:3000/children");
    const data = await response.json();
    setChildrenList(data);
  }

  async function fetchChildById(childId) {
    if (!childId) return;
    const response = await fetch(
      `http://localhost:3000/children/${childId}`
    );
    const data = await response.json();
    setSelectedChild(data);
  }

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    fetchChildById(selectedChildId);
  }, [selectedChildId]);

  const isRestricted = selectedChild?.isRestricted;

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Child Interface</h1>

      <div style={{ marginBottom: 20 }}>
        <label>Select your name: </label>
        <select
          value={selectedChildId}
          onChange={(e) => setSelectedChildId(e.target.value)}
        >
          <option value="">-- Choose --</option>
          {childrenList.map((child) => (
            <option key={child._id} value={child._id}>
              {child.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedChild && <p>Please select your name to continue.</p>}

      {selectedChild && (
        <>
          <p>Hello {selectedChild.name}</p>

          <h2>Available objects</h2>

          <button disabled={isRestricted}>
            Take the ball
          </button>

          {isRestricted && (
            <p style={{ marginTop: 10 }}>
              This object is not available today.
            </p>
          )}

          <div style={{ marginTop: 30 }}>
            <small>(The child does not know why.)</small>
          </div>
        </>
      )}
    </div>
  );
}
