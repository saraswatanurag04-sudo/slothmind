/**
 * Zero-Crash Payload Hygiene & Strict Undefined-Stripping
 * Strips all undefined properties recursively from objects before persisting to Firestore.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        sanitizedObj[key] = sanitizeForFirestore(value);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}
