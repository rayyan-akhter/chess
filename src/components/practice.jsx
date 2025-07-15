import React, { useState } from "react";
import "./style.css";

const Practice = () => {
  const [moved, setMoved] = useState(false);

  return (
    <div className="Screen">
      <div
        style={{
          left: moved ? "calc(100% - 200px)" : 0,
          transition: "all 0.3s ease",
        }}
      ></div>
      <div className="slide-container" id="box">
        <button onClick={() => setMoved(!moved)}>SLIDE</button>
      </div>
    </div>
  );
};

export default Practice;
