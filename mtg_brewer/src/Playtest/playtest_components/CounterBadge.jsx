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

  const groupRef = useRef(null);

  useEffect(() => {
    setInputValue(counter.value);
  }, [counter.value]);

  const x = CARD_WIDTH - 50;
  const y = 10 + index * 28;

  const increment = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: counter.value + 1,
    });
  };

  const decrement = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: Math.max(0, counter.value - 1),
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

  // Get screen position for portal
  const getScreenPos = () => {
    const stage = groupRef.current?.getStage();
    const abs = groupRef.current?.getAbsolutePosition();
    const containerRect = stage.container().getBoundingClientRect();

    return {
      x: containerRect.left + abs.x,
      y: containerRect.top + abs.y,
    };
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        onClick={(e) => {
          e.cancelBubble = true;
          setEditing(true);
        }}
      >
        <Rect
          width={40}
          height={24}
          cornerRadius={6}
          fill="#222"
          stroke="#888"
          strokeWidth={1}
        />

        <Text
          text={String(counter.value)}
          x={12}
          y={4}
          fontSize={12}
          fill="white"
        />

        {/* + button */}
        <Text
          text="+"
          x={30}
          y={2}
          fontSize={12}
          fill="green"
          onClick={(e) => {
            e.cancelBubble = true;
            increment();
          }}
        />

        {/* - button */}
        <Text
          text="-"
          x={2}
          y={2}
          fontSize={12}
          fill="red"
          onClick={(e) => {
            e.cancelBubble = true;
            decrement();
          }}
        />

        {/* Type label */}
        <Text
          text={counter.type}
          x={0}
          y={26}
          fontSize={10}
          fill="#ccc"
          onClick={(e) => {
            e.cancelBubble = true;
            setDropdownOpen(!dropdownOpen);
          }}
        />
      </Group>

      {/* INPUT OVERLAY */}
      {editing &&
        createPortal(
          <input
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitInput}
            style={{
              position: "absolute",
              top: getScreenPos().y + "px",
              left: getScreenPos().x + "px",
              width: "40px",
              zIndex: 1000,
            }}
          />,
          document.body,
        )}

      {/* DROPDOWN */}
      {dropdownOpen &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: getScreenPos().y + 30 + "px",
              left: getScreenPos().x + "px",
              background: "#222",
              border: "1px solid #555",
              zIndex: 1000,
            }}
          >
            {COUNTER_TYPES.map((type) => (
              <div
                key={type}
                style={{
                  padding: "4px",
                  cursor: "pointer",
                  color: "white",
                }}
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
