import { useContext, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { PlaytestContext } from "../Playtest";
import { HAND_HEIGHT, HUD_HEIGHT } from "../playtest_utils/constants";
import BattlefieldCard from "./BattlefieldCard";

function Battlefield() {
  const { state, actions } = useContext(PlaytestContext);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight - HAND_HEIGHT - HUD_HEIGHT,
  });

  const [selection, setSelection] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
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

  const handleMouseDown = (e) => {
    if (e.target === stageRef.current) {
      const pos = e.target.getStage().getPointerPosition();
      setSelection({
        visible: true,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
      });
      actions.clearSelection();
      actions.closeContextMenu();
    }
  };

  const handleMouseMove = (e) => {
    if (!selection.visible) return;
    const pos = e.target.getStage().getPointerPosition();
    setSelection((prev) => ({ ...prev, x2: pos.x, y2: pos.y }));
  };

  const handleMouseUp = () => {
    if (!selection.visible) return;
    const x = Math.min(selection.x1, selection.x2);
    const y = Math.min(selection.y1, selection.y2);
    const width = Math.abs(selection.x2 - selection.x1);
    const height = Math.abs(selection.y2 - selection.y1);
    const selectedIds = state.battlefield
      .filter(
        (card) =>
          card.x >= x &&
          card.x <= x + width &&
          card.y >= y &&
          card.y <= y + height,
      )
      .map((c) => c.instanceId);
    actions.selectCards(selectedIds);
    setSelection({ ...selection, visible: false });
  };

  return (
    <Stage
      ref={stageRef}
      width={windowSize.width}
      height={windowSize.height}
      pixelRatio={window.devicePixelRatio}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        if (e.target === stageRef.current) actions.closeContextMenu();
      }}
    >
      <Layer>
        {state.battlefield.map((card) => (
          <BattlefieldCard key={card.instanceId} card={card} />
        ))}

        {selection.visible && (
          <Rect
            fill="rgba(0, 191, 255, 0.2)"
            stroke="#00bfff"
            strokeWidth={1}
            x={Math.min(selection.x1, selection.x2)}
            y={Math.min(selection.y1, selection.y2)}
            width={Math.abs(selection.x2 - selection.x1)}
            height={Math.abs(selection.y2 - selection.y1)}
          />
        )}
      </Layer>
    </Stage>
  );
}

export default Battlefield;
