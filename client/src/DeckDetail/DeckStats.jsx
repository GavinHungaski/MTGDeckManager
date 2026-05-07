import { useMemo } from "react";
import {
  MANA_COLORS,
  COLOR_ORDER,
  TYPE_CATEGORIES,
  getTypeCategory,
  parseManaCost,
  parseManaProduced,
  countCardRoles,
} from "./statsUtils";

/* ── Pie Chart ────────────────────────────────────────────── */
function PieChart({ data, title, onHighlightColor }) {
  const colors = Object.keys(data).filter((k) => data[k] > 0);
  const sortedColors = COLOR_ORDER.filter((c) => colors.includes(c));
  const values = sortedColors.map((c) => data[c]);
  const sum = values.reduce((a, b) => a + b, 0);

  if (sum === 0) {
    return (
      <div className="stat-pie-chart">
        <h4>{title}</h4>
        <div className="pie-empty">No data</div>
      </div>
    );
  }

  const radius = 44;
  const circumference = 2 * Math.PI * radius;

  const segments = sortedColors.map((color) => ({
    color,
    value: data[color],
    pct: data[color] / sum,
  }));

  const cumulativePcts = segments.reduce((acc, seg, idx) => {
    const prev = idx === 0 ? 0 : acc[idx - 1];
    acc.push(prev + seg.pct);
    return acc;
  }, []);

  return (
    <div className="stat-pie-chart">
      <h4>{title}</h4>
      <svg viewBox="0 0 280 120" className="pie-svg">
        {/* Legend */}
        {sortedColors.map((color, i) => {
          const y = 16 + i * 20;
          const pct = ((data[color] / sum) * 100).toFixed(0);
          return (
            <g
              key={`legend-${color}`}
              transform={`translate(10, ${y})`}
              className="pie-legend-item"
              onMouseEnter={() => onHighlightColor?.(color)}
              onMouseLeave={() => onHighlightColor?.(null)}
            >
              <rect
                x={0}
                y={-5}
                width={10}
                height={10}
                rx={2}
                fill={MANA_COLORS[color].fill}
                stroke={MANA_COLORS[color].stroke}
                strokeWidth={0.5}
              />
              <text x={16} y={2} className="pie-legend-text">
                {MANA_COLORS[color].label} {pct}%
              </text>
            </g>
          );
        })}
        {/* Donut */}
        <g transform="translate(210, 60)">
          {segments.map((seg, i) => {
            const dash = seg.pct * circumference;
            const priorPct = i === 0 ? 0 : cumulativePcts[i - 1];
            const rotation = priorPct * 360 - 90;
            return (
              <circle
                key={seg.color}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={MANA_COLORS[seg.color].fill}
                strokeWidth={radius * 0.75}
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform={`rotate(${rotation})`}
                style={{ transition: "stroke-dasharray 0.3s ease", cursor: "pointer" }}
                onMouseEnter={() => onHighlightColor?.(seg.color)}
                onMouseLeave={() => onHighlightColor?.(null)}
              >

                <title>
                  {MANA_COLORS[seg.color].label}: {Math.round(seg.value)} (
                  {(seg.pct * 100).toFixed(1)}%)
                </title>
              </circle>
            );
          })}
        </g>
        {/* Center text */}
        <text x="210" y="64" textAnchor="middle" className="pie-total">
          {Math.round(sum)}
        </text>
        <text x="210" y="78" textAnchor="middle" className="pie-label">
          total
        </text>
      </svg>
    </div>
  );
}

