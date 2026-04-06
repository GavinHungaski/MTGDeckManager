import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Text } from "react-konva";
import { Html } from "react-konva-utils";
import { PlaytestContext } from "../Playtest";
import { CARD_WIDTH } from "../playtest_utils/constants";

const COUNTER_TYPES = ["+1/+1", "-1/-1", "Loyalty", "Charge", "Generic"];

function CounterBadge({ counter, instanceId, index }) {
  const { actions } = useContext(PlaytestContext);

  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(counter.value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => setInputValue(counter.value), [counter.value]);

  // Handle clicking outside
  useEffect(() => {
    if (!editing && !dropdownOpen) return;

    const handleClickOutside = (e) => {
      if (editing && inputRef.current && !inputRef.current.contains(e.target)) {
        commitInput();
      }
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, dropdownOpen, inputValue]);

  const defaultX = CARD_WIDTH - 55;
  const defaultY = 10 + index * 32;
  const x = counter.x ?? defaultX;
  const y = counter.y ?? defaultY;

  const handleInputChange = (e) =>
    setInputValue(e.target.value.replace(/[^0-9]/g, ""));

  const commitInput = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: Number(inputValue) || 0,
    });
    setEditing(false);
  };

  const handleDragEnd = (e) => {
    e.cancelBubble = true; // Stop Konva bubble
    const node = e.target;
    const parent = node.getParent();
    const transform = parent.getAbsoluteTransform().copy().invert();
    const abs = node.getAbsolutePosition();
    const local = transform.point(abs);

    actions.updateCounter(instanceId, counter.id, { x: local.x, y: local.y });
    setTimeout(() => setDragging(false), 50);
  };

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragStart={(e) => {
        e.cancelBubble = true;
        setDragging(true);
      }}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredBtn(null);
      }}
      onContextMenu={(e) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        if (window.confirm(`Remove ${counter.type} counter?`)) {
          actions.removeCounter(instanceId, counter.id);
        }
      }}
    >
      {/* 1. STABLE KONVA NODES (These never change structure) */}
      <Rect
        width={50}
        height={28}
        cornerRadius={6}
        fill={hovered ? "#333" : "#222"}
        stroke={hovered ? "#00bfff" : "#888"}
        strokeWidth={1}
      />

      <Text
        text={String(counter.value)}
        x={18}
        y={2}
        fontSize={12}
        fill={hoveredBtn === "value" ? "#00ffcc" : "white"}
        onMouseEnter={() => setHoveredBtn("value")}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={(e) => {
          e.cancelBubble = true; // CRITICAL: Stop stage from de-selecting
          if (!dragging) setEditing(true);
        }}
      />

      <Text
        text={counter.type}
        x={4}
        y={14}
        fontSize={9}
        fill={hoveredBtn === "label" ? "#00bfff" : "#ccc"}
        onMouseEnter={() => setHoveredBtn("label")}
        onMouseLeave={() => setHoveredBtn(null)}
        onClick={(e) => {
          e.cancelBubble = true;
          if (!dragging) setDropdownOpen(true);
        }}
      />

      <Text
        text="+"
        x={38}
        y={2}
        fontSize={12}
        fill={hoveredBtn === "+" ? "#00ff00" : "green"}
        onClick={(e) => {
          e.cancelBubble = true;
          actions.updateCounter(instanceId, counter.id, {
            value: counter.value + 1,
          });
        }}
      />

      <Text
        text="-"
        x={4}
        y={2}
        fontSize={12}
        fill={hoveredBtn === "-" ? "#ff4444" : "red"}
        onClick={(e) => {
          e.cancelBubble = true;
          actions.updateCounter(instanceId, counter.id, {
            value: Math.max(0, counter.value - 1),
          });
        }}
      />

      {/* 2. STABLE HTML OVERLAY (Always in tree, CSS visibility toggled) */}
      <Html divProps={{ style: { pointerEvents: "none" } }}>
        <div style={{ position: "relative", pointerEvents: "auto" }}>
          {/* INPUT EDITOR */}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput();
              if (e.key === "Escape") setEditing(false);
            }}
            style={{
              display: editing ? "block" : "none",
              position: "absolute",
              top: 0,
              left: 0,
              width: "50px",
              height: "22px",
              fontSize: "12px",
              background: "#111",
              color: "white",
              border: "1px solid #00bfff",
              textAlign: "center",
              zIndex: 10,
            }}
          />

          {/* DROPDOWN MENU */}
          <div
            ref={dropdownRef}
            style={{
              display: dropdownOpen ? "block" : "none",
              position: "absolute",
              top: "28px",
              left: 0,
              background: "#222",
              border: "1px solid #555",
              borderRadius: "4px",
              minWidth: "75px",
              zIndex: 100,
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
            }}
          >
            {COUNTER_TYPES.map((type) => (
              <div
                key={type}
                onClick={(e) => {
                  e.stopPropagation();
                  actions.updateCounter(instanceId, counter.id, { type });
                  setDropdownOpen(false);
                }}
                onMouseEnter={(e) => (e.target.style.background = "#444")}
                onMouseLeave={(e) =>
                  (e.target.style.background = "transparent")
                }
                style={{
                  padding: "4px 8px",
                  color: "white",
                  fontSize: "11px",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                }}
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </Html>
    </Group>
  );
}

export default CounterBadge;
