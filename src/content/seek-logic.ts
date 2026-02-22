/**
 * seek-logic.ts
 *
 * Pure functions for key parsing and video seeking.
 * Imported directly by tests; bundled into seek-controller.js via esbuild.
 */

export interface ParsedKey {
  key: string;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
}

export const DEFAULT_SETTINGS = {
  seekAmount: 5,
  backKey: 'Shift+J',
  forwardKey: 'Shift+L',
};

/**
 * Parse a human-readable key string into its components.
 *
 * Format: [Modifier+]...Key
 * Modifier names: Shift, Ctrl (or Control), Alt, Meta (or Cmd / Command)
 * Key: any KeyboardEvent.key value (single char or named key)
 *
 * For alphabetic single-char keys, when Shift is present the key is
 * normalized to uppercase, matching what the browser reports in event.key.
 *
 * @param keyString e.g. "Shift+J", "Ctrl+Shift+K", "ArrowLeft"
 */
export function parseKey(keyString: string): ParsedKey {
  const parts = keyString.split('+');
  const mods = { shift: false, ctrl: false, alt: false, meta: false };

  // All but the last part are modifier names.
  for (let i = 0; i < parts.length - 1; i++) {
    switch (parts[i].toLowerCase()) {
      case 'shift':                       mods.shift = true; break;
      case 'ctrl':
      case 'control':                     mods.ctrl  = true; break;
      case 'alt':                         mods.alt   = true; break;
      case 'meta':
      case 'cmd':
      case 'command':                     mods.meta  = true; break;
    }
  }

  let key = parts[parts.length - 1];

  // Normalize single alphabetic key to uppercase when Shift is set,
  // matching the browser's event.key value for shifted letters.
  if (mods.shift && key.length === 1 && /[a-z]/i.test(key)) {
    key = key.toUpperCase();
  }

  return { key, ...mods };
}

/**
 * Returns true if a KeyboardEvent matches the given key string.
 */
export function matchesKey(
  event: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'altKey' | 'metaKey'>,
  keyString: string
): boolean {
  const parsed = parseKey(keyString);
  return (
    event.key        === parsed.key   &&
    !!event.shiftKey === parsed.shift &&
    !!event.ctrlKey  === parsed.ctrl  &&
    !!event.altKey   === parsed.alt   &&
    !!event.metaKey  === parsed.meta
  );
}

const MODIFIER_KEYS = new Set(['shift', 'ctrl', 'control', 'alt', 'meta', 'cmd', 'command']);

/**
 * Returns true if `str` is a valid key binding string — i.e. it ends with a
 * non-modifier key (optionally preceded by one or more modifiers joined by +).
 */
export function isValidKeyString(str: unknown): boolean {
  if (!str || typeof str !== 'string') return false;
  const parts = str.split('+');
  const key   = parts[parts.length - 1];
  return key.length > 0 && !MODIFIER_KEYS.has(key.toLowerCase());
}

/**
 * Format a seek amount as a display label, e.g. 5 → "5", 2.5 → "2.5".
 * Always returns a positive label; direction is conveyed by the OSD layout.
 */
export function formatSeekLabel(seconds: number): string {
  return String(Math.abs(seconds));
}

/**
 * Seek a video element by `seconds` (positive = forward, negative = backward).
 * Clamps to 0; does not clamp at the upper end (browser handles that).
 */
export function applySeek(video: HTMLVideoElement, seconds: number): void {
  video.currentTime = Math.max(0, video.currentTime + seconds);
}
