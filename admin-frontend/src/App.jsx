import { useEffect, useState } from "react";

export default function App() {
  const [childrenList, setChildrenList] = useState([]);
  const [childName, setChildName] = useState("");

  async function fetchChildren() {
    const response = await fetch("http://localhost:3000/children");
    const data = await response.json();
    setChildrenList(data);
  }

  async function createChildProfile() {
    await fetch("http://localhost:3000/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: childName })
    });

    setChildName("");
    await fetchChildren();
  }

  async function punishChildById(childId) {
    await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, type: "PUNISH" })
    });

    await fetchChildren();
  }

  useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="Child name"
        />
        <button onClick={createChildProfile} style={{ marginLeft: 10 }}>
          Create child
        </button>
      </div>

      <h2>Children list</h2>

      {childrenList.map((child) => (
        <div
          key={child._id}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10
          }}
        >
          <div><b>{child.name}</b></div>
          <div>Restricted: {String(child.isRestricted)}</div>

          <button onClick={() => punishChildById(child._id)}>
            Punish
          </button>
        </div>
      ))}
    </div>
  );
}
