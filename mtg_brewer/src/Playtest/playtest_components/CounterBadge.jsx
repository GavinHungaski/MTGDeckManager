import React, { useContext, useState, useEffect, useRef } from "react";
import { Group, Rect, Text, Circle } from "react-konva";
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

  const BADGE_WIDTH = 70;
  const BADGE_HEIGHT = 30;

  useEffect(() => setInputValue(counter.value), [counter.value]);

  useEffect(() => {
    if (!editing && !dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (editing && inputRef.current && !inputRef.current.contains(e.target))
        commitInput();
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      )
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editing, dropdownOpen, inputValue]);

  const x = counter.x ?? CARD_WIDTH - (BADGE_WIDTH + 10);
  const y = counter.y ?? 15 + index * 36;

  const handleInputChange = (e) =>
    setInputValue(e.target.value.replace(/[^0-9]/g, ""));

  const commitInput = () => {
    actions.updateCounter(instanceId, counter.id, {
      value: Math.max(0, Number(inputValue) || 0),
    });
    setEditing(false);
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
      onDragEnd={(e) => {
        e.cancelBubble = true;
        const node = e.target;
        const local = node
          .getParent()
          .getAbsoluteTransform()
          .copy()
          .invert()
          .point(node.getAbsolutePosition());
        actions.updateCounter(instanceId, counter.id, {
          x: local.x,
          y: local.y,
        });
        setTimeout(() => setDragging(false), 50);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setHoveredBtn(null);
      }}
    >
      {/* BACKGROUND */}
      <Rect
        width={BADGE_WIDTH}
        height={BADGE_HEIGHT}
        cornerRadius={8}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: 30 }}
        fillLinearGradientColorStops={[0, "#3a3a3a", 1, "#1a1a1a"]}
        stroke={hovered ? "#00d4ff" : "#555"}
        strokeWidth={hovered ? 2 : 1}
        shadowBlur={hovered ? 4 : 0}
        shadowColor="#00d4ff"
      />

      {/* CENTRAL TEXT AREA */}
      <Group x={18} width={34}>
        <Text
          text={String(counter.value)}
          width={34}
          y={4}
          align="center"
          fontSize={13}
          fontStyle="bold"
          fill={hoveredBtn === "value" ? "#00d4ff" : "white"}
          onClick={(e) => {
            e.cancelBubble = true;
            if (!dragging) setEditing(true);
          }}
          onMouseEnter={() => setHoveredBtn("value")}
          onMouseLeave={() => setHoveredBtn(null)}
        />
        <Text
          text={counter.type.toUpperCase()}
          width={34}
          y={18}
          align="center"
          fontSize={7}
          fontStyle="bold"
          fill={hoveredBtn === "label" ? "#00d4ff" : "#aaa"}
          onClick={(e) => {
            e.cancelBubble = true;
            if (!dragging) setDropdownOpen(true);
          }}
          onMouseEnter={() => setHoveredBtn("label")}
          onMouseLeave={() => setHoveredBtn(null)}
        />
      </Group>

      {/* MINUS (Left) */}
      <Group
        x={11}
        y={15}
        onClick={(e) => {
          e.cancelBubble = true;
          actions.updateCounter(instanceId, counter.id, {
            value: Math.max(0, counter.value - 1),
          });
        }}
        onMouseEnter={() => setHoveredBtn("-")}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <Circle radius={9} fill={hoveredBtn === "-" ? "#e74c3c" : "#333"} />
        <Text
          text="-"
          fontSize={14}
          fill="white"
          x={-3}
          y={-7}
          listening={false}
          fontStyle="bold"
        />
      </Group>

      {/* PLUS (Right) */}
      <Group
        x={59}
        y={15}
        onClick={(e) => {
          e.cancelBubble = true;
          actions.updateCounter(instanceId, counter.id, {
            value: counter.value + 1,
          });
        }}
        onMouseEnter={() => setHoveredBtn("+")}
        onMouseLeave={() => setHoveredBtn(null)}
      >
        <Circle radius={9} fill={hoveredBtn === "+" ? "#2ecc71" : "#333"} />
        <Text
          text="+"
          fontSize={12}
          fill="white"
          x={-4}
          y={-6}
          listening={false}
          fontStyle="bold"
        />
      </Group>

      {/* HTML OVERLAYS */}
      <Html divProps={{ style: { pointerEvents: "none" } }}>
        <div
          style={{
            position: "relative",
            pointerEvents: "auto",
            fontFamily: "sans-serif",
          }}
        >
          <input
            ref={inputRef}
            value={inputValue}
            autoFocus
            onChange={handleInputChange}
            onBlur={commitInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitInput();
              if (e.key === "Escape") setEditing(false);
            }}
            style={{
              display: editing ? "block" : "none",
              position: "absolute",
              top: "2px",
              left: "19px", // Centered: (70 - 32) / 2
              width: "32px",
              height: "18px",
              fontSize: "12px",
              fontWeight: "bold",
              background: "#000",
              color: "#00d4ff",
              border: "1px solid #00d4ff",
              borderRadius: "4px",
              textAlign: "center",
              outline: "none",
              zIndex: 10,
            }}
          />

          <div
            ref={dropdownRef}
            style={{
              display: dropdownOpen ? "block" : "none",
              position: "absolute",
              top: "32px",
              left: "-5px",
              background: "rgba(20, 20, 20, 0.95)",
              backdropFilter: "blur(4px)",
              border: "1px solid #444",
              borderRadius: "6px",
              minWidth: "80px",
              zIndex: 100,
              boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
              overflow: "hidden",
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
                onMouseEnter={(e) => {
                  e.target.style.background = "#00d4ff";
                  e.target.style.color = "black";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = "white";
                }}
                style={{
                  padding: "6px 10px",
                  color: "white",
                  fontSize: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                  textTransform: "uppercase",
                  fontWeight: "bold",
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
