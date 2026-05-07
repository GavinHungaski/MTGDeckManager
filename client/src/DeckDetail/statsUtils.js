/* ── Shared classification utilities ──────────────────────── */

export const MANA_COLORS = {
  W: { label: "White", fill: "#F0F2C0", stroke: "#D4C88A" },
  U: { label: "Blue", fill: "#67C1E8", stroke: "#4A9EC4" },
  B: { label: "Black", fill: "#ac6dcc", stroke: "#a162c0" },
  R: { label: "Red", fill: "#E85D50", stroke: "#C4473A" },
  G: { label: "Green", fill: "#4DB57A", stroke: "#3A9460" },
  C: { label: "Colorless", fill: "#CCC2C0", stroke: "#A89E9C" },
};

export const COLOR_ORDER = ["W", "U", "B", "R", "G", "C"];

/* ── Type categories (priority order) ─────────────────────── */
export const TYPE_CATEGORIES = [
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

export function getTypeCategory(card) {
  const tl = (card.type_line || "").toLowerCase();
  for (const cat of TYPE_CATEGORIES) {
    if (cat.check(tl)) return cat.key;
  }
  return "other";
}

/* ── Mana cost parsing ────────────────────────────────────── */
export function parseManaCost(manaCost) {
  if (!manaCost) return {};
  const counts = {};
  const matches = manaCost.match(/\{([^}]+)\}/g) || [];
  for (const match of matches) {
    const symbol = match.slice(1, -1);
    const color = symbol.replace(/\d+/g, "").replace(/\//g, "");
    if (MANA_COLORS[color]) {
      counts[color] = (counts[color] || 0) + 1;
    }
  }
  return counts;
}

/* ── Mana produced parsing ────────────────────────────────── */
export function parseManaProduced(card) {
  const counts = {};
  // Preserve original case for {T} matching, but use lowercase for word patterns
  const rawText = card.oracle_text || card.text || "";
  const text = rawText.toLowerCase();
  const typeLine = (card.type_line || "").toLowerCase();
  const isLand = typeLine.includes("land");

  if (isLand) {
    if (typeLine.includes("plains")) counts["W"] = (counts["W"] || 0) + 1;
    if (typeLine.includes("island")) counts["U"] = (counts["U"] || 0) + 1;
    if (typeLine.includes("swamp")) counts["B"] = (counts["B"] || 0) + 1;
    if (typeLine.includes("mountain")) counts["R"] = (counts["R"] || 0) + 1;
    if (typeLine.includes("forest")) counts["G"] = (counts["G"] || 0) + 1;
  }

  // Track which index ranges have been matched by orPattern to avoid double-counting
  // with simpleAdd. We collect all "add {X} or {Y}" spans first.
  const orRanges = [];
  const orPattern = /add\s*\{([wubrgc])\}[^.]*?or\s*\{([wubrgc])\}/gi;
  let m;
  while ((m = orPattern.exec(text)) !== null) {
    const c1 = m[1].toUpperCase();
    const c2 = m[2].toUpperCase();
    // A dual "or" source produces half a pip of each — caller picks one at a time
    counts[c1] = (counts[c1] || 0) + 0.5;
    counts[c2] = (counts[c2] || 0) + 0.5;
    orRanges.push([m.index, m.index + m[0].length]);
  }

  // "add {X}" — skip any match that falls inside an already-counted or-range
  const simpleAdd = /add\s*\{([wubrgc])\}/gi;
  while ((m = simpleAdd.exec(text)) !== null) {
    const inOrRange = orRanges.some(
      ([start, end]) => m.index >= start && m.index < end,
    );
    if (inOrRange) continue;
    const color = m[1].toUpperCase();
    counts[color] = (counts[color] || 0) + 1;
  }

  // "add one mana of any color" / "add mana of any color"
  if (/add\s+(one\s+)?mana\s+of\s+any\s+color/.test(text)) {
    for (const c of ["W", "U", "B", "R", "G"]) counts[c] = (counts[c] || 0) + 1;
  }

  // "add two mana of any one color" — fractional since it's conditional
  if (/add\s+two\s+mana\s+of\s+any\s+one\s+color/.test(text)) {
    for (const c of ["W", "U", "B", "R", "G"])
      counts[c] = (counts[c] || 0) + 0.5;
  }

  // Colorless: {C}
  const colorlessAdd = /add\s*\{c\}/gi;
  while ((m = colorlessAdd.exec(text)) !== null) {
    counts["C"] = (counts["C"] || 0) + 1;
  }

  // Wastes and similar lands that only tap for {C}
  if (isLand && Object.keys(counts).length === 0) {
    if (/\{t\}:\s*add\s+\{c\}/.test(text)) counts["C"] = (counts["C"] || 0) + 1;
  }

  return counts;
}

/* ── Strip reminder text (parentheticals) from oracle text ── */
function stripReminderText(text) {
  let result = "";
  let depth = 0;
  for (const char of text) {
    if (char === "(") depth++;
    else if (char === ")") depth--;
    else if (depth === 0) result += char;
  }
  return result.replace(/\s+/g, " ").trim();
}

/* ── Card role checks ─────────────────────────────────────── */
export function cardHasRole(card, role) {
  const rawText = card.oracle_text || card.text || "";
  const rawLower = rawText.toLowerCase();
  const typeLine = (card.type_line || "").toLowerCase();
  const text = stripReminderText(rawLower);
  const textPreserved = stripReminderText(rawText);

  switch (role) {
    case "draw": {
      const drawRegex =
        /draws? (?:a|two|three|four|five|six|seven|eight|nine|ten|x|\d+|that many) cards?/i;
      const selectionRegex =
        /look at the top [^.]* put (?:one|a|two|[^.]*) into your hand/i;
      if (/\bcycling \{/.test(text)) return false;
      return (
        (drawRegex.test(text) || selectionRegex.test(text)) &&
        !text.includes("opponent draws") &&
        !text.includes("each player draws") &&
        !text.includes("each opponent draws")
      );
    }

    case "ramp": {
      const isNotFetchLand = !typeLine.includes("land");
      const landSearch = /search your library for [^.]* land/i;
      const otherRampPatterns = [
        /\{T\}: Add (?:\{[\w/]+\})+/,
        /add (?:one |two |three |\d+ )?mana of any(?: one)? color/i,
        /spells you cast cost .* less to cast/i,
        /you may play an additional land/i,
        /whenever [^.]* tap [^.]* for mana, add/i,
        /creates? (?:a|one|two|\d+) (?:tapped )?treasure token/i,
        /add (?:\{[\w/]+\})+ for each/i,
        /add mana equal to/i,
      ];
      const isLandRamp = landSearch.test(textPreserved);
      const isOtherRamp = otherRampPatterns.some((p) => {
        if (p.source.includes("\\{T\\}")) return p.test(textPreserved);
        return p.test(text);
      });
      return isNotFetchLand && (isLandRamp || isOtherRamp);
    }

    case "removal": {
      const removalPatterns = [
        /(?:destroy|exile) target (?:[^,]* )?(?:creature|permanent|artifact|enchantment|land|planeswalker|nonland)/i,
        /(?:destroy|exile) all (?:[^,]* )?(?:creatures|artifacts|enchantments|permanents|nonland)/i,
        /deals? (?:\d+|X|\*) damage to (?:target|each) (?:creature|planeswalker|any target)/i,
        /gets? -(?:\d+|X)\/-(?:\d+|X)/i,
        /counter target (?:spell|activated|triggered)/i,
        /return target (?:[^,]* )?(?:creature|permanent) to its owner's hand/i,
        /(?:player|opponent) sacrifices (?:a|one|two|[^,]*) (?:creature|permanent|artifact|enchantment)/i,
        /(?:fights? target|damage equal to its power to target)/i,
        /enchanted creature loses all abilities and (?:is a|becomes)/i,
        /tap target (?:creature|permanent)[^.]*doesn't untap/i,
      ];
      return removalPatterns.some((p) => p.test(text));
    }

    case "protection": {
      const protectionPatterns = [
        /(?:has?|gain(?:s|ed)?|with)\s+(?:hexproof|shroud|indestructible|ward\s+(?:\d+|\{[\w/]+\}))/i,
        /\b(?:hexproof|shroud|indestructible)\b/i,
        /ward\s+(?:\d+|\{[\w/]+\})/i,
        /protection from/i,
        /prevent(?:s|ed|ing)? (?:all|that|\d+) damage (?:that would be dealt )?to (?:target |a )?(?:permanent|creature|player|planeswalker) you control/i,
        /redirect(?:s|ed)? .* damage/i,
        /return target (?:[^,]* )?(?:creature|permanent) you control to its owner's hand/i,
        /exile target (?:[^,]* )?(?:creature|permanent) you control[^.]*return/i,
        /\bregenerate\b/i,
        /counter target (?:spell|ability) [^.]* targeting [^.]* you control/i,
        /\btotem armor\b/i,
      ];
      return protectionPatterns.some((p) => p.test(text));
    }

    case "tutor": {
      const tutorPatterns = [
        /search your library for [^.]* put [^.]* (?:into your hand|on top of your library|into your graveyard|onto the battlefield)/i,
        /search your library for [^.]* reveal [^.]* put [^.]* (?:into your hand|on top of your library|onto the battlefield)/i,
        /search your library for [^.]* card [^.]* put it (?:into your hand|onto the battlefield)/i,
        /search your library for up to (?:one|two|three|four|\d+) cards?/i,
      ];
      const isTutor = tutorPatterns.some((p) => p.test(text));
      const isLandSearch = /search your library for [^.]* land/i.test(text);
      return isTutor && !isLandSearch;
    }

    case "recursion": {
      const recursionPatterns = [
        /return target [^.]* from (?:your|their) graveyard to your hand/i,
        /return target [^.]* from (?:your|their) graveyard to the battlefield/i,
        /put target [^.]* from (?:your|their) graveyard onto the battlefield/i,
        /choose target [^.]* in (?:your|their) graveyard[^.]*return the chosen card to (?:your hand|the battlefield)/i,
        /you may (?:cast|play) [^.]* from (?:your|a) graveyard/i,
        /may cast [^.]* from (?:your|a|their) graveyard/i,
        /puts? all cards (?:they|he or she) exiled this way onto the battlefield/i,
        /exiles all [^.]* from their graveyard[^.]*puts? all [^.]* onto the battlefield/i,
        /\bflashback\b/i,
        /\bjump-start\b/i,
        /\bunearth\b/i,
        /\bescape\b/i,
        /\bdredge\b/i,
        /\bdisturb\b/i,
        /return (?:up to )?(?:a|one|two|three|\d+) [^.]* (?:cards?|permanents?) from (?:your|their) graveyard/i,
        /return (?:another |a )?target [^.]* from (?:your|their) graveyard to (?:your hand|the battlefield)/i,
        /return to (?:your hand|the battlefield) target [^.]* (?:in|from) (?:your|their) graveyard/i,
      ];
      return recursionPatterns.some((p) => p.test(text));
    }

    default:
      return false;
  }
}

/* ── Single-card classification ───────────────────────────── */
export function classifyCard(card) {
  const result = {
    typeCategory: getTypeCategory(card),
    manaCostColors: Object.keys(parseManaCost(card.mana_cost)),
    manaProducedColors: Object.keys(parseManaProduced(card)),
    roles: [],
    cmc: card.cmc ?? 0,
  };
  for (const role of [
    "draw",
    "ramp",
    "removal",
    "protection",
    "tutor",
    "recursion",
  ]) {
    if (cardHasRole(card, role)) result.roles.push(role);
  }
  return result;
}

/* ── Deck-level role counts ───────────────────────────────── */
export function countCardRoles(cards) {
  let draw = 0;
  let ramp = 0;
  let removal = 0;
  let protection = 0;
  let tutor = 0;
  let recursion = 0;

  for (const card of cards) {
    const qty = card.count || 1;
    if (cardHasRole(card, "draw")) draw += qty;
    if (cardHasRole(card, "ramp")) ramp += qty;
    if (cardHasRole(card, "removal")) removal += qty;
    if (cardHasRole(card, "protection")) protection += qty;
    if (cardHasRole(card, "tutor")) tutor += qty;
    if (cardHasRole(card, "recursion")) recursion += qty;
  }

  return { draw, ramp, removal, protection, tutor, recursion };
}
