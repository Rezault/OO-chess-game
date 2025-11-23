import { powerUps } from "../game/powerUps";

function PowerUp({ gameState, myName, onUsePowerUp, choosePowerUpSquare }) {
  const myColor =
    gameState && gameState.whitePlayer === myName
      ? "w"
      : gameState && gameState.blackPlayer === myName
      ? "b"
      : "w"; // default

  const powerUp = gameState
    ? myColor === "w"
      ? gameState.whitePlayerPowerUp
      : gameState.blackPlayerPowerUp
    : "None";
  const powerUpArr = powerUp in powerUps ? powerUps[powerUp] : [null, ""];

  return (
    <div className="powerup-pane">
      <h2>Current PowerUp:</h2>
      <div className="powerup-card">
        <img src={powerUpArr[0]} className="powerup-image" />
        <p className="powerup-name">{powerUp}</p>
        <p className="powerup-description">{powerUpArr[1]}</p>
        <button
          className="powerup-button"
          onClick={() => {
            if (gameState.turn !== (myColor === "w" ? "WHITE" : "BLACK"))
              return;

            if (powerUpArr[2] === false) {
              onUsePowerUp();
            } else {
              // let the player choose a square
              choosePowerUpSquare(true);
            }
          }}
        >
          Use PowerUp
        </button>
      </div>
    </div>
  );
}

export default PowerUp;
