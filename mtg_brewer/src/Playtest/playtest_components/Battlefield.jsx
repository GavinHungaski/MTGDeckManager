import { useContext, useEffect, useRef, useState } from "react";
import { Stage, Layer } from "react-konva";
import { PlaytestContext } from "../Playtest";
import { HAND_HEIGHT, HUD_HEIGHT } from "../playtest_utils/constants";
import BattlefieldCard from "./BattlefieldCard";

function Battlefield() {
  const { state, actions } = useContext(PlaytestContext);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight - HAND_HEIGHT - HUD_HEIGHT,
  });

  const stageRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight - HAND_HEIGHT - HUD_HEIGHT,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStageClick = (e) => {
    if (e.target === stageRef.current) {
      actions.clearSelection();
      actions.closeContextMenu();
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={windowSize.width}
      height={windowSize.height}
      onClick={handleStageClick}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        if (e.target === stageRef.current) actions.closeContextMenu();
      }}
    >
      <Layer>
        {state.battlefield.map((card) => (
          <BattlefieldCard key={card.instanceId} card={card} />
        ))}
      </Layer>
    </Stage>
  );
}

export default Battlefield;
