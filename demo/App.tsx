import React, { useState, useEffect } from "react";
import "./App.css";


function App() {
  const [fps, setFps] = useState(120);

  useEffect(() => {
    // Create the new plot
    const plotElement = document.getElementById("plot") as HTMLDivElement;
    plotElement.innerHTML = "";

  }, []);

  return (
    <>
      <h1>HiGlass/Gosling tracks with new renderer</h1>

      <div className="card">
        <div className="card" id="plot"></div>
      </div>
    </>
  );
}

export default App;