/* ── Mana Curve ───────────────────────────────────────────── */
function ManaCurve({ cards, onHighlightCmc }) {
  const buckets = useMemo(() => {
    const b = {};
    for (let i = 0; i <= 7; i++) b[i] = 0;
    b["8+"] = 0;

    for (const card of cards) {
      if (card.is_commander) continue;
      const typeLine = (card.type_line || "").toLowerCase();
      if (typeLine.includes("land")) continue;

      const cmc = card.cmc ?? 0;
      const qty = card.count || 1;
      if (cmc >= 8) {
        b["8+"] += qty;
      } else {
        b[cmc] += qty;
      }
    }
    return b;
  }, [cards]);

  const maxCount = Math.max(...Object.values(buckets), 1);
  const labels = [0, 1, 2, 3, 4, 5, 6, 7, "8+"];

  return (
    <div className="stat-mana-curve">
      <h4>Mana Curve</h4>
      <div className="curve-chart">
        {labels.map((label) => {
          const count = buckets[label] || 0;
          const height = (count / maxCount) * 100;
          return (
            <div
              key={label}
              className="curve-bar-wrapper"
              onMouseEnter={() => onHighlightCmc?.(label)}
              onMouseLeave={() => onHighlightCmc?.(null)}
              style={{ cursor: "pointer" }}
            >
              <div className="curve-bar-container">
                <div
                  className="curve-bar"
                  style={{ height: `${height}%` }}
                  title={`CMC ${label}: ${count} cards`}
                />
              </div>
              <span className="curve-label">{label}</span>
              <span className="curve-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Key Metrics ──────────────────────────────────────────── */
function KeyMetrics({ cards, commanders, onHighlightRole }) {
  const metrics = useMemo(() => {
    const nonLandNonCommander = cards.filter(
      (c) =>
        !c.is_commander && !(c.type_line || "").toLowerCase().includes("land"),
    );
    const avgCmc =
      nonLandNonCommander.length > 0
        ? (
            nonLandNonCommander.reduce(
              (s, c) => s + (c.cmc || 0) * (c.count || 1),
              0,
            ) / nonLandNonCommander.reduce((s, c) => s + (c.count || 1), 0)
          ).toFixed(2)
        : "0.00";

    const totalPrice = cards
      .reduce((s, c) => s + (Number(c.prices?.usd) || 0) * (c.count || 1), 0)
      .toFixed(2);

    const roles = countCardRoles(cards);

    const commanderIdentity = new Set();
    for (const c of commanders || []) {
      for (const color of c.color_identity || []) commanderIdentity.add(color);
    }
    const invalidCards = cards.filter((card) => {
      if (card.is_commander) return false;
      const id = card.color_identity;
      if (!id || id.length === 0) return false;
      return id.some((color) => color !== "C" && !commanderIdentity.has(color));
    });

    return {
      avgCmc,
      totalPrice,
      ...roles,
      invalidCount: invalidCards.reduce((s, c) => s + (c.count || 1), 0),
    };
  }, [cards, commanders]);

  const deckInfoItems = [
    { label: "Avg. CMC", value: metrics.avgCmc },
    { label: "Total Price", value: `$${metrics.totalPrice}` },
  ];

  const roleItems = [
    { label: "Draw", value: metrics.draw, role: "draw" },
    { label: "Ramp", value: metrics.ramp, role: "ramp" },
    { label: "Removal", value: metrics.removal, role: "removal" },
    { label: "Protection", value: metrics.protection, role: "protection" },
    { label: "Tutor", value: metrics.tutor, role: "tutor" },
    { label: "Recursion", value: metrics.recursion, role: "recursion" },
  ];

  if (metrics.invalidCount > 0) {
    roleItems.push({ label: "Invalid", value: metrics.invalidCount, warn: true });
  }

  return (
    <div className="key-metrics-wrapper">
      <div className="stat-deck-info">
        {deckInfoItems.map((item) => (
          <div
            key={item.label}
            className={`key-metric${item.warn ? " key-metric-warn" : ""}`}
          >
            <span className="key-metric-label">{item.label}</span>
            <span className="key-metric-value">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="stat-key-metrics">
        {roleItems.map((item) => (
          <div
            key={item.label}
            className={`key-metric${item.warn ? " key-metric-warn" : ""}`}
            onMouseEnter={() => item.role && onHighlightRole?.(item.role)}
            onMouseLeave={() => item.role && onHighlightRole?.(null)}
            style={item.role ? { cursor: "pointer" } : undefined}
          >
            <span className="key-metric-label">{item.label}</span>
            <span className="key-metric-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Type Distribution ────────────────────────────────────── */
function TypeDistribution({ cards, onHighlightType }) {
  const rows = useMemo(() => {
    const counts = {};
    let total = 0;
    for (const card of cards) {
      if (card.is_commander) continue;
      const cat = getTypeCategory(card);
      const qty = card.count || 1;
      counts[cat] = (counts[cat] || 0) + qty;
      total += qty;
    }
    return TYPE_CATEGORIES.map((cat) => {
      const count = counts[cat.key] || 0;
      if (count === 0) return null;
      return {
        key: cat.key,
        label: cat.label,
        count,
        pct: ((count / total) * 100).toFixed(1),
      };
    }).filter(Boolean);
  }, [cards]);

  if (rows.length === 0) {
    return (
      <div className="stat-type-distribution">
        <h4>Type Distribution</h4>
        <div className="pie-empty">No cards</div>
      </div>
    );
  }

  return (
    <div className="stat-type-distribution">
      <h4>Type Distribution</h4>
      <div className="type-dist-rows">
        {rows.map((row) => (
          <div
            key={row.label}
            className="type-dist-row"
            onMouseEnter={() => onHighlightType?.(row.key)}
            onMouseLeave={() => onHighlightType?.(null)}
            style={{ cursor: "pointer" }}
          >
            <span className="type-dist-name">{row.label}</span>
            <span className="type-dist-pct">{row.pct}%</span>
            <span className="type-dist-num">{row.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Export ──────────────────────────────────────────── */
export default function DeckStats({ cards, isOpen, onClose, onHighlight }) {
  const commanders = useMemo(
    () => cards.filter((c) => c.is_commander),
    [cards],
  );

  const commanderIdentity = useMemo(() => {
    const set = new Set();
    for (const c of commanders) {
      for (const color of c.color_identity || []) set.add(color);
    }
    return set;
  }, [commanders]);

  const manaPips = useMemo(() => {
    const counts = {};
    for (const card of cards) {
      const cardCounts = parseManaCost(card.mana_cost);
      const qty = card.count || 1;
      for (const [color, count] of Object.entries(cardCounts)) {
        counts[color] = (counts[color] || 0) + count * qty;
      }
    }
    return counts;
  }, [cards]);

  const manaProduced = useMemo(() => {
    const counts = {};
    for (const card of cards) {
      const cardCounts = parseManaProduced(card);
      const qty = card.count || 1;
      for (const [color, count] of Object.entries(cardCounts)) {
        counts[color] = (counts[color] || 0) + count * qty;
      }
    }
    // Only keep colors in the commander's identity
    if (commanderIdentity.size > 0) {
      const filtered = {};
      for (const color of Object.keys(counts)) {
        if (commanderIdentity.has(color) || color === "C") {
          filtered[color] = counts[color];
        }
      }
      return filtered;
    }
    return counts;
  }, [cards, commanderIdentity]);

  return (
    <div className={`stats-panel-wrapper ${isOpen ? "open" : ""}`}>
      <div className="stats-panel-inner">
        <div className="stats-panel-header">
          <h3 className="stats-title">Deck Statistics</h3>
          <button
            className="stats-panel-close"
            onClick={onClose}
            aria-label="Close stats"
          >
            ×
          </button>
        </div>
        <div className="stats-panel-scroll">
          <KeyMetrics
            cards={cards}
            commanders={commanders}
            onHighlightRole={(role) =>
              onHighlight(role ? { type: "role", role } : null)
            }
          />
          <div className="stats-grid">
            <ManaCurve
              cards={cards}
              onHighlightCmc={(label) =>
                onHighlight(label != null ? { type: "cmc", value: label } : null)
              }
            />
            <PieChart
              data={manaPips}
              title="Mana Cost (Pips)"
              onHighlightColor={(color) =>
                onHighlight(color ? { type: "manaCost", color } : null)
              }
            />
            <PieChart
              data={manaProduced}
              title="Mana Produced"
              onHighlightColor={(color) =>
                onHighlight(color ? { type: "manaProduced", color } : null)
              }
            />
            <TypeDistribution
              cards={cards}
              onHighlightType={(category) =>
                onHighlight(category ? { type: "type", category } : null)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
