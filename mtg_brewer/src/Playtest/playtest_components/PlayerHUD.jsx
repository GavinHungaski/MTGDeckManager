import react, { useEffect, useState } from "react";
import { useContext } from "react";
import { PlaytestContext } from "../Playtest";
import { HUD_HEIGHT } from "../playtest_utils/constants";

function PlayerHUD() {
  return (
    <div
      style={{
        width: "100vw",
        height: `${HUD_HEIGHT}px`,
        background: "orange",
      }}
    ></div>
  );
}

export default PlayerHUD;
