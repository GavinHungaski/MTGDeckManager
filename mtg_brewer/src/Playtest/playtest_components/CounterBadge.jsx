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
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [screenPos, setScreenPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const groupRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => setInputValue(counter.value), [counter.value]);

  useEffect(() => {
    if (!editing) return;
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        commitInput();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, inputValue]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

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
    if (!stage || !abs) return { x: 0, y: 0 };
    const rect = stage.container().getBoundingClientRect();
    return { x: rect.left + abs.x, y: rect.top + abs.y };
  };

  const openEditor = () => {
    if (dragging) return;
    requestAnimationFrame(() => {
      setScreenPos(getScreenPos());
      setEditing(true);
    });
  };

  const openDropdown = () => {
    if (dragging) return;
    requestAnimationFrame(() => {
      setScreenPos(getScreenPos());
      setDropdownOpen(true);
    });
  };

  const increment = (e) => {
    if (dragging) return;
    e.cancelBubble = true;
    e.evt?.stopPropagation();
    actions.updateCounter(instanceId, counter.id, { value: counter.value + 1 });
  };

  const decrement = (e) => {
    if (dragging) return;
    e.cancelBubble = true;
    e.evt?.stopPropagation();
    actions.updateCounter(instanceId, counter.id, {
      value: Math.max(0, counter.value - 1),
    });
  };

  const handleDragEnd = (e) => {
    e.cancelBubble = true;
    e.evt?.stopPropagation();

    const abs = e.target.getAbsolutePosition();
    const local = getLocalPos(abs.x, abs.y);
    actions.updateCounter(instanceId, counter.id, { x: local.x, y: local.y });

    setTimeout(() => setDragging(false), 100);
  };

  const handleDragMove = () => {
    if (!dragging) setDragging(true);
  };

  const handleInputChange = (e) =>
    setInputValue(e.target.value.replace(/[^0-9]/g, ""));

  const commitInput = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: Number(inputValue) || 0,
    });
    setEditing(false);
  };

  const handleRemove = (e) => {
    e.evt.preventDefault();
    e.cancelBubble = true;
    e.evt?.stopPropagation();

    if (window.confirm(`Remove ${counter.type} counter?`)) {
      actions.removeCounter(instanceId, counter.id);
    }
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={x}
        y={y}
        draggable
        dragDistance={5}
        onDragStart={(e) => {
          e.cancelBubble = true;
          e.evt?.stopPropagation();
          setDragging(true);
        }}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setHoveredBtn(null);
        }}
        onMouseDown={(e) => {
          e.cancelBubble = true;
          e.evt?.stopPropagation();
        }}
        onContextMenu={handleRemove}
        cursor={dragging ? "grabbing" : "grab"}
      >
        {/* BACKGROUND */}
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
          fill={hoveredBtn === "value" ? "#00ffcc" : "white"}
          onMouseEnter={() => setHoveredBtn("value")}
          onMouseLeave={() => setHoveredBtn(null)}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            e.evt?.stopPropagation();
          }}
          onClick={(e) => {
            if (dragging) return;
            e.cancelBubble = true;
            e.evt?.stopPropagation();
            openEditor();
          }}
        />

        {/* LABEL / TYPE */}
        <Text
          text={counter.type}
          x={4}
          y={14}
          fontSize={9}
          fill={hoveredBtn === "label" ? "#00bfff" : "#ccc"}
          onMouseEnter={() => setHoveredBtn("label")}
          onMouseLeave={() => setHoveredBtn(null)}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            e.evt?.stopPropagation();
          }}
          onClick={(e) => {
            if (dragging) return;
            e.cancelBubble = true;
            e.evt?.stopPropagation();
            openDropdown();
          }}
        />

        {/* + BUTTON */}
        <Text
          text="+"
          x={38}
          y={2}
          fontSize={12}
          fill={hoveredBtn === "+" ? "#00ff00" : "green"}
          onMouseEnter={() => setHoveredBtn("+")}
          onMouseLeave={() => setHoveredBtn(null)}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            e.evt?.stopPropagation();
          }}
          onClick={increment}
        />

        {/* - BUTTON */}
        <Text
          text="-"
          x={4}
          y={2}
          fontSize={12}
          fill={hoveredBtn === "-" ? "#ff4444" : "red"}
          onMouseEnter={() => setHoveredBtn("-")}
          onMouseLeave={() => setHoveredBtn(null)}
          onMouseDown={(e) => {
            e.cancelBubble = true;
            e.evt?.stopPropagation();
          }}
          onClick={decrement}
        />
      </Group>

      {/* INPUT */}
      {editing &&
        createPortal(
          <input
            ref={inputRef}
            autoFocus
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput();
              if (e.key === "Escape") {
                setInputValue(counter.value);
                setEditing(false);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: screenPos.y,
              left: screenPos.x,
              width: "50px",
              height: "20px",
              fontSize: "12px",
              borderRadius: "4px",
              border: "1px solid #555",
              background: "#222",
              color: "white",
              textAlign: "center",
              zIndex: 10000,
            }}
          />,
          document.body,
        )}

      {/* DROPDOWN */}
      {dropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: screenPos.y + 28,
              left: screenPos.x,
              background: "#222",
              border: "1px solid #555",
              borderRadius: "4px",
              zIndex: 10000,
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {COUNTER_TYPES.map((type) => (
              <div
                key={type}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  color: "white",
                  fontSize: "12px",
                  transition: "background 0.15s",
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#333")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
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
