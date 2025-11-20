import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ fontFamily: "Arial", textAlign: "center", marginTop: "50px" }}>
      <h1>TransformeSiteApp fonctionne 🎉</h1>
      <p>Projet de test simple.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);