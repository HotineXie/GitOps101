const STOP_WORDS = new Set([
  "about",
  "after",
  "before",
  "from",
  "into",
  "that",
  "this",
  "with",
  "will",
  "your",
  "while",
  "their",
  "there",
  "where",
  "when"
]);

export function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function slugifyText(value) {
  return normalizeText(value).replace(/\s+/g, "-");
}

export function extractKeywords(value, limit = 4) {
  const tokens = normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

  return [...new Set(tokens)].slice(0, limit);
}

export function joinOwners(owners) {
  if (!Array.isArray(owners) || owners.length === 0) {
    return "Unassigned";
  }

  if (owners.length === 1) {
    return owners[0];
  }

  return `${owners.slice(0, -1).join(", ")} and ${owners.at(-1)}`;
}
