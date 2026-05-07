import { useMemo } from "react";

const MANA_COLORS = {
  W: { label: "White", fill: "#F0F2C0", stroke: "#D4C88A" },
  U: { label: "Blue", fill: "#67C1E8", stroke: "#4A9EC4" },
  B: { label: "Black", fill: "#ac6dcc", stroke: "#a162c0" },
  R: { label: "Red", fill: "#E85D50", stroke: "#C4473A" },
  G: { label: "Green", fill: "#4DB57A", stroke: "#3A9460" },
  C: { label: "Colorless", fill: "#CCC2C0", stroke: "#A89E9C" },
};

const COLOR_ORDER = ["W", "U", "B", "R", "G", "C"];

/* ── Type categories (priority order) ─────────────────────── */
const TYPE_CATEGORIES = [
  {
    key: "lands",
    label: "Lands",
    check: (tl) => tl.includes("land"),
    color: "#8a7d65",
  },
  {
    key: "creatures",
    label: "Creatures",
    check: (tl) => tl.includes("creature"),
    color: "#e85d50",
  },
  {
    key: "instants",
    label: "Instants",
    check: (tl) => tl.includes("instant"),
    color: "#67C1E8",
  },
  {
    key: "sorceries",
    label: "Sorceries",
    check: (tl) => tl.includes("sorcery"),
    color: "#4DB57A",
  },
  {
    key: "artifacts",
    label: "Artifacts",
    check: (tl) => tl.includes("artifact"),
    color: "#CCC2C0",
  },
  {
    key: "enchantments",
    label: "Enchantments",
    check: (tl) => tl.includes("enchantment"),
    color: "#F0F2C0",
  },
  {
    key: "planeswalkers",
    label: "Planeswalkers",
    check: (tl) => tl.includes("planeswalker"),
    color: "#c9a84c",
  },
  { key: "other", label: "Other", check: () => true, color: "#555" },
];

function getTypeCategory(card) {
  const tl = (card.type_line || "").toLowerCase();
  for (const cat of TYPE_CATEGORIES) {
    if (cat.check(tl)) return cat.key;
  }
  return "other";
}

/* ── Mana cost parsing ────────────────────────────────────── */
function parseManaCost(manaCost) {
  if (!manaCost) return {};
  const counts = {};
  const matches = manaCost.match(/\{([^}]+)\}/g) || [];
  for (const match of matches) {
    const symbol = match.slice(1, -1);
    const color = symbol.replace(/\d+/g, "").replace(/\//g, "");
    if (MANA_COLORS[color] && color !== "C") {
      counts[color] = (counts[color] || 0) + 1;
    }
  }
  return counts;
}

/* ── Mana produced parsing ────────────────────────────────── */
function parseManaProduced(card) {
  const counts = {};
  const text = (card.oracle_text || card.text || "").toLowerCase();
  const typeLine = (card.type_line || "").toLowerCase();
  const isLand = typeLine.includes("land");

  if (isLand) {
    if (typeLine.includes("plains")) counts["W"] = (counts["W"] || 0) + 1;
    if (typeLine.includes("island")) counts["U"] = (counts["U"] || 0) + 1;
    if (typeLine.includes("swamp")) counts["B"] = (counts["B"] || 0) + 1;
    if (typeLine.includes("mountain")) counts["R"] = (counts["R"] || 0) + 1;
    if (typeLine.includes("forest")) counts["G"] = (counts["G"] || 0) + 1;
  }

  const simpleAdd = /add\s*\{([wubrgc])\}/gi;
  let m;
  while ((m = simpleAdd.exec(text)) !== null) {
    const color = m[1].toUpperCase();
    counts[color] = (counts[color] || 0) + 1;
  }

  if (/add\s+(one\s+)?mana\s+of\s+any\s+color/.test(text)) {
    for (const c of ["W", "U", "B", "R", "G"]) counts[c] = (counts[c] || 0) + 1;
  }
  if (/add\s+two\s+mana\s+of\s+any\s+one\s+color/.test(text)) {
    for (const c of ["W", "U", "B", "R", "G"])
      counts[c] = (counts[c] || 0) + 0.5;
  }

  const orPattern = /add\s*\{([wubrgc])\}.*?or\s*\{([wubrgc])\}/gi;
  while ((m = orPattern.exec(text)) !== null) {
    const c1 = m[1].toUpperCase();
    const c2 = m[2].toUpperCase();
    counts[c1] = (counts[c1] || 0) + 1;
    counts[c2] = (counts[c2] || 0) + 1;
  }

  const colorlessAdd = /add\s*\{c\}/gi;
  while ((m = colorlessAdd.exec(text)) !== null) {
    counts["C"] = (counts["C"] || 0) + 1;
  }

  if (isLand && Object.keys(counts).length === 0) {
    if (/\{t\}:\s*add\s+\{c\}/.test(text)) counts["C"] = (counts["C"] || 0) + 1;
  }

  return counts;
}

