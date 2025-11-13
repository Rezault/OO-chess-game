import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const connect = () => {
    console.log(name);
    navigate(`/lobby?name=${encodeURIComponent(name)}`);
  };

  return (
    <div>
      <h1>OO Chess</h1>
      <h3>Input your name:</h3>
      <input onChange={(e) => setName(e.target.value)}></input>
      <button onClick={connect}>Connect</button>
    </div>
  );
}

export default HomePage;
