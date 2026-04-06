import { Group, Rect, Text } from "react-konva";
import { useContext, useState, useEffect, useRef } from "react";
import { PlaytestContext } from "../Playtest";
import { CARD_WIDTH } from "../playtest_utils/constants";
import { createPortal } from "react-dom";

const COUNTER_TYPES = [
  "+1/+1",
  "-1/-1",
  "Loyalty",
  "Charge",
  "Energy",
  "Custom",
];

function CounterBadge({ counter, instanceId, index }) {
  const { actions } = useContext(PlaytestContext);

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(counter.value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });

  const groupRef = useRef(null);

  useEffect(() => {
    setInputValue(counter.value);
  }, [counter.value]);

  const defaultX = CARD_WIDTH - 55;
  const defaultY = 10 + index * 32;

  const x = counter.x ?? defaultX;
  const y = counter.y ?? defaultY;

  const getLocalPos = (absX, absY) => {
    const node = groupRef.current;
    const parent = node.getParent();
    const transform = parent.getAbsoluteTransform().copy().invert();
    return transform.point({ x: absX, y: absY });
  };

  const getScreenPos = () => {
    const stage = groupRef.current?.getStage();
    const abs = groupRef.current?.getAbsolutePosition();
    const rect = stage.container().getBoundingClientRect();

    return {
      x: rect.left + abs.x,
      y: rect.top + abs.y,
    };
  };

  const openEditor = () => {
    setScreenPos(getScreenPos());
    setEditing(true);
  };

  const openDropdown = () => {
    setScreenPos(getScreenPos());
    setDropdownOpen(true);
  };

  const increment = (e) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    actions.updateCounter(instanceId, counter.id, {
      value: counter.value + 1,
    });
  };

  const decrement = (e) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    actions.updateCounter(instanceId, counter.id, {
      value: Math.max(0, counter.value - 1),
    });
  };

  const handleDragEnd = (e) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();

    const abs = e.target.getAbsolutePosition();
    const local = getLocalPos(abs.x, abs.y);

    actions.updateCounter(instanceId, counter.id, {
      x: local.x,
      y: local.y,
    });
  };

  const handleInputChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(val);
  };

  const commitInput = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: Number(inputValue) || 0,
    });
    setEditing(false);
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        draggable
        dragDistance={3}
        onDragStart={(e) => {
          e.cancelBubble = true;
          e.evt.stopPropagation();
        }}
        onDragMove={(e) => {
          e.cancelBubble = true;
          e.evt.stopPropagation();
        }}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseDown={(e) => {
          e.cancelBubble = true;
          e.evt.stopPropagation();
        }}
        onClick={(e) => {
          e.cancelBubble = true;
          e.evt.stopPropagation();
        }}
        onContextMenu={(e) => {
          e.evt.preventDefault();
          e.cancelBubble = true;
          actions.removeCounter(instanceId, counter.id);
        }}
      >
        <Rect
          width={50}
          height={28}
          cornerRadius={6}
          fill={hovered ? "#333" : "#222"}
          stroke={hovered ? "#00bfff" : "#888"}
          strokeWidth={1}
        />

        {/* VALUE */}
        <Text
          text={String(counter.value)}
          x={18}
          y={2}
          fontSize={12}
          fill="white"
          onMouseDown={(e) => e.evt.stopPropagation()}
          onClick={(e) => {
            e.cancelBubble = true;
            e.evt.stopPropagation();
            openEditor();
          }}
        />

        {/* LABEL */}
        <Text
          text={counter.type}
          x={4}
          y={14}
          fontSize={9}
          fill="#ccc"
          onMouseDown={(e) => e.evt.stopPropagation()}
          onClick={(e) => {
            e.cancelBubble = true;
            e.evt.stopPropagation();
            openDropdown();
          }}
        />

        {/* + */}
        <Text
          text="+"
          x={38}
          y={2}
          fontSize={12}
          fill="green"
          onMouseDown={(e) => e.evt.stopPropagation()}
          onClick={increment}
        />

        {/* - */}
        <Text
          text="-"
          x={4}
          y={2}
          fontSize={12}
          fill="red"
          onMouseDown={(e) => e.evt.stopPropagation()}
          onClick={decrement}
        />
      </Group>

      {/* INPUT */}
      {editing &&
        createPortal(
          <input
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: screenPos.y,
              left: screenPos.x,
              width: "50px",
              zIndex: 9999,
            }}
          />,
          document.body,
        )}

      {/* DROPDOWN */}
      {dropdownOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: screenPos.y + 30,
              left: screenPos.x,
              background: "#222",
              border: "1px solid #555",
              zIndex: 9999,
            }}
          >
            {COUNTER_TYPES.map((type) => (
              <div
                key={type}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "white",
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  actions.updateCounter(instanceId, counter.id, { type });
                  setDropdownOpen(false);
                }}
              >
                {type}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export default CounterBadge;