/* ── Draw / Ramp / Removal heuristics ─────────────────────── */
function countCardRoles(cards) {
  let draw = 0;
  let ramp = 0;
  let removal = 0;

  for (const card of cards) {
    const text = (card.oracle_text || card.text || "").toLowerCase();
    const typeLine = (card.type_line || "").toLowerCase();
    const qty = card.count || 1;

    // Draw
    const isDraw = (text) => {
      const drawRegex =
        /draws? (?:a|two|three|four|five|x|\d+|that many|cards?)/i;
      const selectionRegex =
        /look at the top .* put (?:one|a|two|.*) into your hand/i;
      // Exclude Cycling
      if (text.includes("Cycling {")) return false;
      return (
        (drawRegex.test(text) || selectionRegex.test(text)) &&
        !text.includes("opponent draws") &&
        !text.includes("each player draws")
      );
    };
    // Usage in your loop
    if (isDraw(text)) {
      draw += qty;
    }

    // Ramp
    const isNotFetchLand = !card.type_line.includes("Land");
    // 1. Specific Land Search (Requires "onto the battlefield")
    const landSearch =
      /search your library for .* land .* onto the battlefield/i;
    // 2. The Rest of the Ramp Patterns (No "battlefield" required)
    const otherRampPatterns = [
      /\{T\}: Add (?:\{[\w/]+\}|mana)/i, // Mana dorks/rocks ({T}: Add {G})
      /add (?:one )?mana of any color/i, // Fixing (Birds of Paradise)
      /spells you cast cost .* less to cast/i, // Reducers (Cloud Key)
      /you may play an additional land/i, // Extra drops (Exploration)
      /whenever .* tap .* for mana, add/i, // Doublers (Mana Reflection)
    ];
    // Determine if it's ramp
    const isLandRamp = landSearch.test(text);
    const isOtherRamp = otherRampPatterns.some((p) => p.test(text));
    if (isNotFetchLand && (isLandRamp || isOtherRamp)) {
      ramp += qty;
    }

    // Removal
    const removalPatterns = [
      // 1. Destroy / Exile (Catching adjectives like "nonland" or "attacking")
      /(?:destroy|exile) target (?:.* )?(?:creature|permanent|artifact|enchantment|land|planeswalker|nonland)/i,
      // 2. Board Wipes (Catching "all" effects)
      /(?:destroy|exile) all (?:.* )?(?:creatures|artifacts|enchantments|permanents|nonland)/i,
      // 3. Damage-based removal (Catches "5 damage" and "X damage")
      /deals? (?:[\d+|X]) damage to (?:target|each) (?:creature|planeswalker|any target)/i,
      // 4. Shrinking / Debuffs (Catches -N/-N effects)
      /gets? -[\d+|X]\/-[\d+|X]/i,
      // 5. Interaction / Bounce / Counters
      /counter target (?:spell|activated|triggered)/i,
      /return target (?:.* )?(?:creature|permanent) to its owner's hand/i,
      // 6. Sacrifice (Edicts)
      /(?:player|opponent) sacrifices (?:a|one|two|a|.*) (?:creature|permanent|artifact|enchantment)/i,
      // 7. Fight / Bite (Green's removal)
      /(?:fights target|damage equal to its power to target)/i,
      // 8. Transformation (Auras that "remove" the threat)
      /enchanted creature loses all abilities and (?:is a|becomes)/i,
    ];
    if (removalPatterns.some((p) => p.test(text))) {
      removal += qty;
    }
  }

  return { draw, ramp, removal };
}

/* ── Pie Chart ────────────────────────────────────────────── */
function PieChart({ data, title }) {
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
            <g key={`legend-${color}`} transform={`translate(10, ${y})`}>
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
                fill="none"
                stroke={MANA_COLORS[seg.color].fill}
                strokeWidth={radius * 0.75}
                strokeDasharray={`${dash} ${circumference - dash}`}
                transform={`rotate(${rotation})`}
                style={{ transition: "stroke-dasharray 0.3s ease" }}
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
function ManaCurve({ cards }) {
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
            <div key={label} className="curve-bar-wrapper">
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
function KeyMetrics({ cards, commanders }) {
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

  const items = [
    { label: "Avg. CMC", value: metrics.avgCmc },
    { label: "Total Price", value: `$${metrics.totalPrice}` },
    { label: "Draw", value: metrics.draw },
    { label: "Ramp", value: metrics.ramp },
    { label: "Removal", value: metrics.removal },
  ];

  if (metrics.invalidCount > 0) {
    items.push({ label: "Invalid", value: metrics.invalidCount, warn: true });
  }

  return (
    <div className="stat-key-metrics">
      {items.map((item) => (
        <div
          key={item.label}
          className={`key-metric${item.warn ? " key-metric-warn" : ""}`}
        >
          <span className="key-metric-label">{item.label}</span>
          <span className="key-metric-value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Type Distribution ────────────────────────────────────── */
function TypeDistribution({ cards }) {
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
          <div key={row.label} className="type-dist-row">
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
export default function DeckStats({ cards, isOpen, onClose }) {
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
        if (commanderIdentity.has(color)) {
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
          <KeyMetrics cards={cards} commanders={commanders} />
          <div className="stats-grid">
            <ManaCurve cards={cards} />
            <TypeDistribution cards={cards} />
            <PieChart data={manaPips} title="Mana Cost (Pips)" />
            <PieChart data={manaProduced} title="Mana Produced" />
          </div>
        </div>
      </div>
    </div>
  );
}
