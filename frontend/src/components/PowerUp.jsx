function PowerUp({ gameState, myName }) {
  const myColor =
    gameState && gameState.whitePlayer === myName
      ? "w"
      : gameState && gameState.blackPlayer === myName
      ? "b"
      : "w"; // default

  return (
    <div className="powerup-pane">
      <h2>Current PowerUp:</h2>
      <div className="powerup-card">
        <img src="" className="powerup-image" />
        <p className="powerup-name">
          {gameState
            ? myColor === "w"
              ? gameState.whitePlayerPowerUp
              : gameState.blackPlayerPowerUp
            : "None"}
        </p>
        <p className="powerup-description"></p>
        <button className="powerup-button">Use PowerUp</button>
      </div>
    </div>
  );
}

export default PowerUp;
