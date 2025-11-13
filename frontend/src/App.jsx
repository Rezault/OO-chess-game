import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./components/HomePage";
import Lobby from "./components/Lobby";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<Lobby />} />
      </Routes>
    </div>
  );
}

export default App;
