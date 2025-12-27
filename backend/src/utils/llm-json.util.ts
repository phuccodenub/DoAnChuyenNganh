export type LlmJsonParseOptions = {
  /**
   * If true, require a JSON object/array to exist; otherwise return null.
   */
  required?: boolean;
  /**
   * If true, prefer extracting JSON from a markdown code fence.
   */
  preferCodeFence?: boolean;
};

const sanitize = (s: string) => (s ?? '').replace(/^\uFEFF/, '').trim();

const extractFromCodeFence = (input: string): string | null => {
  const fence = input.match(/```(?:json|javascript|js|ts|markdown|txt)?\s*([\s\S]*?)\s*```/i);
  return fence ? sanitize(fence[1]) : null;
};

/**
 * Robust extraction of first top-level JSON object/array with proper bracket matching,
 * ignoring brackets inside strings and escaped quotes.
 */
const extractFirstJson = (input: string): string => {
  const s = input;

  const startObj = s.indexOf('{');
  const startArr = s.indexOf('[');

  if (startObj === -1 && startArr === -1) {
    throw new Error('No JSON object/array found in response');
  }

  let startIdx: number;
  let openChar: '{' | '[';
  let closeChar: '}' | ']';

  if (startArr !== -1 && (startArr < startObj || startObj === -1)) {
    startIdx = startArr;
    openChar = '[';
    closeChar = ']';
  } else {
    startIdx = startObj;
    openChar = '{';
    closeChar = '}';
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < s.length; i++) {
    const c = s[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (c === '\\') {
      escape = true;
      continue;
    }

    if (c === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (c === openChar) depth++;
      if (c === closeChar) depth--;

      if (depth === 0) {
        return sanitize(s.slice(startIdx, i + 1));
      }
    }
  }

  throw new Error('Malformed JSON - no matching closing bracket');
};

/**
 * Parse JSON with small recovery attempts for common LLM mistakes.
 * Keep it conservative: do NOT aggressively "fix" JSON.
 */
export const safeJsonParse = <T = any>(jsonText: string): T => {
  try {
    return JSON.parse(jsonText) as T;
  } catch (e1) {
    // Attempt 1: remove trailing commas before } or ]
    const noTrailingCommas = jsonText.replace(/,\s*([}\]])/g, '$1');
    if (noTrailingCommas !== jsonText) {
      try {
        return JSON.parse(noTrailingCommas) as T;
      } catch {}
    }

    // Attempt 2: replace smart quotes with regular quotes
    const normalizedQuotes = jsonText.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
    if (normalizedQuotes !== jsonText) {
      try {
        return JSON.parse(normalizedQuotes) as T;
      } catch {}
    }

    throw e1;
  }
};

/**
 * Extract and parse the first JSON value (object/array) from an LLM response.
 */
export const parseJsonFromLlmText = <T = any>(
  text: string,
  options: LlmJsonParseOptions = {}
): T | null => {
  const raw = (text ?? '').toString();
  const { required = true, preferCodeFence = true } = options;

  try {
    const fromFence = preferCodeFence ? extractFromCodeFence(raw) : null;
    const jsonText = fromFence ? extractFirstJson(fromFence) : extractFirstJson(raw);
    return safeJsonParse<T>(jsonText);
  } catch (err) {
    if (required) throw err;
    return null;
  }
};
