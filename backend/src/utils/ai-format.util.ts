/**
 * Utility helpers to post-process AI responses.
 * Keep formatting minimal and predictable for the frontend.
 */
export function formatAiAnswer(text: string): string {
  if (!text) return '';
  // Trim and collapse excessive blank lines
  let result = text.trim().replace(/\n{3,}/g, '\n\n');
  // Avoid leading/trailing backticks artifacts
  result = result.replace(/^```[\w-]*\s*/g, '').replace(/\s*```$/g, '');
  // Remove bold markers to keep plain text
  result = result.replace(/\*\*(.*?)\*\*/g, '$1');
  // Normalize bullet prefix to "- "
  result = result
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (/^[*-]\s+/.test(trimmed)) return '- ' + trimmed.replace(/^[*-]\s+/, '');
      return trimmed;
    })
    .join('\n');
  return result;
}

export function shorten(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

