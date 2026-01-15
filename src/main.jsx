import React from "react";
import ReactDOM from "react-dom/client";
import Game from "./Game.jsx";
import { MultiplayerProvider } from "./useMultiplayer.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MultiplayerProvider>
      <Game />
    </MultiplayerProvider>
  </React.StrictMode>,
);
