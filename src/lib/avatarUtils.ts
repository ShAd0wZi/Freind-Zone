// Avatar system utility - supports emoji and custom images

export interface AvatarOption {
  id: string;
  displayValue: string; // emoji or URL
  label: string;
  type: "emoji" | "custom";
}

export const defaultAvatarEmojis: AvatarOption[] = [
  { id: "emoji-1", displayValue: "🎭", label: "Theater Mask", type: "emoji" },
  { id: "emoji-2", displayValue: "🃏", label: "Card Joker", type: "emoji" },
  { id: "emoji-3", displayValue: "🎪", label: "Circus", type: "emoji" },
  { id: "emoji-4", displayValue: "🎩", label: "Top Hat", type: "emoji" },
  { id: "emoji-5", displayValue: "🗡️", label: "Sword", type: "emoji" },
  { id: "emoji-6", displayValue: "💎", label: "Diamond", type: "emoji" },
  { id: "emoji-7", displayValue: "🔮", label: "Crystal Ball", type: "emoji" },
  { id: "emoji-8", displayValue: "🎲", label: "Dice", type: "emoji" },
];

/**
 * Check if avatar string is a custom image URL
 */
export function isCustomAvatar(avatar: string): boolean {
  return avatar.startsWith("http://") || 
         avatar.startsWith("https://") || 
         avatar.startsWith("data:");
}

/**
 * Get avatar type (emoji or custom)
 */
export function getAvatarType(avatar: string): "emoji" | "custom" {
  return isCustomAvatar(avatar) ? "custom" : "emoji";
}

/**
 * Validate custom avatar URL
 */
export async function validateCustomAvatarURL(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get random avatar from defaults (useful for new players)
 */
export function getRandomDefaultAvatar(): string {
  return defaultAvatarEmojis[
    Math.floor(Math.random() * defaultAvatarEmojis.length)
  ].displayValue;
}

/**
 * Get avatar at specific index (for deterministic avatar assignment)
 */
export function getDefaultAvatarByIndex(index: number): string {
  return defaultAvatarEmojis[index % defaultAvatarEmojis.length].displayValue;
}
