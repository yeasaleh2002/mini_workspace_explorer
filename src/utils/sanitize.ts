export const MAX_ITEM_NAME_LENGTH = 255;

const FORBIDDEN_CHARACTERS_REGEX = /[<>:"/\\|?*`'\x00-\x1F\x7F]/g;

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function sanitizeItemName(rawName: string): string {
  if (typeof rawName !== 'string') {
    throw new ValidationError('Item name must be a string.');
  }

  let sanitized = rawName.normalize('NFKC');

  sanitized = sanitized.replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gim, '');
  sanitized = sanitized.replace(/<[^>]+>/g, '');
  sanitized = sanitized.replace(/^(javascript|data|vbscript):/i, '');
  sanitized = sanitized.replace(FORBIDDEN_CHARACTERS_REGEX, '');
  sanitized = sanitized.trim().replace(/^\.+/, '').replace(/\.+$/, '');

  if (!sanitized || sanitized.length === 0) {
    throw new ValidationError('Item name cannot be empty or consist solely of invalid characters.');
  }

  if (sanitized.length > MAX_ITEM_NAME_LENGTH) {
    throw new ValidationError(`Item name cannot exceed ${MAX_ITEM_NAME_LENGTH} characters.`);
  }

  return sanitized;
}

export function assertUniqueSiblingName(
  candidateName: string,
  existingSiblingNames: string[]
): void {
  const normalizedCandidate = candidateName.toLowerCase();
  const hasDuplicate = existingSiblingNames.some(
    (existing) => existing && existing.toLowerCase() === normalizedCandidate
  );

  if (hasDuplicate) {
    throw new ValidationError(`An item named "${candidateName}" already exists in this directory.`);
  }
}
